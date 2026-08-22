# Tidy reward cards + Quick view

Reward cards become short and evenly aligned like the Sephora reference, and the depth moves into a Quick view modal.

## Card (boutique grid and the three top picks)

Each card keeps only:

```text
 ┌──────────────────────────┐
 │      [vessel art]        │  ← hover: "QUICK VIEW" bar over the art
 │   ─ ─ ─  BEST FIT        │
 │  ALL MEMBERS             │
 │  MAISON CLAIR            │
 │  Overnight Lip Mask      │
 │  200 pts                 │
 │  Closes lip care — …     │  ← one Curator reason line, clamped to 2 lines
 │  ┌────────────────────┐  │
 │  │    ADD TO BAG      │  │  ← same row on every card
 │  └────────────────────┘  │
 └──────────────────────────┘
```

- Every card is the same height, with the art block a fixed height and the text block a fixed number of lines, so the ADD TO BAG buttons line up across the row exactly like the reference.
- Button is full width, solid black, uppercase — matching the reference. States stay as they are: "Add to bag" → "In bag — remove", or "X pts short" (disabled).
- The reason list currently printed on every card is removed; only one short "why" line remains.
- The "Ask" link is dropped — Quick view replaces it.

## Quick view

- A "Quick view" bar fades in over the product art on hover, and is reachable by keyboard focus.
- Opens a centred modal (dimmed backdrop, X in the top-right, Esc/backdrop to close) split into product art on the left and detail on the right, following the second reference.
- Right side: tier line, brand, name, points, the fit meter, ADD TO BAG, then below a divider:
  - **Curator's read** — why it fits or doesn't: gaps closed, skin-type suitability, conflicts with what's on the shelves, points affordability.
  - **Key actives** — the product's actives with a one-line note each.
  - **In your routine** — where it slots in and what to watch.
  - **Terms** — the "while supplies last / one per customer / non-transferable" fine print.
- The Curator orb speaks the same explanation while the modal is open.

## Kept as-is

Hovering a card still updates the Curator speech panel at the top of the page.

## Technical notes

- New `src/components/curator/RewardCard.tsx` — one compact card used by both the picks grid in `PointCurator.tsx` and the boutique grid in `Boutique.tsx`, so alignment is identical in both places.
- New `src/components/curator/QuickView.tsx` — modal built on the existing shadcn `dialog`, driven by a `quickViewId` state in `PointCurator.tsx`; it receives the same `ScoredReward` the grid uses, so no scoring changes.
- `data.ts`: add short `ingredients` (name + note) and a shared `terms` string per reward; `routine` and `caution` already exist and feed the routine section.
- `scoring.ts` unchanged — the modal renders the existing `score.lines`, the card renders `score.headline` only.
- Motion: modal fade/scale-in, quick-view bar fade on hover, all respecting reduced motion.
