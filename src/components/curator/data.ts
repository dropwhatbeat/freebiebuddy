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
  { id: "hydration", label: "Hydration", blurb: "Skin feels tight by mid-afternoon" },
  { id: "barrier", label: "Barrier & sensitivity", blurb: "Reacts to strong actives and heat" },
  { id: "brightening", label: "Brightening", blurb: "Post-acne marks, uneven tone" },
  { id: "texture", label: "Texture", blurb: "Rough patches around the chin" },
  { id: "pores", label: "Pores & oil", blurb: "Shine through the T-zone" },
  { id: "firmness", label: "Firmness", blurb: "Early loss of bounce" },
];

export type Step = "Cleanse" | "Treat" | "Hydrate" | "Protect" | "Weekly";

export interface Product {
  id: string;
  name: string;
  brand: string;
  step: Step;
  vessel: "cleanser" | "vitc" | "moisturiser" | "spf" | "mask";
  covers: ConcernId[];
  /** Genie explanation of how the product sits inside the routine. */
  routine: string;
  /** Why the model surfaced or kept it. */
  why: string;
}

export const pastPurchases: Product[] = [
  {
    id: "cleanser",
    name: "Gentle Milk Cleanser",
    brand: "Maison Clair",
    step: "Cleanse",
    vessel: "cleanser",
    covers: ["barrier"],
    routine: "Your first step, morning and night. Low-foam, so it leaves the barrier intact.",
    why: "Kept because it is the only low-pH cleanser on your shelf and pairs safely with actives.",
  },
  {
    id: "vitc",
    name: "10% Vitamin C Serum",
    brand: "Atelier Lumen",
    step: "Treat",
    vessel: "vitc",
    covers: ["brightening"],
    routine: "Morning only, on damp skin before moisturiser. Follow with SPF every single day.",
    why: "This is what is currently doing the work on your post-acne marks.",
  },
  {
    id: "moisturiser",
    name: "Hyaluronic Water Cream",
    brand: "Maison Clair",
    step: "Hydrate",
    vessel: "moisturiser",
    covers: ["hydration"],
    routine: "Seals in your serum. Light gel-cream, so it works in Singapore humidity.",
    why: "Humectant-led — it draws water in but has little to hold it there overnight.",
  },
  {
    id: "spf",
    name: "Invisible Fluid SPF 50+",
    brand: "Solane",
    step: "Protect",
    vessel: "spf",
    covers: ["brightening"],
    routine: "Final morning step. Two fingers' worth, reapplied when you are outdoors.",
    why: "Protects the brightening progress your vitamin C is making.",
  },
  {
    id: "clay",
    name: "Kaolin Clarifying Mask",
    brand: "Solane",
    step: "Weekly",
    vessel: "mask",
    covers: ["pores"],
    routine: "Once a week on the T-zone only, never on the drier cheeks.",
    why: "Targets shine without stripping the rest of the face.",
  },
  {
    id: "peptide",
    name: "Peptide Firming Emulsion",
    brand: "Atelier Lumen",
    step: "Treat",
    vessel: "vitc",
    covers: ["firmness"],
    routine: "Evening, after cleansing. Peptides are gentle enough for reactive skin.",
    why: "A low-irritation route to firmness while your barrier recovers.",
  },
  {
    id: "aha",
    name: "5% PHA Resurfacing Toner",
    brand: "Atelier Lumen",
    step: "Treat",
    vessel: "vitc",
    covers: ["texture"],
    routine: "Two evenings a week, never on the same night as retinol.",
    why: "PHA is the largest acid molecule — the slowest, kindest exfoliant for you.",
  },
];

/** Shelf Michelle starts with. */
export const defaultShelf = ["cleanser", "vitc", "moisturiser", "spf"];

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
  /** How the genie frames the fit. */
  routine: string;
  why: string;
  /** Shelf products this reward sits next to in a routine. */
  pairsWith: string[];
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
    routine: "Last step at night, over your water cream. It is the lid your routine is missing.",
    why: "Your shelf draws water in but has nothing occlusive to hold it. This closes that gap.",
    pairsWith: ["moisturiser", "cleanser"],
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
    routine: "Two nights a week after cleansing, on the nights you skip your vitamin C.",
    why: "Nothing on your shelf addresses texture, and PHA is the gentlest acid for reactive skin.",
    pairsWith: ["cleanser", "moisturiser"],
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
    why: "You redeem hydration rewards most often — this is the low-commitment version.",
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
    why: "Uses most of your balance and covers two open concerns at once.",
    pairsWith: ["cleanser", "moisturiser"],
    caution: "Contains a retinal treatment. Alternate nights, never with the PHA.",
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
    why: "Useful when your concerns and your shelf disagree — a human second opinion.",
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
    why: "Backs up your weekly clay mask with something daily and non-stripping.",
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
    why: "A repeat of something you already use and finish.",
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
    why: "Small, safe, and matches your hydration preference.",
    pairsWith: [],
  },
];

export const rewardTypes: RewardType[] = ["Deluxe mini", "Full size", "Gift set", "Experience"];
