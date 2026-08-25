# Fix the errors and show Freebie Buddy's reasoning on the picks

I reproduced the page and read the AI logs. The model is answering fine — every recent call returns a full set of picks with reasons — but two things go wrong on the page.

## What's actually broken

**1. The AI reasoning never appears on the pick cards.** The server returns a `reason`, `routine`, `caution` and a fit tier for every pick, but a reward card only renders brand, name, points and the button. The only place the reasoning shows up is the sticky Freebie Buddy bar, and only while you hover a card. So the picks look like a plain product grid with no explanation — exactly the "no answer even though products are recommended" symptom.

**2. A hydration error on every page load.** The three example prompt chips are shuffled with `Math.random()` while the component initialises, so the server renders one set of chips ("Help fade my dark spots") and the browser renders another ("Calm my flaky scalp"). React throws "Hydration failed because the server rendered text didn't match the client" and re-renders the whole page tree. This is the error in the logs.

**3. Wasted, cancelled AI calls.** Several gateway requests are logged as cancelled after ~1.5s, in pairs seconds apart — the recommendation is being fired more than once and the earlier one dropped. These still burn time and sometimes credits.

## The fix

**Put the reasoning back on the cards.** Each top-pick card gains, under the product name:
- the fit label (Best fit / Good fit / Okay fit) with the existing gold segment meter
- Freebie Buddy's reason in her own words, clamped to a few lines
- the routine line, and the caution when there is one, in a quieter style

The Buddy bar keeps its hover behaviour and the boutique grid below stays as-is (rule-scored, no AI text), so the difference between "curated for you" and "browse everything" stays clear.

**Make the prompt chips hydration-safe.** Render a fixed, deterministic set of chips for the first paint, then shuffle to a random set once the page is interactive, so server and client always agree. Chips still reshuffle after each request.

**Stop the duplicate calls.** Guard the initial recommendation so only one request goes out per load, and cancel-and-replace cleanly when a new request supersedes an in-flight one.

## Technical notes

- `RewardCard.tsx` takes optional `reason` / `routine` / `caution` props; `PointCurator.tsx` passes the AI pick's `score.headline`, `aiRoutine`, `aiCaution` for the top-pick grid and passes nothing in the boutique grid.
- Fit meter reuses the existing `score.tier` / `score.segments` values already set from the AI tier.
- `RecommendationPrompt.tsx`: `useState` initialises from a deterministic slice of `concerns`; a `useEffect` on mount swaps in `pickPrompts(concerns, 3)`.
- `PointCurator.tsx`: keep the `started` ref guard but make it resilient to StrictMode double-invoke, and let the mutation supersede in-flight runs instead of racing them.
- No change to the prompt, model, or server function contract.
