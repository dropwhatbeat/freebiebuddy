# Beauty Guide

Build a polished, interactive desktop-first web app prototype for Sephora Singapore’s Beauty Pass “Point Curator.”

Use React, TypeScript, Tailwind CSS, and Framer Motion. Create all visuals with original inline SVG or CSS illustrations—do not use stock photos, external product imagery, or an existing copyrighted mascot. The app should feel premium, editorial, warm, and minimal.

Core concept:
A member sees their beauty profile and current skincare shelf. An original hand-drawn “Beauty Guide” character presents three reward options from the Rewards Boutique at different point levels. The full catalogue remains accessible, with thoughtful routine notes where approved information is available.

Visual style:

Sephora-inspired palette: black, warm white, charcoal, muted champagne gold.

Gold Beauty Pass is the active member state.

Use an elegant high-contrast serif for headings and a crisp sans-serif for interface text.

Generous whitespace, hairline dividers, restrained shadows.

Avoid gradients, loud red warnings, excessive pills, generic dashboard cards, or overly rounded UI.

Build the Beauty Guide as a minimal black line illustration with one gold accent. It should feel like a refined fashion/editorial sketch, not cartoonish.

Add subtle hand-drawn product illustrations: simple bottles, jars, and skincare tubes with imperfect ink-line details.

Create these interactions and screens:

Header and member context

Black header with “SEPHORA” wordmark, Beauty Pass, Rewards Boutique, New, Bag.

Thin account bar below:

Gold Beauty Pass

Michelle, Singapore

1,240 points available

Hero

Eyebrow: “Rewards, matched to you”

Headline: “Make your points feel more personal.”

Supporting copy: “Choose a reward at the point level that feels right today. Your profile helps us surface a thoughtful starting point; the entire Rewards Boutique remains yours to explore.”

Place the illustrated Beauty Guide near the headline, holding a small gold reward card.

Animate the guide on page load with a subtle 300ms fade-and-rise. No looping animation.

Beauty profile

A refined compact panel titled “Your beauty profile.”

Profile tags: Sensitive skin, Hydration, Brightening.

“Edit” action shows a small prototype toast.

Helper copy: “Used only to tailor reward suggestions and routine notes.”

Current skincare shelf

Section title: “Your current skincare shelf”

Subtext: “Only products marked as currently using shape your routine notes.”

Show four hand-illustrated skincare items on a physical shelf:

Gentle Cleanser

Brightening Vitamin C Serum

Hyaluronic Acid Moisturiser

Daily SPF 50

Add routine-role labels under each product.

Add an “Edit shelf” action that triggers a prototype toast.

Include small copy: “Remove gifts, finished, or unused products at any time.”

Keep the shelf visual graceful and editorial, not like an inventory table.

Curated rewards

Section title: “Three ways to use your points.”

Place the Beauty Guide at one end of a separate illustrated Rewards shelf, as though they have selected and brought forward the three recommendations.

On entrance, animate the three reward cards from the shelf one after another: 220ms stagger, subtle fade and upward translation.

Include these reward cards:

Card 1:

Label: “Try something new”

Product: “Radiance Reset Minis”

Detail: “A travel-size skincare discovery set”

400 points

Routine note: “A gentle first step for your hydration routine. No routine concern identified from your saved profile.”

Card 2:

Label: “Best match for you”

Product: “Barrier Comfort Duo”

Detail: “Hydration-focused serum + moisturiser samples”

750 points

This is the restrained primary recommendation, with a fine muted-gold border.

Routine note: “Matches your hydration goal with ceramide and hyaluronic-acid products. Use after cleansing, before moisturiser.”

Card 3:

Label: “Use more of your points”

Product: “Evening Ritual Set”

Detail: “A four-piece at-home skincare set”

1,200 points

Routine note: “You marked your skin as sensitive. This set contains an exfoliating-acid treatment—review its ingredient guide before trying it.”

Reward-card interaction

On hover or keyboard focus, each reward card lifts slightly and reveals a compact “Why this fits” or “Routine note” panel.

Animate a thin muted-gold SVG connector from the reward to relevant products on the current skincare shelf.

For the Barrier Comfort Duo, connect to the Vitamin C serum and Hyaluronic Acid Moisturiser.

For the Evening Ritual Set, reveal a restrained “Consider before redeeming” note.

Do not state that a product will irritate skin or diagnose a condition. Use cautious, factual wording.

Every card has a “Choose reward” button.

Clicking a button updates the mock points balance and shows a premium confirmation toast.

Support reduced-motion preferences and never depend on hover alone.

Full catalogue

Below recommendations, display:

“The full Rewards Boutique is always open.”

“Browse every available reward and see routine notes where approved information is available.”

Button: “Explore all rewards →”

On click, smoothly expand an all-rewards grid with four sample products.

Two catalogue items should have a minimal info icon. Hover/click reveals a concise routine note:

Overnight AHA Mask: “Sensitive-skin profile: this contains exfoliating acids. Review the product guide before use.”

Retinol Renewal Mini: “Routine note: use as directed and avoid combining strong active treatments in the same routine.”

How it works tab

Add a navigation tab beside “Point Curator” called “How it works.”

Create a clean architecture diagram:
Member + Catalogue Inputs → Rules, Ranking & Approved Knowledge Retrieval → Point Curator Experience

Inputs:

Tier and points balance

Explicit beauty profile

Availability, eligibility, point cost

Middle:

Hard-filter eligible rewards

Rank candidates with an existing recommender

Retrieve approved product and ingredient facts

Output:

Three point-level choices

Short, grounded routine note

Full catalogue remains accessible

Add two compact guardrail sections:

“What the model may do”: transform approved retrieved facts into concise routine notes.

“What it may never do”: alter points, eligibility, inventory, expiry, or make medical or safety claims.

Build this as a clean, polished, working prototype—not a static mock-up. Buttons, tabs, catalogue expansion, reward selection, hover states, keyboard focus, and animations should work.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://freebiebuddy.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e80c1b18-b49c-4f51-b6bb-8d2902874bec).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
