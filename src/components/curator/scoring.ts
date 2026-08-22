import {
  concerns as allConcerns,
  pastPurchases,
  type Category,
  type ConcernId,
  type Reward,
  type SkinType,
} from "./data";

export type FitTier = "Best fit" | "Good fit" | "Not for your skin";

export interface ScoreInput {
  skinType: SkinType;
  selectedConcerns: ConcernId[];
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
  gapsClosed: ConcernId[];
  affordable: boolean;
  shortBy: number;
}

const label = (id: ConcernId) => allConcerns.find((c) => c.id === id)?.label ?? id;
export const concernCategory = (id: ConcernId): Category =>
  allConcerns.find((c) => c.id === id)?.category ?? "Skin";

/** Concerns the current shelf does not answer. */
export function openGaps(selectedConcerns: ConcernId[], shelf: string[]): ConcernId[] {
  const covered = new Set(
    pastPurchases.filter((p) => shelf.includes(p.id)).flatMap((p) => p.covers),
  );
  return selectedConcerns.filter((c) => !covered.has(c));
}

export function scoreReward(reward: Reward, input: ScoreInput): Score {
  const gaps = openGaps(input.selectedConcerns, input.shelf);
  const gapsClosed = reward.covers.filter((c) => gaps.includes(c));
  const alsoWanted = reward.covers.filter(
    (c) => input.selectedConcerns.includes(c) && !gapsClosed.includes(c),
  );
  const loved = reward.covers.filter((c) => input.enjoys.includes(c));

  const shelfActives = new Set(
    pastPurchases.filter((p) => input.shelf.includes(p.id)).flatMap((p) => p.actives),
  );
  const clash = (reward.conflictsWith ?? []).some((a) => shelfActives.has(a));
  const wrongSkin = (reward.avoidFor ?? []).includes(input.skinType);

  const lines: ScoreLine[] = [];

  if (gapsClosed.length) {
    lines.push({
      label: "Closes a gap",
      detail: `Nothing on your ${reward.category.toLowerCase()} shelf answers ${gapsClosed
        .map(label)
        .join(" or ")
        .toLowerCase()}.`,
      weight: "positive",
    });
  } else if (alsoWanted.length) {
    lines.push({
      label: "Doubles up",
      detail: `You already have ${alsoWanted.map(label).join(" and ").toLowerCase()} covered on the shelf.`,
      weight: "neutral",
    });
  } else if (loved.length) {
    lines.push({
      label: "Matches what you redeem",
      detail: `${loved.map(label).join(", ")} is what you reach for most.`,
      weight: "positive",
    });
  } else {
    lines.push({
      label: "Off-profile",
      detail: "It doesn't map to any concern you've flagged.",
      weight: "neutral",
    });
  }

  if (reward.avoidFor?.length || reward.category === "Skin") {
    lines.push(
      wrongSkin
        ? {
            label: `${input.skinType} skin`,
            detail: reward.avoidReason ?? "The texture is wrong for your skin type.",
            weight: "negative",
          }
        : {
            label: `${input.skinType} skin`,
            detail: "Texture and finish suit your skin type.",
            weight: "positive",
          },
    );
  }

  if (clash) {
    lines.push({
      label: "Routine conflict",
      detail: reward.conflictReason ?? "It overlaps with an active already on your shelf.",
      weight: "negative",
    });
  } else if (reward.pairsWith.some((p) => input.shelf.includes(p))) {
    const names = pastPurchases
      .filter((p) => reward.pairsWith.includes(p.id) && input.shelf.includes(p.id))
      .map((p) => p.name);
    lines.push({
      label: "Layers cleanly",
      detail: `Sits beside ${names.join(" and ")} with no interaction.`,
      weight: "positive",
    });
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

  if (wrongSkin || clash) {
    tier = "Not for your skin";
    headline = wrongSkin
      ? (reward.avoidReason ?? `Not built for ${input.skinType.toLowerCase()} skin.`)
      : (reward.conflictReason ?? "It clashes with something already in your routine.");
  } else if (gapsClosed.length) {
    tier = "Best fit";
    headline = `Closes ${gapsClosed.map(label).join(" and ").toLowerCase()} — open on your ${reward.category.toLowerCase()} shelf.`;
  } else if (loved.length || alsoWanted.length) {
    tier = "Good fit";
    headline = loved.length
      ? `More of the ${loved.map(label).join(", ").toLowerCase()} you already redeem.`
      : `Safe, but it repeats coverage you already own.`;
  } else {
    tier = "Good fit";
    headline = "Nothing against it — it just isn't answering a stated concern.";
  }

  return {
    tier,
    segments: tier === "Best fit" ? 3 : tier === "Good fit" ? 2 : 1,
    headline,
    lines,
    gapsClosed,
    affordable,
    shortBy: Math.max(0, reward.points - input.points),
  };
}

export const tierRank: Record<FitTier, number> = {
  "Best fit": 0,
  "Good fit": 1,
  "Not for your skin": 2,
};
