# Freebie Buddy stays with the picks

## Hover no longer sticks

Hovering a reward card highlights it and swaps the speech panel to that product's read; moving the cursor away now clears both — the highlight drops and the panel returns to Freebie Buddy's overall intro. Same for keyboard focus (blur resets). Clicking Quick view still opens the modal, unaffected.

## Sticky mini Freebie Buddy

The orb + speech panel stops being a one-off block at the top and becomes a companion that travels with the picks grid:

- On desktop the hero keeps the full-size introduction (orb, "here's what I suggest for you", intro line, wish input).
- As you scroll into the picks and the boutique, that block condenses into a sticky bar pinned near the top of the content column: small orb, the label "Freebie Buddy", and the current read (intro, or the hovered product's reason + routine, plus caution when present).
- The bar is visually tied to the AI: gold hairline border, faint gold tint, a small "AI" spark mark, and the orb's scan/blink animation running while it is thinking or reading a product.
- The read text cross-fades when it changes so it's obvious the buddy is reacting to what you hover.
- On narrow widths the bar sits full width under the header area; motion is gated on reduced-motion.

## Making the AI authorship obvious

- Each pick card gets a small gold Freebie Buddy mark next to its one-line reason, so the reason clearly reads as the LLM's words rather than marketing copy.
- Quick view keeps its "Freebie Buddy's read" section, matched to the same mark.

## Technical notes

- `PointCurator.tsx`: add `onLeave` handling that sets `activeId` to `null` (mouse leave + blur) on the picks grid and boutique cards; `RewardCard.tsx` gains an `onLeave` prop wired to `onMouseLeave`/`onBlur`.
- Extract the current speech block into a `BuddyBar` component (`src/components/curator/BuddyBar.tsx`) reused in the hero (static) and as `sticky top-4 z-20` inside the content column, driven by the same `shown`/`busy`/`quip` values already computed.
- Cross-fade via `AnimatePresence` keyed on the active reward id; all motion behind `useReducedMotion`.
- Small `BuddyMark` (mini orb glyph) added to `CompactOrb.tsx` exports and used on cards and in the bar.
