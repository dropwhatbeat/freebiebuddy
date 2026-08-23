import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { recommendRewardsWithAi } from "./curator.server";

const InputSchema = z.object({
  skinType: z.enum(["Oily", "Combination", "Dry", "Normal"]),
  concerns: z.array(z.string()),
  enjoys: z.array(z.string()),
  shelf: z.array(z.string()),
  points: z.number().int().nonnegative(),
  inBag: z.array(z.string()).optional(),
  wish: z.string().max(300).nullable().optional(),
});

export const recommendRewards = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => recommendRewardsWithAi(data));
