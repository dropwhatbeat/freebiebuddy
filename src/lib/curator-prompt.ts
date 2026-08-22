import {
  concerns as allConcerns,
  pastPurchases,
  rewardCatalogue,
  type ConcernId,
  type SkinType,
} from "@/components/curator/data";
import { openGaps, scoreReward, tierRank } from "@/components/curator/scoring";

export interface RecommendRequest {
  skinType: SkinType;
  concerns: ConcernId[];
  enjoys: ConcernId[];
  shelf: string[];
  points: number;
  wish?: string | null;
}

export interface AiPick {
  rewardId: string;
  tier: "Best fit" | "Good fit" | "Not for your skin";
  reason: string;
  routine: string;
  caution?: string | null;
}

export interface RecommendResult {
  picks: AiPick[];
  intro: string;
  source: "ai" | "rules";
  note?: string;
}

const label = (id: ConcernId) => allConcerns.find((c) => c.id === id)?.label ?? id;

/** Rule-scored evidence for every reward, plus the ranking used as fallback. */
export function buildEvidence(input: RecommendRequest) {
  const scoreInput = {
    skinType: input.skinType,
    selectedConcerns: input.concerns,
    shelf: input.shelf,
    enjoys: input.enjoys,
    points: input.points,
  };

  const scored = rewardCatalogue
    .map((reward) => ({ reward, score: scoreReward(reward, scoreInput) }))
    .sort(
      (a, b) =>
        tierRank[a.score.tier] - tierRank[b.score.tier] ||
        Number(b.score.affordable) - Number(a.score.affordable) ||
        b.score.gapsClosed.length - a.score.gapsClosed.length ||
        a.reward.points - b.reward.points,
    );

  const gaps = openGaps(input.concerns, input.shelf);

  return { scored, gaps };
}

export function buildBrief(input: RecommendRequest) {
  const { scored, gaps } = buildEvidence(input);

  const shelfLines = pastPurchases
    .filter((p) => input.shelf.includes(p.id))
    .map(
      (p) =>
        `- ${p.id} · ${p.brand} ${p.name} (${p.category}) — covers ${p.covers.map(label).join(", ") || "nothing specific"}; actives: ${p.actives?.join(", ") || "none"}`,
    )
    .join("\n");

  const catalogueLines = scored
    .map(({ reward, score }) =>
      [
        `- ${reward.id} · ${reward.brand} ${reward.name} (${reward.category}, ${reward.points} pts, ${reward.tier})`,
        `  covers: ${reward.covers.map(label).join(", ")}`,
        `  routine: ${reward.routine}`,
        `  rule fit: ${score.tier} — ${score.headline}`,
        `  facts: ${score.lines.map((l) => `${l.label}: ${l.detail}`).join(" | ")}`,
        score.affordable ? `  affordable: yes` : `  affordable: no (${score.shortBy} pts short)`,
      ].join("\n"),
    )
    .join("\n");

  return [
    `MEMBER PROFILE`,
    `Skin type: ${input.skinType}`,
    `Concerns: ${input.concerns.map(label).join(", ")}`,
    `Enjoys redeeming for: ${input.enjoys.map(label).join(", ")}`,
    `Points available: ${input.points}`,
    `Concerns her current shelves do NOT answer: ${gaps.length ? gaps.map(label).join(", ") : "none — every stated concern is covered"}`,
    ``,
    `CURRENT SHELF (what she is using now)`,
    shelfLines || "- (empty shelf)",
    ``,
    `REWARD CATALOGUE WITH RULE-SCORED EVIDENCE`,
    catalogueLines,
    ``,
    input.wish?.trim()
      ? `WHAT SHE ASKED FOR, IN HER OWN WORDS: "${input.wish.trim()}" — weight this heavily; if nothing in the catalogue matches it, say so honestly in the intro and pick the closest options.`
      : `She has not typed a specific request; recommend from her profile and shelf gaps.`,
  ].join("\n");
}

export const SYSTEM_PROMPT = `You are Freebie Buddy, a warm, concise beauty-rewards curator for a Sephora Beauty Pass prototype.
Pick the three best rewards for this member and explain each in the first person ("I'd grab...", "I'd skip...").

Rules:
- Choose ONLY reward ids that appear in the catalogue.
- Prefer rewards that close a concern her current shelf does not answer; if nothing is missing, pick on skin type and the categories she enjoys.
- Prefer rewards she can afford with her points. Never recommend one that clashes with her skin type or an active on her shelf unless she explicitly asked for it — and then label it "Not for your skin".
- Spread picks across categories (skin/hair/makeup) when her concerns span them.
- Use the supplied rule-scored facts as ground truth. Do not invent ingredients, conflicts, or claims.
- reason: one or two short sentences, personal and specific, referencing her shelf or request.
- routine: one short sentence on where it slots into her routine.
- caution: only when there is a real thing to watch, otherwise null.
- intro: one or two sentences from you summarising why these three, referencing her request if she made one.`;

/** Deterministic picks used before/instead of the AI answer. */
export function rulePicks(input: RecommendRequest, limit = 3): AiPick[] {
  const { scored } = buildEvidence(input);
  const chosen: AiPick[] = [];
  const used = new Set<ConcernId>();
  const usable = scored.filter((s) => s.score.tier !== "Not for your skin");

  const push = (s: (typeof scored)[number]) => {
    chosen.push({
      rewardId: s.reward.id,
      tier: s.score.tier,
      reason: s.score.headline,
      routine: s.reward.routine,
      caution: s.reward.caution ?? null,
    });
  };

  for (const s of usable.filter((x) => x.score.gapsClosed.length)) {
    if (chosen.length >= limit) break;
    if (s.score.gapsClosed.some((c) => used.has(c))) continue;
    s.score.gapsClosed.forEach((c) => used.add(c));
    push(s);
  }
  for (const s of usable) {
    if (chosen.length >= limit) break;
    if (chosen.some((c) => c.rewardId === s.reward.id)) continue;
    push(s);
  }
  return chosen;
}

export function ruleIntro(input: RecommendRequest): string {
  const { gaps } = buildEvidence(input);
  return gaps.length
    ? `Here's what I'd pick for you — these close what your shelves are missing: ${gaps.map(label).join(", ").toLowerCase()}.`
    : `Nothing's missing from your shelves, so here's what I'd pick for your ${input.skinType.toLowerCase()} skin and the things you redeem most.`;
}

export const validRewardIds = new Set(rewardCatalogue.map((r) => r.id));
