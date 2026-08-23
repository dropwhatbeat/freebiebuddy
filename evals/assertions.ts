/**
 * Checkers for the eval set. Every one of these is code, not an LLM judge.
 * Whatever code can check gets checked here, which leaves tone and voice as the
 * only things a judge would ever be needed for.
 */
import {
  pastPurchases,
  rewardCatalogue,
  rewardIngredients,
  type Category,
} from "@/components/curator/data";
import type { AiPick, RecommendRequest, RecommendResult } from "@/lib/curator-prompt";

export type Expectation =
  | { kind: "pickCount"; exactly?: number; min?: number; max?: number }
  | { kind: "onlyCategory"; category: Category }
  | { kind: "coversCategories"; categories: Category[] }
  | { kind: "onlyBrand"; brand: string }
  | { kind: "introMentions"; text: string }
  | { kind: "includesReward"; rewardId: string }
  | { kind: "grounded" };

export interface CheckResult {
  label: string;
  pass: boolean;
  detail: string;
}

const byId = new Map(rewardCatalogue.map((r) => [r.id, r]));
const norm = (s: string) => s.toLowerCase();

/** Words worth matching on. Drops short filler so "a" and "for" cannot count as grounding. */
const contentWords = (s: string) =>
  norm(s)
    .split(/[^a-z0-9-]+/)
    .filter((w) => w.length >= 4);

/**
 * Actives on her shelf that a reward's conflictsWith list would clash with, plus
 * a skin-type mismatch. This is what triggers the disclosure requirement, and it
 * runs here in code so the model never has to notice the clash itself.
 */
export function conflictsFor(pick: AiPick, input: RecommendRequest): string[] {
  const reward = byId.get(pick.rewardId);
  if (!reward) return [];
  const shelfActives = new Set(
    pastPurchases
      .filter((p) => input.shelf.includes(p.id))
      .flatMap((p) => p.actives ?? [])
      .map(norm),
  );
  const clashes = (reward.conflictsWith ?? []).filter((a) => shelfActives.has(norm(a)));
  if ((reward.avoidFor ?? []).includes(input.skinType)) clashes.push(`${input.skinType} skin`);
  return clashes;
}

/** Runs on every case. Every id the model returns has to exist in the catalogue. */
export function checkIdsValid(result: RecommendResult): CheckResult {
  const bad = result.picks.filter((p) => !byId.has(p.rewardId)).map((p) => p.rewardId);
  return {
    label: "allIdsValid",
    pass: bad.length === 0,
    detail: bad.length ? `unknown ids: ${bad.join(", ")}` : `${result.picks.length} ids ok`,
  };
}

/**
 * Runs on every case. A pick that clashes with her skin type or a shelf active
 * has to say so, either in its own caution or in the intro. The UI only shows a
 * caution on hover, so the intro is what she sees by default.
 */
export function checkDisclosure(result: RecommendResult, input: RecommendRequest): CheckResult {
  const offenders: string[] = [];
  let checked = 0;
  for (const pick of result.picks) {
    const clashes = conflictsFor(pick, input);
    if (!clashes.length) continue;
    checked += 1;
    const said = `${pick.caution ?? ""} ${result.intro}`.toLowerCase();
    const named = clashes.some((c) => contentWords(c).some((w) => said.includes(w)));
    if (!named) offenders.push(`${pick.rewardId} (clashes: ${clashes.join(", ")})`);
  }
  return {
    label: "disclosesConflict",
    pass: offenders.length === 0,
    detail:
      checked === 0
        ? "no conflicting picks"
        : offenders.length
          ? offenders.join("; ")
          : `${checked} disclosed`,
  };
}

/**
 * The prompt requires every reason to name at least one concrete detail. A key
 * active, a shelf item the reward pairs with, the reward's own name or brand, or
 * a content word from her request all satisfy it.
 */
function checkGrounded(result: RecommendResult, input: RecommendRequest): CheckResult {
  const wishWords = input.wish ? contentWords(input.wish) : [];
  const ungrounded: string[] = [];
  for (const pick of result.picks) {
    const reward = byId.get(pick.rewardId);
    if (!reward) continue;
    const anchors = [
      ...(rewardIngredients[reward.id] ?? []).map((a) => a.name),
      ...(reward.pairsWith ?? []).flatMap((id) => {
        const p = pastPurchases.find((x) => x.id === id);
        return p ? [p.name, p.brand] : [];
      }),
      reward.name,
      reward.brand,
    ].flatMap(contentWords);
    const reason = norm(pick.reason);
    const hit = [...anchors, ...wishWords].some((w) => reason.includes(w));
    if (!hit) ungrounded.push(pick.rewardId);
  }
  return {
    label: "grounded",
    pass: ungrounded.length === 0,
    detail: ungrounded.length
      ? `no concrete detail: ${ungrounded.join(", ")}`
      : `${result.picks.length} reasons grounded`,
  };
}

export function check(
  exp: Expectation,
  result: RecommendResult,
  input: RecommendRequest,
): CheckResult {
  const picks = result.picks;
  const rewards = picks.map((p) => byId.get(p.rewardId)).filter((r) => r !== undefined);

  switch (exp.kind) {
    case "pickCount": {
      const n = picks.length;
      const okExact = exp.exactly === undefined || n === exp.exactly;
      const okMin = exp.min === undefined || n >= exp.min;
      const okMax = exp.max === undefined || n <= exp.max;
      const want =
        exp.exactly !== undefined ? `exactly ${exp.exactly}` : `${exp.min ?? 0}–${exp.max ?? "∞"}`;
      return { label: `pickCount ${want}`, pass: okExact && okMin && okMax, detail: `got ${n}` };
    }
    case "onlyCategory": {
      const off = rewards.filter((r) => r.category !== exp.category);
      return {
        label: `onlyCategory ${exp.category}`,
        pass: off.length === 0 && rewards.length > 0,
        detail: off.length
          ? `off-type: ${off.map((r) => `${r.id}:${r.category}`).join(", ")}`
          : "all on-type",
      };
    }
    case "coversCategories": {
      const present = new Set(rewards.map((r) => r.category));
      const missing = exp.categories.filter((c) => !present.has(c));
      return {
        label: `coversCategories ${exp.categories.join("+")}`,
        pass: missing.length === 0,
        detail: missing.length ? `missing: ${missing.join(", ")}` : "all covered",
      };
    }
    case "onlyBrand": {
      const off = rewards.filter((r) => norm(r.brand) !== norm(exp.brand));
      return {
        label: `onlyBrand ${exp.brand}`,
        pass: off.length === 0 && rewards.length > 0,
        detail: off.length ? `off-brand: ${off.map((r) => r.brand).join(", ")}` : "all on-brand",
      };
    }
    case "introMentions": {
      const pass = norm(result.intro).includes(norm(exp.text));
      return {
        label: `introMentions "${exp.text}"`,
        pass,
        detail: pass ? "mentioned" : `intro did not mention it`,
      };
    }
    case "includesReward": {
      const pass = picks.some((p) => p.rewardId === exp.rewardId);
      return {
        label: `includesReward ${exp.rewardId}`,
        pass,
        detail: pass ? "present" : `got ${picks.map((p) => p.rewardId).join(", ") || "none"}`,
      };
    }
    case "grounded":
      return checkGrounded(result, input);
  }
}
