# Side rail: read-only profile + illustrated shelf

## Beauty profile becomes read-only and small

- Skin type and concerns render as mini tags (smaller text, tighter padding, no button behaviour, no hover/press states) — display only, grouped as `Skin · Hair · Makeup`.
- Gap concerns keep a subtle gold tint so the "nothing answers this" signal survives, with a tooltip on hover.
- The section ends with a mini text CTA "View my beauty profile ›" that fires a prototype toast (same pattern as the banner CTAs).
- Scoring keeps reading the same profile values; only editing is removed. Skin type stays fixed at the profile default.

## Shelf drawn as an actual shelf

Each category (Skin, Hair, Makeup) becomes a physical shelf plank instead of a list:

```text
  SKIN — currently using: 3
   ╭──╮  ╭─╮   ╭───╮
   │  │  │ │   │   │        <- product vessels standing on the plank
  ═╧══╧══╧═╧═══╧═══╧═════   <- hairline shelf plank + soft shadow
   + Add from past purchases
```

- Products stand side by side as the existing `ProductBottle` line-art vessels, sized to fit the rail, each with a thin drop shadow onto the plank line.
- Hover a bottle: it lifts a few pixels, casts a slightly longer shadow, and shows its name plus a small × to remove.
- Adding from past purchases drops the new bottle in from above with a small settle bounce; removing tips it out sideways and the rest slide to close the gap (layout animation).
- Empty shelf shows a faint dashed outline of a bottle rather than text.

## Easter egg

Clicking the shelf plank itself gives it a gentle wobble and every bottle jiggles and clinks back into place; a third rapid click makes the Curator orb blink and drop a one-line quip in its speech panel ("Careful — those are limited edition."). Purely cosmetic, no state change.

## Technical notes

- Rework `ProfileRail.tsx`: `Chip` becomes a non-interactive `Tag`; `ShelfGroup` re-renders as a plank row with absolutely-positioned vessels, keeping the existing `shelf` / `onToggleShelf` props so `PointCurator` is untouched except for dropping the skin-type setter.
- Motion via `motion/react` `layout` + `AnimatePresence` for add/remove; wobble/jiggle as short keyframe animations in `src/styles.css` triggered by a transient class.
- All motion gated on `useReducedMotion`.
