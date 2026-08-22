export type ConcernId =
  | "hydration"
  | "barrier"
  | "brightening"
  | "texture"
  | "pores"
  | "firmness";

export interface Concern {
  id: ConcernId;
  label: string;
  blurb: string;
}

export const concerns: Concern[] = [
  { id: "hydration", label: "Hydration", blurb: "Tight by mid-afternoon" },
  { id: "barrier", label: "Barrier & sensitivity", blurb: "Reacts to strong actives" },
  { id: "brightening", label: "Brightening", blurb: "Post-acne marks, uneven tone" },
  { id: "texture", label: "Texture", blurb: "Rough patches around the chin" },
  { id: "pores", label: "Pores & oil", blurb: "Shine through the T-zone" },
  { id: "firmness", label: "Firmness", blurb: "Early loss of bounce" },
];

export type SkinType = "Oily" | "Combination" | "Dry" | "Normal";

export const skinTypes: SkinType[] = ["Oily", "Combination", "Dry", "Normal"];

export type Step = "Cleanse" | "Treat" | "Hydrate" | "Protect" | "Weekly";

export interface Product {
  id: string;
  name: string;
  brand: string;
  step: Step;
  vessel: "cleanser" | "vitc" | "moisturiser" | "spf" | "mask";
  covers: ConcernId[];
  /** Where it sits in the routine. */
  routine: string;
  /** Actives the model reasons about when checking conflicts. */
  actives: string[];
  purchased: string;
}

export const pastPurchases: Product[] = [
  {
    id: "cleanser",
    name: "Gentle Milk Cleanser",
    brand: "Maison Clair",
    step: "Cleanse",
    vessel: "cleanser",
    covers: ["barrier"],
    routine: "First step, morning and night. Low-foam, leaves the barrier intact.",
    actives: [],
    purchased: "Mar 2026",
  },
  {
    id: "vitc",
    name: "10% Vitamin C Serum",
    brand: "Atelier Lumen",
    step: "Treat",
    vessel: "vitc",
    covers: ["brightening"],
    routine: "Morning only, on damp skin before moisturiser.",
    actives: ["vitamin c"],
    purchased: "Feb 2026",
  },
  {
    id: "moisturiser",
    name: "Hyaluronic Water Cream",
    brand: "Maison Clair",
    step: "Hydrate",
    vessel: "moisturiser",
    covers: ["hydration"],
    routine: "Seals in your serum. Light gel-cream for Singapore humidity.",
    actives: [],
    purchased: "Apr 2026",
  },
  {
    id: "spf",
    name: "Invisible Fluid SPF 50+",
    brand: "Solane",
    step: "Protect",
    vessel: "spf",
    covers: ["brightening"],
    routine: "Final morning step, reapplied when you are outdoors.",
    actives: [],
    purchased: "Apr 2026",
  },
  {
    id: "clay",
    name: "Kaolin Clarifying Mask",
    brand: "Solane",
    step: "Weekly",
    vessel: "mask",
    covers: ["pores"],
    routine: "Once a week on the T-zone only.",
    actives: ["clay"],
    purchased: "Jan 2026",
  },
  {
    id: "peptide",
    name: "Peptide Firming Emulsion",
    brand: "Atelier Lumen",
    step: "Treat",
    vessel: "vitc",
    covers: ["firmness"],
    routine: "Evening, after cleansing. Gentle enough for reactive skin.",
    actives: ["peptides"],
    purchased: "Dec 2025",
  },
  {
    id: "aha",
    name: "5% PHA Resurfacing Toner",
    brand: "Atelier Lumen",
    step: "Treat",
    vessel: "vitc",
    covers: ["texture"],
    routine: "Two evenings a week, never on the same night as retinol.",
    actives: ["pha", "acid"],
    purchased: "Nov 2025",
  },
];

/** Shelf Michelle starts with. */
export const defaultShelf = ["cleanser", "vitc", "moisturiser", "spf"];

export const defaultProfile = {
  name: "Michelle",
  skinType: "Combination" as SkinType,
  concerns: ["hydration", "barrier", "brightening", "texture"] as ConcernId[],
  /** What she redeems most — used when there is no gap to close. */
  enjoys: ["hydration"] as ConcernId[],
};

export type RewardType = "Deluxe mini" | "Full size" | "Gift set" | "Experience";

export interface Reward {
  id: string;
  name: string;
  brand: string;
  type: RewardType;
  points: number;
  tier: "All members" | "Gold & above";
  covers: ConcernId[];
  vessel: number;
  /** Where it would sit in her routine. */
  routine: string;
  /** Shelf products it layers with. */
  pairsWith: string[];
  /** Skin types this is a poor match for. */
  avoidFor?: SkinType[];
  avoidReason?: string;
  /** Actives already on the shelf that clash. */
  conflictsWith?: string[];
  conflictReason?: string;
  caution?: string;
}

