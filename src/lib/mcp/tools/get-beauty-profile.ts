import { defineTool } from "@lovable.dev/mcp-js";

import {
  concerns,
  defaultProfile,
  defaultShelf,
  pastPurchases,
  skinTypes,
} from "@/components/curator/data";

export default defineTool({
  name: "get_beauty_profile",
  title: "Get demo beauty profile",
  description:
    "The demo member's beauty profile, the shelf she is currently using, her past purchases, and every skin type and concern the scorer understands.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const payload = {
      profile: { ...defaultProfile, shelf: defaultShelf },
      currentlyUsing: pastPurchases
        .filter((p) => defaultShelf.includes(p.id))
        .map((p) => ({ id: p.id, name: p.name, brand: p.brand, category: p.category, covers: p.covers })),
      pastPurchases: pastPurchases.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        covers: p.covers,
      })),
      skinTypes,
      concerns,
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
