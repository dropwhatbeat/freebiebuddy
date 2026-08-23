/**
 * Eval runner. Run it with `npm run eval`.
 *
 * Calls the real model once per case and applies the coded checkers. Exits
 * quietly when no provider key is configured. Every raw response goes to
 * evals/results/<timestamp>.json, so you can diagnose a failure without paying
 * for the whole suite a second time.
 *
 * Cases live in ./cases.ts. Add them there.
 */
import fs from "node:fs";
import path from "node:path";

import { defaultProfile, defaultShelf } from "@/components/curator/data";
import type { RecommendRequest } from "@/lib/curator-prompt";
import { recommendRewardsWithAi } from "@/lib/curator.server";
import { check, checkDisclosure, checkIdsValid, type CheckResult } from "./assertions";
import { cases } from "./cases";

// Load .env without printing it. The app reads these from process.env.
for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  if (line.trimStart().startsWith("#")) continue;
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m?.[1] && m[2]) process.env[m[1]] ??= m[2];
}

if (!process.env["GOOGLE_GENERATIVE_AI_API_KEY"] && !process.env["LOVABLE_API_KEY"]) {
  console.log("No provider key configured. Set one in .env to run the eval.");
  process.exit(0);
}

const DEFAULT_POINTS = 658;

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

interface Row {
  name: string;
  why: string;
  ms: number;
  source: string;
  checks: CheckResult[];
  picks: string[];
  intro: string;
}

const rows: Row[] = [];

for (const c of cases) {
  const input: RecommendRequest = {
    skinType: c.member?.skinType ?? defaultProfile.skinType,
    concerns: c.member?.concerns ?? defaultProfile.concerns,
    enjoys: c.member?.enjoys ?? defaultProfile.enjoys,
    shelf: c.member?.shelf ?? defaultShelf,
    points: c.member?.points ?? DEFAULT_POINTS,
    wish: c.wish,
  };

  const started = Date.now();
  const result = await recommendRewardsWithAi(input);
  const ms = Date.now() - started;

  // Universal invariants first, then the case's own expectations.
  const checks: CheckResult[] = [
    checkIdsValid(result),
    checkDisclosure(result, input),
    ...c.expect.map((e) => check(e, result, input)),
  ];

  rows.push({
    name: c.name,
    why: c.why,
    ms,
    source: result.source,
    checks,
    picks: result.picks.map((p) => p.rewardId),
    intro: result.intro,
  });

  const failed = checks.filter((r) => !r.pass);
  const mark = failed.length ? red("FAIL") : green("PASS");
  console.log(
    `${mark}  ${c.name}  ${dim(`${ms}ms · ${result.source} · ${result.picks.length} picks`)}`,
  );
  for (const r of checks) {
    console.log(`      ${r.pass ? green("✓") : red("✗")} ${r.label} ${dim(`· ${r.detail}`)}`);
  }
  if (result.source === "rules") {
    console.log(`      ${red("!")} fell back to rules, so this case never reached the model`);
  }
}

const total = rows.reduce((n, r) => n + r.checks.length, 0);
const passed = rows.reduce((n, r) => n + r.checks.filter((c) => c.pass).length, 0);
const failedCases = rows.filter((r) => r.checks.some((c) => !c.pass));

console.log(`\n${passed}/${total} checks passed across ${rows.length} cases.`);
if (failedCases.length) {
  console.log(red(`${failedCases.length} case(s) with failures:`));
  for (const r of failedCases) console.log(`  · ${r.name} ${dim(`· ${r.why}`)}`);
}

const outDir = path.join("evals", "results");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
fs.writeFileSync(out, JSON.stringify(rows, null, 2));
console.log(dim(`\nRaw responses written to ${out}`));

process.exit(failedCases.length ? 1 : 0);
