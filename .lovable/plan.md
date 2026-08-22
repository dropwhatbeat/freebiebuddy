# Rewards Boutique, AI-scored

The page becomes one thing: a Rewards Boutique where every reward is scored against Michelle's skin. The profile and shelf stop being the main event and become a collapsible left rail that feeds the scoring.

## New mascot

Replace the dropper (too needle-like) with a **compact mirror orb**: a round gold-rimmed compact with a soft light reflection inside. It blinks, the lid catches a highlight sweep when it "thinks", and a faint scan ring pulses while scoring. Built as inline SVG plus CSS keyframes, same warm-gold/ink palette. It sits near the top of the boutique as the voice of the recommendation and speaks in a small panel when you interact with a reward.

## Layout

```text
 ┌───────────────┬──────────────────────────────────────────┐
 │ Sticky rail   │  Hero: points, Curator orb, top pick      │
 │  Skin profile │  ─────────────────────────────────────    │
 │  Concerns     │  Rewards Boutique                         │
 │  Your shelf   │   filters: type · eligibility · fit · sort│
 │  + past       │   [reward card] [reward card] [card]      │
 │    purchases  │   [reward card] [reward card] [card]      │
 │  (collapse ‹) │                                           │
 └───────────────┴──────────────────────────────────────────┘
```

- Left rail (collapsible, sticky): skin type + concerns as editable chips, "Your shelf" list, and a "Pull past purchases" action that adds items from purchase history. Any edit instantly re-scores the whole boutique.
- Right column: hero with point balance and the Curator's single top pick, then the full boutique grid — this is the page.
- "How it works" stays a separate tab.

## AI fit scoring

Every reward gets a score computed from the profile and shelf, shown as a **label plus a thin 3-segment gold meter**:

- **Best fit** (3 segments) — closes an open concern gap, safe for her skin type.
- **Good fit** (2 segments) — matches something she already enjoys, or duplicates coverage she likes.
- **Not for your skin** (1 dim segment) — conflicts with skin type or an existing active, e.g. a rich balm on oily T-zone, or a second strong acid alongside her vitamin C.

Score inputs, shown plainly on the card back/hover: concern match, skin-type safety, routine conflict with what's on the shelf, and points affordability. Cards that aren't a fit are never hidden — they're labelled with the honest reason.

Interacting with a reward opens the Curator's explanation: why it's recommended (or not), where it slots into the routine, and what to watch. Out-of-points rewards show how many points short.

## Filters

Type, eligibility (all / within my points / Gold & above), plus a new **Fit** filter (Best fit only / Good and up / Everything) and points sort.

## Technical notes

- New `src/components/curator/CompactOrb.tsx`; retire `Genie.tsx` and its dropper SVG/keyframes.
- New `src/components/curator/scoring.ts`: pure function `scoreReward(reward, profile, shelf)` returning `{ tier, reasons[], conflicts[] }`, memoised across the grid.
- Extend `data.ts`: skin type field on the profile, `conflictsWith` / `skinTypes` metadata on rewards, richer purchase history.
- Restructure `PointCurator.tsx` into a rail (`ProfileRail.tsx`) plus hero, and fold the grid work into `Boutique.tsx` with fit filter and score badges.
- Drop the SVG connector-line overlay — with the rail layout the explanation panel carries the link instead.
- Motion: staggered card entrance, meter fill on score change, rail collapse transition; all respect reduced motion.
