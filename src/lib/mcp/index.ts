import { defineMcp, type McpDefinitionInput } from "@lovable.dev/mcp-js";

import getBeautyProfileTool from "./tools/get-beauty-profile";
import getRewardTool from "./tools/get-reward";
import listRewardsTool from "./tools/list-rewards";
import recommendRewardsTool from "./tools/recommend-rewards";

export default defineMcp({
  name: "beauty-guide",
  title: "Beauty Guide",
  version: "0.1.0",
  instructions:
    "Tools for the Beauty Pass Rewards Boutique prototype. Browse the demo reward catalogue, read the demo member's beauty profile and shelf, and score rewards for fit against a skin/hair/makeup profile. All data is fictional demo data.",
  tools: [listRewardsTool, getRewardTool, getBeautyProfileTool, recommendRewardsTool] as unknown as McpDefinitionInput["tools"],
});
