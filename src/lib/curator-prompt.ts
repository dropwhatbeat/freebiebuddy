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

const stripHtml = (s: string) =>
  s
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

function rewardDetail(reward: (typeof rewardCatalogue)[number], score: ReturnType<typeof scoreReward>) {
  const actives = rewardIngredients[reward.id];
  const lines = [
    `- ${reward.id} · ${reward.brand} — ${reward.name}`,
    `  category: ${reward.category} | points: ${reward.points} | eligibility: ${reward.tier}`,
    `  covers concerns: ${reward.covers.map(label).join(", ") || "none tagged"}`,
    `  routine placement: ${reward.routine}`,
  ];
  if (reward.blurb) lines.push(`  editor's note: ${stripHtml(reward.blurb)}`);
  if (actives?.length)
    lines.push(`  key actives: ${actives.map((a) => `${a.name} — ${a.note}`).join(" | ")}`);
  if (reward.pairsWith?.length) lines.push(`  layers with shelf items: ${reward.pairsWith.join(", ")}`);
  if (reward.avoidFor?.length)
    lines.push(`  poor match for: ${reward.avoidFor.join(", ")} skin${reward.avoidReason ? ` — ${reward.avoidReason}` : ""}`);
  if (reward.conflictsWith?.length)
    lines.push(`  clashes with actives: ${reward.conflictsWith.join(", ")}${reward.conflictReason ? ` — ${reward.conflictReason}` : ""}`);
  if (reward.caution) lines.push(`  caution: ${reward.caution}`);
  lines.push(`  rule fit: ${score.tier} — ${score.headline}`);
  lines.push(`  facts: ${score.lines.map((l) => `${l.label}: ${l.detail}`).join(" | ")}`);
  lines.push(score.affordable ? `  affordable: yes` : `  affordable: no (${score.shortBy} pts short)`);
  return lines.join("\n");
}

const DETAILED_COUNT = 18;

export function buildBrief(input: RecommendRequest) {
  const { scored, gaps } = buildEvidence(input);

  const shelfLines = pastPurchases
    .filter((p) => input.shelf.includes(p.id))
    .map(
      (p) =>
        `- ${p.id} · ${p.brand} — ${p.name} (${p.category}) — covers ${p.covers.map(label).join(", ") || "nothing specific"}; actives: ${p.actives?.join(", ") || "none listed"}`,
    )
    .join("\n");

  const detailed = scored.slice(0, DETAILED_COUNT);
  const rest = scored.slice(DETAILED_COUNT);

  const catalogueLines = detailed.map(({ reward, score }) => rewardDetail(reward, score)).join("\n");
  const restLines = rest
    .map(
      ({ reward, score }) =>
        `- ${reward.id} · ${reward.brand} ${reward.name} (${reward.category}, ${reward.points} pts, ${reward.tier}) — covers ${reward.covers.map(label).join(", ") || "none"}; rule fit ${score.tier}${score.affordable ? "" : `; ${score.shortBy} pts short`}`,
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
    `REWARD CATALOGUE — TOP CANDIDATES IN FULL DETAIL`,
    catalogueLines,
    ``,
    restLines ? `REST OF THE CATALOGUE (summary only — still selectable)\n${restLines}\n` : ``,
    input.wish?.trim()
      ? `WHAT SHE ASKED FOR, IN HER OWN WORDS: "${input.wish.trim()}" — weight this heavily; if nothing in the catalogue matches it, say so honestly in the intro and pick the closest options.`
      : `She has not typed a specific request; recommend from her profile and shelf gaps.`,
  ].join("\n");
}

export const SYSTEM_PROMPT = `You are Freebie Buddy, a warm, concise beauty-rewards curator for a Sephora Beauty Pass prototype.
Recommend the rewards that genuinely earn a place for this member and explain each in the first person ("I'd grab...", "I'd skip...").

How many picks:
- Return between 1 and 6 picks — however many actually fit. Never pad.
- A narrow request ("something for my frizzy ends") usually deserves 1-2 picks.
- A broad request or concerns spanning skin, hair and makeup can justify 4-6.
- Quality over count: one excellent pick beats three mediocre ones.

Rules:
- Choose ONLY reward ids that appear in the catalogue (detailed or summary list).
- Prefer rewards that close a concern her current shelf does not answer; if nothing is missing, pick on skin type and the categories she enjoys.
- Prefer rewards she can afford with her points. Never recommend one that clashes with her skin type or an active on her shelf unless she explicitly asked for it — and then label it "Not for your skin".
- Use the supplied product details (editor's note, key actives, routine placement, cautions) and rule-scored facts as ground truth. Do not invent ingredients, conflicts, or claims.
- reason: two or three short sentences, personal and specific. Every reason MUST name at least one concrete detail — a named active or ingredient, a product already on her shelf, or her typed request.
- routine: one short sentence on where it slots into her routine, grounded in the product's routine placement.
- caution: only when there is a real thing to watch, otherwise null.
- intro: one or two sentences from you summarising this set — do not assume a fixed number of picks; reference her request if she made one.`;

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
