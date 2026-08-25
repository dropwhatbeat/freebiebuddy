# Fix Freebie Buddy's text getting stuck on a loading line

No fit labels are added to the cards — dropping that idea.

## What's going wrong

The Freebie Buddy bar cross-fades between reads using a key that changes with each new line. While the recommendation is running, that key cycles through the five status lines every 2 seconds and then repeats the same values again (line 1, 2, 3, 4, 5, 1, 2, …). The bar animates with a "wait" mode: the old line must finish fading out before the new one is allowed in. When a repeated key arrives while that same key is still fading out — which is exactly what long loads plus scrolling/hover interruptions produce — the animation never resolves, the stale line stays mounted, and every later read (including the finished recommendation) is blocked from rendering. That is the "stuck at Weighing your 6 beauty concerns" state: the picks arrive and render, but the speech bubble is frozen on an old loading line.

## The fix

- Give the bar a read key that only ever moves forward (an incrementing counter bumped whenever the read text changes) instead of one that recycles values, so a key can never collide with a copy of itself that is still exiting.
- Make the text itself the source of truth: the paragraph renders the current body directly, with the fade applied as decoration, so even if an animation stalls the visible text is still the latest read. When the recommendation finishes, the bubble snaps to the final answer.
- Stop the status-line rotation the moment the request resolves, so no late tick can overwrite the finished read.

## Also worth fixing in the same pass

- **Hydration error on load.** The three example prompt chips are shuffled with `Math.random()` during initial render, so the server and browser render different chips and React throws "Hydration failed…" and re-renders the tree — extra churn during exactly the load window where the bug appears. Render a deterministic set for first paint, then shuffle once the page is interactive.
- **Duplicate AI calls.** Some gateway requests are logged as cancelled after ~1.5s in pairs, meaning a recommendation run is fired twice and one dropped. Guard the initial run so only one request goes out per load.

## Technical notes

- `BuddyBar.tsx`: keep `AnimatePresence` but drop `mode="wait"` (or key on a monotonic counter), and render `body`/`caution` from props on every render rather than only inside the presence child.
- `PointCurator.tsx`: replace the composite `readKey` string with a counter incremented in an effect on body change; clear the loading interval on resolve.
- `RecommendationPrompt.tsx`: deterministic `useState` seed + `useEffect` shuffle on mount.
- No change to the prompt, the model, the server function, or the reward cards.
