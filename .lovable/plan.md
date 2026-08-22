# Rewards Boutique: points banner and simplified chrome

## What changes

1. **Header stripped back.** The black bar keeps only the SEPHORA wordmark. The primary nav links (Beauty Pass / Rewards Boutique / New / Bag) are removed. Directly under it, the page title reads "Rewards Boutique" in the editorial serif, with the Gold Beauty Pass / Michelle, Singapore line kept as a small caption.

2. **How it works removed.** The tab strip and the How it works page go away; the Point Curator experience becomes the only view. Its guardrail content is not relocated.

3. **New points banner** (modelled on the reference, in our palette — warm white card, black rule, gold accents, no photography). Placed between the page title and the Curator hero, full width above the rail + boutique grid:

```text
+---------------------------------------------------------------+
|  WELCOME, MICHELLE                          REWARDS BOUTIQUE   |
|                                              (serif display)   |
|   1,240        |     320                                       |
|   Points       |     Points expiring                           |
|   balance      |     on 31 Aug 2027                            |
|   as of today  |                                               |
|                                                                |
|  View redeemed rewards    View points summary                  |
+---------------------------------------------------------------+
```

- Points balance is the live mock balance, so it ticks down when a reward is claimed (animated count).
- Expiring points is mock data (a subset of the balance, fixed date).
- The two links are prototype CTAs: "View redeemed rewards" opens a small panel listing rewards claimed this session (empty state before any claim); "View points summary" fires a prototype toast.

4. **Duplicate points chip** in the old sub-header row is removed, since the banner now owns that information.

## Technical notes

- `SiteHeader.tsx`: drop the `nav` array and links; add the boutique page title row; keep the tier/location caption; remove the points chip.
- New `PointsBanner.tsx` in `src/components/curator/` — receives `points`, `expiring`, `expiryDate`, `redeemed[]`, and callbacks; motion fade/rise on mount and a number transition on balance change.
- `src/routes/index.tsx`: remove tab state, `HowItWorks` import and render; mount `PointsBanner` above `<PointCurator />`; hold the redeemed-reward list here so both the banner and the boutique share it (lift `redeemed` state out of `PointCurator`, passed down as props).
- Delete `src/components/curator/HowItWorks.tsx`.
- Route `head()` title/description updated to "Rewards Boutique".
