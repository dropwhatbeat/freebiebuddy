# Real AI recommendations, on demand

Today the top picks are computed by a local rule scorer that re-runs silently on every shelf edit. This replaces the hero recommendation with a real AI call, makes the refresh explicit, and lets Michelle say what she actually wants.

## 1. AI scoring powered by Lovable AI

A server function sends Freebie Buddy's brief to Lovable AI: the beauty profile (skin type, concerns, what she enjoys), everything currently on her skin/hair/makeup shelves, her available points, the reward catalogue, and — when she types one — her request in her own words.

The model returns, for up to three picks:
- the reward it chose and a fit level (Best fit / Good fit / Not for your skin)
- a short, personal reason in Freebie Buddy's voice
- where it slots into her routine and anything to watch

The existing rule scorer stays as the fallback and as the fit meter for the full boutique grid below, so the page never renders empty if the AI call fails or credits run out. Errors surface as a small inline note plus the rule-based picks — never a silent blank.

## 2. "Update recommendations" after editing shelves

Shelf edits no longer silently re-rank. When the shelf changes, the hero shows a gentle "Your shelves changed" state with an **Update recommendations** button. Pressing it runs the AI scoring again; Freebie Buddy shows a thinking/scanning state while it works, then the picks animate in with fresh reasoning.

## 3. Freebie Buddy asks what you want

The hero speech bubble becomes clearly first-person: "Here's what I'd pick for you…" with the reasoning behind the three picks.

Under it, a single-line text input: *"Tell me what you're after — dry ends, a night out, something for travel…"* with a send button. Submitting re-runs the recommendation with that wish included; the picks and Freebie Buddy's explanation both update and reference what she asked for. A small chip shows the active request with an x to clear it back to the profile-only recommendation. A few tappable example prompts sit beside the input for a cold start.

## Technical notes

- New `src/lib/curator.functions.ts`: `recommendRewards` server function (`createServerFn`), zod-validated input of profile + shelf + points + optional `wish`. Calls Lovable AI Gateway via a new `src/lib/ai-gateway.server.ts` provider helper (`@ai-sdk/openai-compatible`, model `google/gemini-3.7-flash`), streamed and consumed server-side, with `Output.object` structured picks (`rewardId`, `tier`, `reason`, `routine`, `caution`) guarded by `NoObjectGeneratedError`.
- The prompt includes each reward's rule-scorer output as evidence, so the model reasons over facts (conflicts, skin-type cautions, affordability) instead of inventing them. Ids are validated against the catalogue; unknown ids drop out, and picks are topped up from the rule ranking.
- `PointCurator.tsx`: picks come from a `useMutation` (TanStack Query) rather than a `useMemo`; `shelfDirty` state drives the Update button; `wish` state drives the input. Initial load fires one AI call. Boutique grid keeps the local `scored` array unchanged.
- Hero gains `RecommendationPrompt` (input + example chips + active-wish chip) and a loading skeleton for the three cards; `CompactOrb` uses its existing `thinking` state during the call.
- Requires Lovable AI credits; no database or login is added.
