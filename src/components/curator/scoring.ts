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

export function scoreReward(reward: Reward, input: ScoreInput): Score {
  const matchedConcerns = reward.covers.filter((c) => input.selectedConcerns.includes(c));
  const loved = reward.covers.filter((c) => input.enjoys.includes(c));
  const suitsSkin = !(reward.avoidFor ?? []).includes(input.skinType);

  const lines: ScoreLine[] = [];

  if (matchedConcerns.length) {
    lines.push({
      label: "Answers your concerns",
      detail: `Works on ${matchedConcerns.map(label).join(" and ").toLowerCase()} from your beauty profile.`,
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
  let headline: string;

  if (matchedConcerns.length && suitsSkin) {
    tier = "Best fit";
    headline = `Made for ${matchedConcerns.map(label).join(" and ").toLowerCase()} — one of your stated concerns.`;
  } else if (loved.length && suitsSkin) {
    tier = "Good fit";
    headline = `More of the ${loved.map(label).join(", ").toLowerCase()} you already redeem.`;
  } else if (suitsSkin) {
    tier = "Good fit";
    headline = "Nothing against it — it just isn't answering a stated concern.";
  } else {
    tier = "Okay fit";
    headline =
      reward.avoidReason ?? `Not the obvious match for ${input.skinType.toLowerCase()} skin, but nothing stopping you.`;
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
