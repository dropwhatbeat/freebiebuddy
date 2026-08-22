import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { rewardCatalogue, rewardIngredients, rewardTerms } from "@/components/curator/data";

export default defineTool({
  name: "get_reward",
  title: "Get reward details",
  description:
    "Full detail for one reward: routine placement, key actives, pairings, cautions and redemption terms.",
  inputSchema: {
    reward_id: z.string().min(1).describe("Reward id, e.g. from list_rewards."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ reward_id }) => {
    const reward = rewardCatalogue.find((r) => r.id === reward_id);
    if (!reward) throw new ToolError(`No reward with id "${reward_id}".`);

    const detail = {
      ...reward,
      ingredients: rewardIngredients[reward.id] ?? [],
      terms: rewardTerms,
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(detail, null, 2) }],
      structuredContent: { reward: detail },
    };
  },
});
