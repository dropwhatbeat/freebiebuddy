import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import {
  defaultProfile,
  defaultShelf,
  rewardCatalogue,
  type ConcernId,
  type SkinType,
} from "@/components/curator/data";
import { openGaps, scoreReward, tierRank } from "@/components/curator/scoring";

export default defineTool({
  name: "recommend_rewards",
  title: "Recommend rewards",
  description:
    "Score the reward catalogue against a beauty profile and points balance, returning the best-fit picks with the reasoning behind each score. Defaults to the demo member's profile.",
  inputSchema: {
    skinType: z.enum(["Oily", "Combination", "Dry", "Normal"]).optional(),
    concerns: z.array(z.string()).optional().describe("Concern ids, e.g. hydration, frizz, longwear."),
    shelf: z.array(z.string()).optional().describe("Product ids currently in use."),
    enjoys: z.array(z.string()).optional().describe("Concern ids she likes to redeem against."),
    points: z.number().int().nonnegative().optional().describe("Available points balance."),
    limit: z.number().int().min(1).max(12).optional().describe("How many picks to return (default 3)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ skinType, concerns, shelf, enjoys, points, limit }) => {
    const input = {
      skinType: (skinType ?? defaultProfile.skinType) as SkinType,
      selectedConcerns: (concerns ?? defaultProfile.concerns) as ConcernId[],
      shelf: shelf ?? defaultShelf,
      enjoys: (enjoys ?? defaultProfile.enjoys) as ConcernId[],
      points: points ?? 1240,
    };

    const gaps = openGaps(input.selectedConcerns, input.shelf);

    const scored = rewardCatalogue
      .map((reward) => ({ reward, score: scoreReward(reward, input) }))
      .sort((a, b) => {
        const tier = tierRank[a.score.tier] - tierRank[b.score.tier];
        if (tier !== 0) return tier;
        const gap = b.score.gapsClosed.length - a.score.gapsClosed.length;
        if (gap !== 0) return gap;
        return a.reward.points - b.reward.points;
      })
      .slice(0, limit ?? 3)
      .map(({ reward, score }) => ({
        id: reward.id,
        name: reward.name,
        brand: reward.brand,
        category: reward.category,
        points: reward.points,
        fit: score.tier,
        headline: score.headline,
        reasons: score.lines,
        gapsClosed: score.gapsClosed,
        affordable: score.affordable,
        shortBy: score.shortBy,
        routine: reward.routine,
      }));

    const payload = { openGaps: gaps, picks: scored };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
