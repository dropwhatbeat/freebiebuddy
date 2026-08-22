# Freebie Buddy — Sephora Beauty Pass rewards prototype

A working desktop-first prototype of an AI-assisted **Rewards Boutique** for Sephora Singapore's Beauty Pass. It explores one question: instead of making a member scroll a flat rewards catalogue, can the product score every reward against her beauty profile and explain, in plain language, *why* something fits — or why it doesn't?

**Live app**: https://freebiebuddy.lovable.app

This is a portfolio/assignment prototype. It is not affiliated with Sephora, and all members, products, point balances and routine notes are fictional demo data.

## What it does

- **Profile-driven scoring.** A demo member ("Emily" — combination skin, with hydration, barrier, brightening, texture, frizz, scalp, long-wear and lip-care concerns) and her current shelf drive a deterministic scoring pass over the whole reward catalogue. Each reward gets a fit tier (Best / Good / Okay), a segment meter, matched concerns, and affordability against her point balance.
- **AI-written reasoning on top of rules.** The rule engine produces the evidence; an LLM turns that evidence into a short intro, a reason, a routine note, and an optional caution per pick. The model picks from a fixed catalogue of valid reward IDs — it never invents rewards, points, or eligibility.
- **Graceful degradation.** No API key, no credits, rate limits, or a malformed model response all fall back to the rule-based ranking, with a visible note explaining the fallback. The prototype is fully usable with the AI turned off.
- **Free-text wishes.** The member can tell Freebie Buddy what she's after; a typed request widens the result set (up to six picks) instead of the default three.
- **Full boutique stays open.** Recommendations sit above the complete catalogue, with quick view, cautions, and redemption that decrements a mock balance and tracks points held in the bag.
- **Editorial visual language.** Black / warm white / charcoal / muted gold, high-contrast serif headings, original inline-SVG illustrations (no stock or licensed imagery), and staged motion that respects `prefers-reduced-motion`.

## Safety posture

The prompt and the surrounding code enforce that the model may only rephrase retrieved, approved facts. It may not alter points, eligibility, inventory or expiry, and it may not make medical or safety claims. Cautions are factual and non-diagnostic ("contains exfoliating acids — review the product guide before use"), never "this will irritate your skin."

## Architecture

```
src/
  routes/                  TanStack Start file-based routes
    index.tsx              the prototype page (balance, bag, header)
    mcp.ts, [.mcp]/        MCP endpoint exposing the demo data as tools
  components/curator/      the experience
    PointCurator.tsx       orchestrates profile → scoring → AI picks → boutique
    data.ts                catalogue, concerns, member profile, shelf (all demo)
    scoring.ts             deterministic fit scoring and gap analysis
    Boutique, RewardCard, QuickView, ProfileRail, BuddyBar, CompactOrb, …
    illustrations.tsx      original inline-SVG artwork
  lib/
    curator.functions.ts   server function boundary (zod-validated input)
    curator.server.ts      AI call, schema validation, fallbacks
    curator-prompt.ts      evidence builder, system prompt, rule ranking
    mcp/tools/             list-rewards, get-reward, get-beauty-profile,
                           recommend-rewards
```

Stack: React 19, TypeScript, TanStack Start + Router, Tailwind CSS v4, Motion, Radix/shadcn UI primitives, Vercel AI SDK against the Lovable AI gateway, Zod, Vite.

### MCP server

The same demo catalogue, profile and scoring are exposed as an MCP server (`beauty-guide`) at `/mcp`, so an external agent can browse rewards or request a scored recommendation using the same rules the UI uses.

## Development

Requires Node.js (or Bun — the lockfile is `bun.lock`).

```bash
npm install && npm run dev
```

Set `LOVABLE_API_KEY` in the environment to enable AI-written picks; without it the app runs on the rule-based ranking.

Other scripts: `npm run build`, `npm run preview`, `npm run lint`, `npm run format`.

## Lovable

This project was built with [Lovable](https://lovable.dev) and stays in sync with the [Lovable editor](https://lovable.dev/projects/e80c1b18-b49c-4f51-b6bb-8d2902874bec). Changes pushed to `main` sync back into Lovable, so avoid rewriting published history (see [AGENTS.md](AGENTS.md)).
