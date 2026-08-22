# Tune Freebie Buddy pick counts and request-awareness

## What changes

1. **No typed request → exactly 3 top picks.** The opening set (on load, and after "Update recommendations" with an empty box) always returns 3 rewards — the strongest fits across her concern gaps and skin/hair/makeup profile.
2. **Typed request → 1 to 6 picks.** Only genuinely relevant rewards are returned; no padding. A tight request can return a single pick.
3. **Specificity awareness in the prompt.** Freebie Buddy first judges how specific the request is:
   - Names a product type ("a hair mask") or a brand ("something from Olaplex") → stay inside that type/brand, return only real matches (often 1-2), and say honestly in the intro if the catalogue has nothing closer.
   - Broad or mood-based ("something hydrating", "treat myself") → widen across categories and return more picks (up to 6) that suit her profile.
   - Mixed ("hair and skin for winter") → cover each named area.

## Technical notes

- `src/lib/curator-prompt.ts`
  - `SYSTEM_PROMPT`: replace the "How many picks" block with two explicit modes (no request = exactly 3; request = 1-6), and add a "Read the request first" block describing specific-type / specific-brand / broad handling, including the rule that brand or type constraints are hard filters.
  - `buildBrief`: in the no-wish branch state "Return exactly 3 picks"; in the wish branch instruct the model to classify the request as product-type-specific, brand-specific, or broad, and size the answer accordingly. Brand is already in each catalogue line, so no data change needed.
  - `rulePicks` fallback keeps its default limit of 3 for the no-wish case; when a wish exists the fallback stays at 3 as a safe default.
- `src/lib/curator.server.ts`
  - Pass the wish state through to enforcement: clamp picks to exactly 3 when no wish was typed, and to 1-6 when one was. Keep the existing dedupe and valid-id filtering.
- UI: no layout change needed — the picks grid already handles a variable count, and 3 is its default shape.
