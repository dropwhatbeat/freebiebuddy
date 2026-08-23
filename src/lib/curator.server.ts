import { NoObjectGeneratedError, Output, streamText, type LanguageModel } from "ai";
import { z } from "zod";

import type { ConcernId, SkinType } from "@/components/curator/data";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import {
  SYSTEM_PROMPT,
  buildBrief,
  ruleIntro,
  rulePicks,
  validRewardIds,
  type AiPick,
  type RecommendRequest,
  type RecommendResult,
} from "./curator-prompt";

const PickSchema = z.object({
  rewardId: z.string(),
  tier: z.enum(["Best fit", "Good fit", "Okay fit"]),
  reason: z.string(),
  routine: z.string(),
  caution: z.string().nullable(),
});

const AnswerSchema = z.object({
  intro: z.string(),
  picks: z.array(PickSchema),
});

interface Provider {
  name: string;
  model: LanguageModel;
}

// Tries your own Gemini key first (billed to your Google account), then falls
// back to the Lovable AI gateway (billed as Lovable credits) if that call fails.
function resolveProviders(): Provider[] {
  const providers: Provider[] = [];

  const googleApiKey = process.env["GOOGLE_GENERATIVE_AI_API_KEY"];
  if (googleApiKey) {
    const modelId = process.env["GEMINI_MODEL"] ?? "gemini-3.6-flash";
    const google = createGoogleGenerativeAI({ apiKey: googleApiKey });
    providers.push({ name: `google:${modelId}`, model: google(modelId) });
  }

  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  if (lovableApiKey) {
    const gateway = createLovableAiGatewayProvider(lovableApiKey, undefined, {
      structuredOutputs: true,
    });
    providers.push({
      name: "lovable-gateway:google/gemini-3.7-flash",
      model: gateway("google/gemini-3.7-flash"),
    });
  }

  return providers;
}

interface RawInput {
  skinType: SkinType;
  concerns: string[];
  enjoys: string[];
  shelf: string[];
  points: number;
  inBag?: string[] | undefined;
  wish?: string | null | undefined;
}

export async function recommendRewardsWithAi(raw: RawInput): Promise<RecommendResult> {
  const input: RecommendRequest = {
    skinType: raw.skinType,
    concerns: raw.concerns as ConcernId[],
    enjoys: raw.enjoys as ConcernId[],
    shelf: raw.shelf,
    points: raw.points,
    inBag: raw.inBag ?? [],
    wish: raw.wish ?? null,
  };

  const fallback = (note?: string): RecommendResult => ({
    picks: rulePicks(input),
    intro: ruleIntro(input),
    source: "rules",
    ...(note ? { note } : {}),
  });

  const providers = resolveProviders();
  if (!providers.length) {
    console.warn("[curator] no AI key configured — using rule-based picks");
    return fallback("AI scoring is unavailable right now — showing rule-based picks.");
  }

  const hasWish = Boolean(input.wish?.trim());
  const maxPicks = hasWish ? 6 : 3;
  let lastError: unknown = null;
  // A provider answered, but produced nothing usable (no structured output, or
  // only reward ids that aren't in the catalogue). Not an outage — stays silent.
  let unusableAnswer = false;

  for (const [index, provider] of providers.entries()) {
    const next = providers[index + 1]?.name;
    try {
      console.info(`[curator] provider=${provider.name}`);

      const result = streamText({
        model: provider.model,
        system: SYSTEM_PROMPT,
        prompt: buildBrief(input),
        output: Output.object({ schema: AnswerSchema }),
      });

      const answer = await result.output;

      const bag = new Set(input.inBag ?? []);
      const picks: AiPick[] = answer.picks
        .filter((p) => validRewardIds.has(p.rewardId) && !bag.has(p.rewardId))
        .filter((p, i, arr) => arr.findIndex((x) => x.rewardId === p.rewardId) === i)
        .slice(0, maxPicks);

      if (!picks.length) {
        unusableAnswer = true;
        console.warn(`[curator] ${provider.name} returned no valid reward ids`);
        if (next) console.warn(`[curator] falling back to ${next}`);
        continue;
      }

      // No typed request: always present exactly 3 picks, topped up from rule ranking.
      if (!hasWish && picks.length < 3) {
        for (const extra of rulePicks(input, 6)) {
          if (picks.length >= 3) break;
          if (picks.some((p) => p.rewardId === extra.rewardId)) continue;
          picks.push(extra);
        }
      }

      return { picks, intro: answer.intro, source: "ai" };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        unusableAnswer = true;
        console.warn(`[curator] ${provider.name} produced no structured output`);
      } else {
        lastError = error;
        console.error(
          `[curator] ${provider.name} failed:`,
          error instanceof Error ? error.message : "",
        );
      }
      if (next) console.warn(`[curator] falling back to ${next}`);
    }
  }

  // Every provider is exhausted. A real outage explains itself; an unusable
  // answer from a reachable provider falls back quietly.
  const message = lastError instanceof Error ? lastError.message : "";
  if (message.includes("402")) {
    return fallback("AI credits are exhausted — showing rule-based picks.");
  }
  if (message.includes("429")) {
    return fallback("Freebie Buddy is rate limited — showing rule-based picks.");
  }
  if (lastError) {
    return fallback("Freebie Buddy couldn't reach the AI just now — showing rule-based picks.");
  }
  if (unusableAnswer) return fallback();
  return fallback("Freebie Buddy couldn't reach the AI just now — showing rule-based picks.");
}
