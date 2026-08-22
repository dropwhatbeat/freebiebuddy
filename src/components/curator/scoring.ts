import {
  concerns as allConcerns,
  pastPurchases,
  type Category,
  type ConcernId,
  type Reward,
  type SkinType,
} from "./data";

export type FitTier = "Best fit" | "Good fit" | "Okay fit";

export interface ScoreInput {
  skinType: SkinType;
  selectedConcerns: ConcernId[];
  /** Kept for callers/LLM context — fit scoring itself ignores the shelf. */
  shelf: string[];
  enjoys: ConcernId[];
  points: number;
}

export interface ScoreLine {
  label: string;
  detail: string;
  weight: "positive" | "neutral" | "negative";
}

export interface Score {
  tier: FitTier;
  /** 0-3 lit segments on the meter. */
  segments: number;
  headline: string;
  lines: ScoreLine[];
  /** Concerns from her profile this reward answers. */
  matchedConcerns: ConcernId[];
  affordable: boolean;
  shortBy: number;
}

const label = (id: ConcernId) => allConcerns.find((c) => c.id === id)?.label ?? id;
export const concernCategory = (id: ConcernId): Category =>
  allConcerns.find((c) => c.id === id)?.category ?? "Skin";

/** Concerns the current shelf does not answer. Used for LLM context, not for fit scoring. */
export function openGaps(selectedConcerns: ConcernId[], shelf: string[]): ConcernId[] {
  const covered = new Set(
    pastPurchases.filter((p) => shelf.includes(p.id)).flatMap((p) => p.covers),
  );
  return selectedConcerns.filter((c) => !covered.has(c));
}

/**
 * Priority weight for a concern: earlier in her profile = higher priority.
 * First concern ~1.0, tapering to ~0.4 for the last one.
 */
function priorityWeight(id: ConcernId, selected: ConcernId[]): number {
  const i = selected.indexOf(id);
  if (i < 0) return 0;
  const n = Math.max(1, selected.length - 1);
  return 1 - 0.6 * (i / n);
}

const BEST_THRESHOLD = 1.60;
const GOOD_THRESHOLD = 1.20;

export function scoreReward(reward: Reward, input: ScoreInput): Score {
  const matchedConcerns = reward.covers.filter((c) => input.selectedConcerns.includes(c));
  const loved = reward.covers.filter((c) => input.enjoys.includes(c));
  const suitsSkin = !(reward.avoidFor ?? []).includes(input.skinType);

  // Ranked by how much she cares about each matched concern.
  const ranked = [...matchedConcerns].sort(
    (a, b) => priorityWeight(b, input.selectedConcerns) - priorityWeight(a, input.selectedConcerns),
  );

  // 1. Priority-weighted concern match, with diminishing returns per extra match.
  let value = 0;
  ranked.forEach((c, i) => {
    value += priorityWeight(c, input.selectedConcerns) * (i === 0 ? 1 : i === 1 ? 0.45 : 0.2);
  });

  // 2. Focus: a reward that mostly speaks to her concerns beats one that grazes them.
  const focus = reward.covers.length ? matchedConcerns.length / reward.covers.length : 0;
  value += focus * 0.25;

  // 3. Skin-type suitability.
  value += suitsSkin ? 0.1 : -0.55;

  // 4. Things she already reaches for — a nudge, never enough on its own.
  if (loved.length) value += 0.2;

  // 5. Nothing relevant at all pulls it down.
  if (!matchedConcerns.length && !loved.length) value -= 0.25;

  const lines: ScoreLine[] = [];

  if (matchedConcerns.length) {
    lines.push({
      label: "Answers your concerns",
      detail: `Works on ${ranked.map(label).join(" and ").toLowerCase()} from your beauty profile.`,
      weight: "positive",
    });
  } else if (loved.length) {
    lines.push({
      label: "Matches what you redeem",
      detail: `${loved.map(label).join(", ")} is what you reach for most.`,
      weight: "positive",
    });
  } else {
    lines.push({
      label: "Something new",
      detail: "It isn't tied to a concern you've flagged — worth a try if you're curious.",
      weight: "neutral",
    });
  }

  if (reward.avoidFor?.length || reward.category === "Skin") {
    lines.push(
      suitsSkin
        ? {
            label: `${input.skinType} skin`,
            detail: "Texture and finish suit your skin type.",
            weight: "positive",
          }
        : {
            label: `${input.skinType} skin`,
            detail: reward.avoidReason ?? "The texture may not be ideal for your skin type.",
            weight: "negative",
          },
    );
  }

  const affordable = reward.points <= input.points;
  lines.push(
    affordable
      ? {
          label: "Within balance",
          detail: `${reward.points.toLocaleString()} of your ${input.points.toLocaleString()} points.`,
          weight: "positive",
        }
      : {
          label: "Short on points",
          detail: `${(reward.points - input.points).toLocaleString()} points away.`,
          weight: "negative",
        },
  );

  let tier: FitTier;
  if (value >= BEST_THRESHOLD && matchedConcerns.length > 0 && suitsSkin) {
    tier = "Best fit";
  } else if (value >= GOOD_THRESHOLD) {
    tier = "Good fit";
  } else {
    tier = "Okay fit";
  }

  const top = ranked[0];
  let headline: string;
  if (tier === "Best fit") {
    headline = `Made for ${ranked.slice(0, 2).map(label).join(" and ").toLowerCase()} — top of your beauty profile.`;
  } else if (tier === "Good fit") {
    headline = top
      ? `Helps with ${label(top).toLowerCase()}, a secondary note on your profile.`
      : loved.length
        ? `More of the ${loved.map(label).join(", ").toLowerCase()} you already redeem.`
        : "A solid pick, just not tied to a stated concern.";
  } else if (!suitsSkin) {
    headline =
      reward.avoidReason ??
      `Not the obvious match for ${input.skinType.toLowerCase()} skin — nothing stopping you from trying.`;
  } else {
    headline = top
      ? `Only lightly touches ${label(top).toLowerCase()} — try it if you're curious.`
      : "Outside what you've flagged — nothing stopping you from trying.";
  }

  return {
    tier,
    segments: tier === "Best fit" ? 3 : tier === "Good fit" ? 2 : 1,
    headline,
    lines,
    matchedConcerns,
    affordable,
    shortBy: Math.max(0, reward.points - input.points),
  };
}


export const tierRank: Record<FitTier, number> = {
  "Best fit": 0,
  "Good fit": 1,
  "Okay fit": 2,
};
