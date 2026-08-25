# Fix the duplicate AI calls

Scope: only the duplicate recommendation requests. No changes to the Buddy bar, the prompt chips, or the reward cards.

## What's going wrong

Some gateway requests are logged as cancelled after roughly 1.5 seconds, arriving in pairs seconds apart. The recommendation run is being started twice — the first request is abandoned mid-flight while the second one is the answer the page actually shows. Every abandoned run still spends time and credits, and it stretches the loading window on first load.

## The fix

- Fire the initial recommendation exactly once per page load, in a way that survives React's development double-invoke of effects, so the load never starts two runs.
- When a new run does supersede an older one (a typed request, or "Update recommendations" pressed twice), only the newest run is allowed to write results — stale responses are ignored rather than racing the current one.

## Technical notes

- `PointCurator.tsx`: harden the existing `started` ref guard for the initial run, and make the mutation supersede in-flight runs (track the latest run and drop out-of-order results) instead of letting two `mutate` calls overlap.
- No change to `curator.functions.ts`, `curator.server.ts`, the prompt, or the model.
