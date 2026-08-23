# Freebie Buddy evals

```bash
npm run eval
```

Calls the real model once per case and checks the answer with coded assertions.
Skips silently when no provider key is set in `.env`.

## Editing

`cases.ts` holds the eval set. It is plain data, so adding a case means appending
to the array. Every case needs a `why` naming the failure it catches, so you can
read a red result without reopening the prompt.

`assertions.ts` holds the checkers. Add an `Expectation` variant here when a case
needs a check that does not exist yet.

`run.ts` is the runner and rarely needs touching.

The system prompt under test lives in `src/prompts/system-prompt.md`.

## Two invariants run on every case

No case lists these, because they should never be optional.

`allIdsValid` checks that every returned id exists in the catalogue.

`disclosesConflict` checks that any pick clashing with her skin type or a shelf
active names the clash, either in its caution or in the intro. Suitability is
advisory here rather than a hard block. A reward she asked for always appears,
with the caveat attached. The code computes the clash set, so the model reports
it instead of detecting it.

## Costs and caveats

Each case is one real model call, so a full run costs about 16. Results land in
`evals/results/<timestamp>.json`.

A case whose `source` comes back as `rules` never exercised the model at all. The
run fell back. Treat that as an infrastructure failure rather than a pass.

`buildBrief` reads the Skincredible scan from module scope instead of the request,
so cases cannot vary it. Every case sees the same scan block. Threading `scan`
through `RecommendRequest` has to happen before scan behaviour can be tested.
