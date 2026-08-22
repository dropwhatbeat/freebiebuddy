# Polish pass: readability, copy and mobile

## 1. Freebie Buddy bar readable over content
The sticky suggestion bar currently lets dark buttons show through. Make it solid: opaque card background with a stronger gold border and a soft shadow, so text stays legible while scrolling over black "Add to bag" buttons.

## 2. No duplicated AI line on cards
The reward cards repeat the same "I'd grab this…" text that already sits in the sticky Freebie Buddy bar. Remove the reason line (and its buddy mark) from the cards — the read lives in the bar on hover and in Quick view.

## 3. Mobile profile & shelf
On phones the profile/shelf rail overlaps the content. On mobile it now starts collapsed as a full-width bar ("Profile & shelf") that expands downward in normal page flow (no sticky, no viewport-height scroll box). Desktop behaviour is unchanged.

## 4. Boutique copy
- Heading: "Everything your points can reach." → "Full rewards catalogue"
- Remove the "Every reward is scored against your profile and shelves…" paragraph.

## 5. Hero copy
- Eyebrow: "AI reward scoring" → "AI reward recommender"
- Headline: "Recommended rewards for you" → "Explore the best rewards for you"

## Technical notes
- `BuddyBar.tsx`: swap `bg-gold/8 backdrop-blur-md` for `bg-card/98` + `border-gold` + subtle shadow.
- `RewardCard.tsx`: drop the `BuddyMark` + `score.headline` block and its min-height spacer.
- `ProfileRail.tsx`: split desktop (existing sticky aside) from mobile — `lg:hidden` collapsible section with internal `open` state defaulting to closed, `AnimatePresence` height reveal; drop `sticky`/`max-h` classes below `lg`.
- `Boutique.tsx`, `PointCurator.tsx`: copy edits only.
