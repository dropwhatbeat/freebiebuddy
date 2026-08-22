# Restructure the beauty profile around real Sephora data

Emily's profile is currently a hand-written list of eight generic concerns. It gets replaced by the two real sources a Beauty Pass member actually has: the declared **Beauty Profile** (skincare, haircare, fragrance) and the in-store **Skincredible scan** (measured metrics).

## What changes for the user

**1. Profile card becomes two labelled sources**

- *Beauty profile* — Normal skin; Blackheads, Pigmentation & dark spots, Fine lines & wrinkles. Hair: Thick, Curly / permed, Dry scalp; Frizz, Dandruff, Dryness. Fragrance: Women — Citrus & fruity, Floral.
- *Skincredible scan* — a compact block showing the overall skin score (75) and four mini metric bars: Hydration 64 (average), Lines 74 (average), Pores 82 (good), Sebum 80 (good), with the scan date and store ("ION Orchard, 16 Aug") as a small footnote.

Declared concerns stay the source of truth for gaps and tags. Scan metrics are supporting evidence — the two below-par metrics (hydration, lines) get a subtle amber marker but do not create new concern tags.

**2. Concern taxonomy updated to match the real vocabulary**

Skin: Blackheads, Pigmentation & dark spots, Fine lines & wrinkles, Hydration, Barrier & sensitivity, Pores & oil, Texture, Firmness.
Hair: Frizz, Dandruff, Dryness, Damage & split ends, Volume, Scalp care.
Makeup: Long wear, Coverage, Lip care (unchanged).

Only the first three skin and first three hair concerns are selected for Emily; the rest remain available so the catalogue mapping stays broad. Every reward's `covers` list is re-mapped onto the new IDs so scoring and gap detection keep working.

**3. Fragrance becomes a real signal**

A small "Fragrance" line of tags (Women · Citrus & fruity · Floral) sits in the profile card, and fragrance-category rewards in the catalogue are matched against those families by Freebie Buddy.

**4. Freebie Buddy reads all of it**

The AI prompt is extended with a structured profile block: declared skin/hair types and concerns, fragrance families, scan score and per-metric values with status, and the routine steps she already follows (cleanser, exfoliator, toner, serum, moisturiser, sunscreen, masks, tools). Buddy can then say things like "your scan puts hydration at 64 — this one is the fastest fix" instead of generic reasoning.

Shade data is intentionally left out of this prototype.

## Technical notes

- `src/components/curator/data.ts`: rewrite the `concerns` array with the new IDs/labels, add `hairType`, `scalpType`, `hairTexture`, `fragrance`, and a `scan` object (`score`, `metrics[]` with title/value/status, `date`, `store`, `routineSteps[]`) to `defaultProfile`; re-map `covers` on all 40 rewards to the new concern IDs.
- `src/components/curator/ProfileRail.tsx`: split the profile section into "Beauty profile" and "Skincredible scan" sub-blocks; add a small metric-bar component (label, thin gold/amber bar, value) reused four times; keep the read-only mini-tag styling, the existing gap line, and the "View my beauty profile" CTA.
- `src/components/curator/scoring.ts`: no behaviour change beyond the renamed concern IDs; gaps still come from declared concerns only.
- `src/lib/curator-prompt.ts`: add the scan + fragrance + routine-steps section to the evidence block, with an explicit instruction that declared concerns outrank scan metrics when they conflict.
- Types stay in `data.ts`; no new dependencies.
