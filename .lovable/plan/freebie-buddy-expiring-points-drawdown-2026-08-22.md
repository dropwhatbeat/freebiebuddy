# Freebie Buddy + expiring points drawdown

## 1. Rename the curator to "Freebie Buddy"

The mirror-orb mascot becomes **Freebie Buddy** everywhere it speaks or is named:
speech-panel labels, hero copy, quick-view "The Curator reads" section, boutique
"Ask" replies, and the shelf easter-egg quips. Tone stays minimal and editorial,
just warmer — e.g. "Freebie Buddy scanned your shelf", "Freebie Buddy's take".

## 2. Hero section rework

- Headline becomes **"Recommended rewards for you"** (no more "close 5 gaps").
- Sub-line keeps the personal AI read but drops the gap-count framing:
  "Freebie Buddy read your oily skin, 6 products across your shelves and 5 concerns
  to rank what your points can get today." Gaps still influence *ranking* and still
  appear as the per-card reason ("Nothing on your hair shelf answers frizz") —
  they're just no longer the headline.
- The picks row label becomes "Top picks" instead of the gap/best-fit switch.

## 3. Expiring points draw down with redemptions

Expiring points are part of the available balance, not a separate pool. Redeeming
consumes the expiring bucket first.

- Balance stays 1,240 with 320 of those expiring on 31 Aug 2027.
- Available = balance − bag total (unchanged, still the ceiling for Add to bag).
- Expiring shown = max(0, 320 − bag total), so a 200-pt reward shows 120 expiring
  left; a 400-pt reward shows 0 expiring and the rest coming from general points.
- Removing from bag restores both numbers.
- The expiring figure animates like the main counter, and reads "All expiring points
  used" when it hits 0.

## Technical notes

- `src/routes/index.tsx`: derive `expiringLeft` from the bag total and pass it to
  `PointsBanner`; no new state.
- `src/components/curator/PointsBanner.tsx`: animate the expiring number, add the
  zero-state label.
- `src/components/curator/PointCurator.tsx`: hero heading/sub-copy and picks label.
- `src/components/curator/CompactOrb.tsx`, `QuickView.tsx`, `Boutique.tsx`,
  `ProfileRail.tsx`: replace "The Curator" strings with "Freebie Buddy".
- Scoring logic in `scoring.ts` is untouched.
