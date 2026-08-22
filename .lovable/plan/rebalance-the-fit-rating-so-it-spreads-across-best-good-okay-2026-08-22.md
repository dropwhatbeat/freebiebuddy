# Rebalance the fit rating so it spreads across Best / Good / Okay

## Problem

Today a reward is "Best fit" as soon as it touches any one of Emily's 8 profile concerns and isn't flagged against her skin type. Since most rewards cover 1-3 popular concerns (hydration, damage, texture), nearly the whole catalogue lands on Best fit and almost nothing lands on Okay fit. The rating stops telling her anything.

## Approach

Replace the three if/else branches with a numeric fit score, then map the score into tiers using thresholds tuned so the catalogue trails downward: roughly Best 30-40%, Good 35-45%, Okay 20-30%.

### Scoring signals (beauty profile only, no shelf)

- Concern match, weighted by priority: her concerns are ranked (first-listed = top priority). A match on a top concern is worth much more than a match on a lower one.
- Match depth: covering two or more of her concerns scores higher than covering one.
- Match focus: a reward whose concern list is mostly her concerns beats one that only grazes her list among many unrelated claims.
- Skin-type suitability: a clear positive when the reward suits her type; a real penalty (not an automatic bottom tier) when it is flagged against it.
- Preference match ("enjoys"): a modest positive, not enough on its own to reach Best fit.
- No relevance at all: a downward pull, so generic items settle in Okay fit.

Affordability stays a separate signal shown on the card and does not change the fit tier.

### Tier mapping

Score bands are calibrated against the real catalogue so the spread is checked, not assumed: after implementing, run the scorer over all rewards with Emily's profile and print the tier counts, then adjust the two thresholds until the distribution trails downward as described. Best fit additionally requires at least one concern match and a suitable skin type, so nothing irrelevant can reach the top tier.

### Copy

- Best fit: names the top concern(s) it answers.
- Good fit: says it helps with a secondary concern or something she reaches for, without overselling.
- Okay fit: stays encouraging ("nothing stopping you from trying") and, where relevant, notes the texture may not be the obvious pick for her skin type. No "not for you" language.

The 3-segment meter keeps mapping 3 / 2 / 1 to the tiers.

## Technical notes

- All changes live in `src/components/curator/scoring.ts`: `scoreReward` gains an internal numeric score, and concern priority comes from the order of the profile's `concerns` list in `src/components/curator/data.ts`.
- `Score` keeps its current shape (`tier`, `segments`, `headline`, `lines`, `matchedConcerns`, `affordable`, `shortBy`), so `RewardCard`, `FitBadge`, `Boutique`, `QuickView`, `PointCurator` and the MCP tools need no changes.
- The LLM path is untouched; it still receives shelf context separately for its own reasoning.
- Verify with a script that prints tier counts across the full catalogue, plus a browser pass over the boutique to confirm a visible mix of badges.
