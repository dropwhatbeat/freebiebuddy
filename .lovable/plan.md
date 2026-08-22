# Sephora Beauty Pass — Point Curator prototype

An editorial, desktop-first single-page prototype with two tabs: **Point Curator** and **How it works**. All visuals are original inline SVG / CSS — no photos, no third-party imagery.

## Design system

- Palette: near-black, warm white, charcoal, muted champagne gold (used sparingly as the single accent).
- High-contrast serif for headings, crisp sans for interface text (loaded via a link tag in the root route).
- Hairline dividers, generous whitespace, near-square corners, restrained shadows, no gradients.
- All values become semantic tokens in `src/styles.css` (oklch); no hardcoded color utilities in components.

## Screens and sections

**Header** — black bar: SEPHORA wordmark, Beauty Pass, Rewards Boutique, New, Bag. Thin account bar beneath: Gold Beauty Pass · Michelle, Singapore · points available (live from state).

**Hero** — eyebrow "Rewards, matched to you", headline "Make your points feel more personal.", supporting copy, and the illustrated Beauty Guide holding a small gold reward card. One 300ms fade-and-rise on load, no looping.

**Your beauty profile** — compact panel with tags (Sensitive skin, Hydration, Brightening), an Edit action that fires a prototype toast, and the "used only to tailor..." helper line.

**Your current skincare shelf** — four hand-drawn ink-line illustrations (Gentle Cleanser, Brightening Vitamin C Serum, Hyaluronic Acid Moisturiser, Daily SPF 50) resting on a drawn shelf line, each with a routine-role label. "Edit shelf" action toasts; small removal-note copy below.

**Three ways to use your points** — Beauty Guide standing at one end of a second drawn shelf; three reward cards animate in with a 220ms stagger (fade + rise).
- Try something new — Radiance Reset Minis, 400 pts
- Best match for you — Barrier Comfort Duo, 750 pts (fine muted-gold border, restrained primary)
- Use more of your points — Evening Ritual Set, 1,200 pts (adds a "Consider before redeeming" note)

Card interaction: hover **or** keyboard focus lifts the card and reveals its "Why this fits / Routine note" panel. The same state draws a thin gold SVG connector to the linked shelf products (Barrier Comfort Duo → Vitamin C serum + Hyaluronic Acid Moisturiser). "Choose reward" deducts points from the mock balance and shows a premium confirmation toast; wording stays cautious and factual, never diagnostic.

**Full catalogue** — closing copy plus "Explore all rewards →" which smoothly expands a four-item grid. Overnight AHA Mask and Retinol Renewal Mini carry a minimal info icon revealing their routine note on hover, click, or focus.

**How it works tab** — an SVG architecture diagram: Member + Catalogue Inputs → Rules, Ranking & Approved Knowledge Retrieval → Point Curator Experience, each column listing the specified items, plus two compact guardrail panels ("What the model may do" / "What it may never do").

## Technical notes

- TanStack Start; the prototype replaces `src/routes/index.tsx` (tabs are local state, not routes, so the connectors and shelf stay in one layout context). Route `head()` gets app-specific title/description/og/twitter metadata.
- Framer Motion (`motion`) for entrance, stagger, and card lift; every animation respects `useReducedMotion` / `prefers-reduced-motion` by falling back to instant states.
- Connector lines: an SVG overlay measuring shelf-item and card positions via refs + a resize observer, so lines stay accurate on viewport change.
- Toasts via sonner, mounted once in `__root.tsx`, styled to the palette.
- Components split under `src/components/curator/` (Header, Hero, BeautyGuide, ProfilePanel, Shelf, RewardCard, Catalogue, HowItWorks) with illustrations in `src/components/curator/illustrations/`.
- All state is in-memory mock state; no backend.