export const rewardCatalogue: Reward[] = [
  {
    id: "ceramide",
    name: "Ceramide Repair Cream",
    brand: "Maison Clair",
    type: "Deluxe mini",
    points: 750,
    tier: "Gold & above",
    covers: ["barrier", "hydration"],
    vessel: 0,
    routine: "Last step at night, over your water cream — the lid your routine is missing.",
    pairsWith: ["moisturiser", "cleanser"],
    avoidFor: ["Oily"],
    avoidReason: "Rich occlusive texture sits heavy on oily skin.",
  },
  {
    id: "pha",
    name: "PHA Smoothing Essence",
    brand: "Atelier Lumen",
    type: "Deluxe mini",
    points: 600,
    tier: "All members",
    covers: ["texture", "pores"],
    vessel: 1,
    routine: "Two nights a week after cleansing, on the nights you skip vitamin C.",
    pairsWith: ["cleanser", "moisturiser"],
    conflictsWith: ["pha", "acid"],
    conflictReason: "You already exfoliate with a PHA toner — two would over-exfoliate.",
    caution: "Introduce one night a week first — you flagged sensitivity.",
  },
  {
    id: "mist",
    name: "Rose Hydrating Mist",
    brand: "Maison Clair",
    type: "Deluxe mini",
    points: 350,
    tier: "All members",
    covers: ["hydration"],
    vessel: 2,
    routine: "A midday top-up over makeup, or pressed in before your water cream.",
    pairsWith: ["moisturiser"],
  },
  {
    id: "nightset",
    name: "Evening Ritual Set",
    brand: "Atelier Lumen",
    type: "Gift set",
    points: 1200,
    tier: "Gold & above",
    covers: ["firmness", "texture", "hydration"],
    vessel: 0,
    routine: "A full four-piece PM routine layered after your cleanser.",
    pairsWith: ["cleanser", "moisturiser"],
    conflictsWith: ["pha", "acid"],
    conflictReason: "Contains retinal — it cannot share a night with your PHA toner.",
    caution: "Alternate nights, never with an acid.",
  },
  {
    id: "facial",
    name: "30-min Skin Consultation",
    brand: "Sephora Studio",
    type: "Experience",
    points: 500,
    tier: "Gold & above",
    covers: ["barrier", "brightening"],
    vessel: 1,
    routine: "An in-store read of your barrier before you add anything stronger.",
    pairsWith: [],
  },
  {
    id: "niacin",
    name: "Niacinamide Pore Serum",
    brand: "Solane",
    type: "Full size",
    points: 950,
    tier: "Gold & above",
    covers: ["pores", "brightening"],
    vessel: 2,
    routine: "Morning, between cleanser and vitamin C. Layers cleanly with both.",
    pairsWith: ["cleanser", "vitc"],
  },
  {
    id: "spfmini",
    name: "Invisible Fluid SPF Mini",
    brand: "Solane",
    type: "Deluxe mini",
    points: 250,
    tier: "All members",
    covers: ["brightening"],
    vessel: 1,
    routine: "The handbag size of the SPF already on your shelf, for reapplication.",
    pairsWith: ["spf"],
  },
  {
    id: "lipmask",
    name: "Overnight Lip Mask",
    brand: "Maison Clair",
    type: "Deluxe mini",
    points: 200,
    tier: "All members",
    covers: ["hydration"],
    vessel: 0,
    routine: "The very last thing you do at night. No interactions with anything else.",
    pairsWith: [],
  },
  {
    id: "balm",
    name: "Rich Cocoon Night Balm",
    brand: "Maison Clair",
    type: "Full size",
    points: 1100,
    tier: "Gold & above",
    covers: ["hydration", "barrier"],
    vessel: 0,
    routine: "A heavy overnight mask-balm for very dry, wind-exposed skin.",
    pairsWith: ["moisturiser"],
    avoidFor: ["Oily", "Combination"],
    avoidReason: "Too occlusive for a shiny T-zone in this climate.",
  },
  {
    id: "retinol",
    name: "0.3% Retinol Night Serum",
    brand: "Solane",
    type: "Full size",
    points: 1000,
    tier: "Gold & above",
    covers: ["firmness", "texture"],
    vessel: 1,
    routine: "Two to three nights a week, buffered with moisturiser.",
    pairsWith: ["moisturiser"],
    conflictsWith: ["pha", "acid"],
    conflictReason: "Retinol plus your PHA toner is a lot of turnover for reactive skin.",
    caution: "Never on the same night as an acid.",
  },
  {
    id: "collagen",
    name: "Collagen Sculpt Mask Duo",
    brand: "Atelier Lumen",
    type: "Gift set",
    points: 800,
    tier: "All members",
    covers: ["firmness", "hydration"],
    vessel: 2,
    routine: "A weekly sheet mask on the nights you do nothing active.",
    pairsWith: ["moisturiser"],
  },
  {
    id: "facialist",
    name: "Barrier Rescue Facial",
    brand: "Sephora Studio",
    type: "Experience",
    points: 1400,
    tier: "Gold & above",
    covers: ["barrier", "hydration"],
    vessel: 0,
    routine: "A 60-minute in-store treatment focused on calming reactive skin.",
    pairsWith: [],
  },
];

export const rewardTypes: RewardType[] = ["Deluxe mini", "Full size", "Gift set", "Experience"];
