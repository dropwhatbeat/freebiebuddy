import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

import type { ConcernId, SkinType } from "@/components/curator/data";
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
  tier: z.enum(["Best fit", "Good fit", "Not for your skin"]),
  reason: z.string(),
  routine: z.string(),
  caution: z.string().nullable(),
});

const AnswerSchema = z.object({
  intro: z.string(),
  picks: z.array(PickSchema),
});

interface RawInput {
  skinType: SkinType;
  concerns: string[];
  enjoys: string[];
  shelf: string[];
  points: number;
  wish?: string | null | undefined;
}

export async function recommendRewardsWithAi(raw: RawInput): Promise<RecommendResult> {
  const input: RecommendRequest = {
    skinType: raw.skinType,
    concerns: raw.concerns as ConcernId[],
    enjoys: raw.enjoys as ConcernId[],
    shelf: raw.shelf,
    points: raw.points,
    wish: raw.wish ?? null,
  };

  const fallback = (note?: string): RecommendResult => ({
    picks: rulePicks(input),
    intro: ruleIntro(input),
    source: "rules",
    ...(note ? { note } : {}),
  });

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return fallback("AI scoring is unavailable right now — showing rule-based picks.");

  const gateway = createLovableAiGatewayProvider(apiKey);

  try {
    const result = streamText({
      model: gateway("google/gemini-3.7-flash"),
      system: SYSTEM_PROMPT,
      prompt: buildBrief(input),
      output: Output.object({ schema: AnswerSchema }),
    });

    const answer = await result.output;

    const picks: AiPick[] = answer.picks
      .filter((p) => validRewardIds.has(p.rewardId))
      .filter((p, i, arr) => arr.findIndex((x) => x.rewardId === p.rewardId) === i)
      .slice(0, 3);

    if (!picks.length) return fallback();

    // Top up from the rule ranking if the model returned fewer than three.
    for (const p of rulePicks(input)) {
      if (picks.length >= 3) break;
      if (!picks.some((x) => x.rewardId === p.rewardId)) picks.push(p);
    }

    return { picks, intro: answer.intro, source: "ai" };
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) return fallback();

    const message = error instanceof Error ? error.message : "";
    if (message.includes("402")) {
      return fallback("AI credits are exhausted — showing rule-based picks.");
    }
    if (message.includes("429")) {
      return fallback("Freebie Buddy is rate limited — showing rule-based picks.");
    }
    return fallback("Freebie Buddy couldn't reach the AI just now — showing rule-based picks.");
  }
}
