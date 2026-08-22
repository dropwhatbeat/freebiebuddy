import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { rewardCatalogue } from "@/components/curator/data";

export default defineTool({
  name: "list_rewards",
  title: "List rewards",
  description:
    "List the Rewards Boutique catalogue (demo data), optionally filtered by category, points budget or membership tier.",
  inputSchema: {
    category: z.enum(["Skin", "Hair", "Makeup"]).optional().describe("Filter by product category."),
    maxPoints: z.number().int().positive().optional().describe("Only rewards at or below this points cost."),
    tier: z
      .enum(["All members", "Gold & Black"])
      .optional()
      .describe("Filter by the membership tier required."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category, maxPoints, tier }) => {
    const rows = rewardCatalogue
      .filter((r) => (category ? r.category === category : true))
      .filter((r) => (maxPoints ? r.points <= maxPoints : true))
      .filter((r) => (tier ? r.tier === tier : true))
      .map((r) => ({
        id: r.id,
        name: r.name,
        brand: r.brand,
        category: r.category,
        points: r.points,
        tier: r.tier,
        covers: r.covers,
      }));

    return {
      content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }],
      structuredContent: { count: rows.length, rewards: rows },
    };
  },
});
