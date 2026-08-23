import {
  concerns as allConcerns,
  defaultProfile,
  pastPurchases,
  rewardCatalogue,
  rewardIngredients,
  type ConcernId,
  type SkinType,
} from "@/components/curator/data";
import { openGaps, scoreReward, tierRank } from "@/components/curator/scoring";
import systemPrompt from "@/prompts/system-prompt.md?raw";

export interface RecommendRequest {
  skinType: SkinType;
  concerns: ConcernId[];
  enjoys: ConcernId[];
  shelf: string[];
  points: number;
  /** Reward ids already in her bag — never recommend these again. */
  inBag?: string[];
  wish?: string | null;
}

export interface AiPick {
  rewardId: string;
  tier: "Best fit" | "Good fit" | "Okay fit";
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

  const inBag = new Set(input.inBag ?? []);
  const scored = rewardCatalogue
    .filter((reward) => !inBag.has(reward.id))
    .map((reward) => ({ reward, score: scoreReward(reward, scoreInput) }))
    .sort(
      (a, b) =>
        tierRank[a.score.tier] - tierRank[b.score.tier] ||
        Number(b.score.affordable) - Number(a.score.affordable) ||
        b.score.matchedConcerns.length - a.score.matchedConcerns.length ||
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
    `MEMBER PROFILE (declared in her Beauty Profile — source of truth)`,
    `Skin type: ${input.skinType}`,
    `Hair: ${defaultProfile.hairType}, ${defaultProfile.hairTexture}, ${defaultProfile.scalpType} scalp`,
    `Fragrance preference: ${defaultProfile.fragrance.type} — ${defaultProfile.fragrance.families.join(", ")}`,
    `Concerns: ${input.concerns.map(label).join(", ")}`,
    `Enjoys redeeming for: ${input.enjoys.map(label).join(", ")}`,
    `Points available: ${input.points}`,
    input.inBag?.length
      ? `Already in her bag (EXCLUDED from the catalogue below — never recommend these again): ${input.inBag.join(", ")}`
      : `Nothing in her bag yet.`,
    `Concerns her current shelves do NOT answer: ${gaps.length ? gaps.map(label).join(", ") : "none — every stated concern is covered"}`,
    ``,
    `SKINCREDIBLE SCAN (measured in store, ${defaultProfile.scan.date} at ${defaultProfile.scan.store}) — supporting evidence only`,
    `Overall skin score: ${defaultProfile.scan.score}/100`,
    ...defaultProfile.scan.metrics.map(
      (m) => `- ${m.title}: ${m.value}/100 (${m.status}) — ${m.note}`,
    ),
    `Routine steps she already follows: ${defaultProfile.scan.routineSteps.join(", ")}`,
    ``,
    `CURRENT SHELF (what she is using now)`,
    shelfLines || "- (empty shelf)",
    ``,
    `REWARD CATALOGUE — TOP CANDIDATES IN FULL DETAIL`,
    catalogueLines,
    ``,
    restLines ? `REST OF THE CATALOGUE (summary only — still selectable)\n${restLines}\n` : ``,
    input.wish?.trim()
      ? `WHAT SHE ASKED FOR, IN HER OWN WORDS: "${input.wish.trim()}"\nFirst classify this request: product-type-specific, brand-specific, or broad. Then size the answer (1-6 picks) accordingly. Weight the request heavily; if nothing in the catalogue matches it, say so honestly in the intro and pick the closest options.`
      : `She has not typed a specific request; recommend from her profile and shelf gaps. Return EXACTLY 3 picks.`,
  ].join("\n");
}

/**
 * The system prompt lives in src/prompts/system-prompt.md so it can be edited as
 * prose. Vite inlines it at build time via ?raw — no filesystem read at runtime.
 */
export const SYSTEM_PROMPT = systemPrompt.trim();

/** Deterministic picks used before/instead of the AI answer. */
export function rulePicks(input: RecommendRequest, limit = 3): AiPick[] {
  const { scored } = buildEvidence(input);
  const chosen: AiPick[] = [];
  const used = new Set<ConcernId>();
  const usable = scored;

  const push = (s: (typeof scored)[number]) => {
    chosen.push({
      rewardId: s.reward.id,
      tier: s.score.tier,
      reason: s.score.headline,
      routine: s.reward.routine,
      caution: s.reward.caution ?? null,
    });
  };

  for (const s of usable.filter((x) => x.score.matchedConcerns.length)) {
    if (chosen.length >= limit) break;
    if (s.score.matchedConcerns.some((c) => used.has(c))) continue;
    s.score.matchedConcerns.forEach((c) => used.add(c));
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
