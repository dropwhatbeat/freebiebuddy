# Flexible, better-informed top picks

Freebie Buddy currently always returns exactly three picks and reasons from a thin slice of each product's data. This change lets the number of picks flex with the request, and gives the model the full product detail it needs to justify each one.

## Variable pick count

- Let the AI return between 1 and 6 picks. Drop the hard "pick the three best" instruction and the forced top-up to three from the rule ranking.
- Guidance in the prompt: return only rewards that genuinely earn a place — one strong answer for a narrow request ("something for my frizzy ends"), more when concerns span skin, hair and makeup or when the request is broad ("surprise me").
- Keep a floor of one pick: if the model returns nothing usable, fall back to the rule-based ranking (rules keep their current 3).
- The intro sentence adapts to the count instead of saying "these three".

## Richer product detail for the model

Every reward in the brief gets its full record, not just id/points/covers:
- brand, product name, size, category, points, tier eligibility
- editor's blurb from the catalogue (HTML stripped)
- key actives with their descriptions (from the ingredients map)
- routine placement, shelf products it pairs with, cautions, skin types to avoid and why, active conflicts and why
- rule-scored facts and affordability, as today

Same enrichment for the current shelf: brand, full name, category, what it covers, actives — so reasons can cite the specific product she already owns ("your Olaplex No.3 already handles bond repair").

Reasons get a little more room: two to three sentences allowed, required to name at least one concrete detail (an ingredient, her shelf item, or her typed request).

## UI

- The picks grid already renders `picks.length`, so it adapts. The counter chip stays ("2 picks" / "5 picks").
- The Freebie Buddy speech panel wording stops assuming three.
- Grid columns adjust so one or two picks don't look stranded in a three-column layout.

## Technical notes

- `src/lib/curator-prompt.ts`: rewrite `buildBrief` to emit the full reward and shelf records (strip HTML from `blurb`, join `rewardIngredients` entries); update `SYSTEM_PROMPT` for variable count and detail-grounded reasons.
- `src/lib/curator.server.ts`: replace `.slice(0, 3)` with `.slice(0, 6)`; remove the rule top-up loop; keep the empty-picks fallback and the 402/429 handling.
- `src/components/curator/PointCurator.tsx`: responsive grid based on pick count, count-agnostic copy.
- Prompt size grows with 40 rewards; the brief will be trimmed to the top ~18 rule-ranked rewards in full detail plus a compact one-line list of the rest, so the model still sees the whole catalogue without an oversized prompt.
