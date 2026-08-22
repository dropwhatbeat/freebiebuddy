export type Category = "Skin" | "Hair" | "Makeup";

export const categories: Category[] = ["Skin", "Hair", "Makeup"];

export type ConcernId =
  // skin
  | "hydration"
  | "barrier"
  | "brightening"
  | "texture"
  | "pores"
  | "firmness"
  // hair
  | "frizz"
  | "scalp"
  | "damage"
  | "volume"
  // makeup
  | "longwear"
  | "coverage"
  | "lipcare";

export interface Concern {
  id: ConcernId;
  label: string;
  blurb: string;
  category: Category;
}

export const concerns: Concern[] = [
  { id: "hydration", label: "Hydration", blurb: "Tight by mid-afternoon", category: "Skin" },
  {
    id: "barrier",
    label: "Barrier & sensitivity",
    blurb: "Reacts to strong actives",
    category: "Skin",
  },
  {
    id: "brightening",
    label: "Brightening",
    blurb: "Post-acne marks, uneven tone",
    category: "Skin",
  },
  { id: "texture", label: "Texture", blurb: "Rough patches around the chin", category: "Skin" },
  { id: "pores", label: "Pores & oil", blurb: "Shine through the T-zone", category: "Skin" },
  { id: "firmness", label: "Firmness", blurb: "Early loss of bounce", category: "Skin" },

  { id: "frizz", label: "Frizz", blurb: "Humidity lifts the surface", category: "Hair" },
  { id: "scalp", label: "Scalp care", blurb: "Flaking at the crown", category: "Hair" },
  { id: "damage", label: "Damage & split ends", blurb: "Colour-treated mid-lengths", category: "Hair" },
  { id: "volume", label: "Volume", blurb: "Flat by the second day", category: "Hair" },

  { id: "longwear", label: "Long wear", blurb: "Melts in Singapore heat", category: "Makeup" },
  { id: "coverage", label: "Coverage", blurb: "Evening out redness", category: "Makeup" },
  { id: "lipcare", label: "Lip care", blurb: "Dry, flaking lips", category: "Makeup" },
];

export type SkinType = "Oily" | "Combination" | "Dry" | "Normal";

export const skinTypes: SkinType[] = ["Oily", "Combination", "Dry", "Normal"];

export type Step =
  | "Cleanse"
  | "Treat"
  | "Hydrate"
  | "Protect"
  | "Weekly"
  | "Wash"
  | "Condition"
  | "Style"
  | "Base"
  | "Colour";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  step: Step;
  vessel: "cleanser" | "vitc" | "moisturiser" | "spf" | "mask" | "shampoo" | "hairoil" | "foundation" | "lipstick";
  covers: ConcernId[];
  /** Where it sits in the routine. */
  routine: string;
  /** Actives the model reasons about when checking conflicts. */
  actives: string[];
  purchased: string;
}

export const pastPurchases: Product[] = [
  // Skin
  {
    id: "cleanser",
    name: "Gentle Milk Cleanser",
    brand: "Maison Clair",
    category: "Skin",
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
    category: "Skin",
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
    category: "Skin",
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
    category: "Skin",
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
    category: "Skin",
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
    category: "Skin",
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
    category: "Skin",
    step: "Treat",
    vessel: "vitc",
    covers: ["texture"],
    routine: "Two evenings a week, never on the same night as retinol.",
    actives: ["pha", "acid"],
    purchased: "Nov 2025",
  },

  // Hair
  {
    id: "shampoo",
    name: "Gentle Daily Shampoo",
    brand: "Rue Botanique",
    category: "Hair",
    step: "Wash",
    vessel: "shampoo",
    covers: [],
    routine: "Three washes a week, worked into the scalp first.",
    actives: [],
    purchased: "Mar 2026",
  },
  {
    id: "conditioner",
    name: "Silk Repair Conditioner",
    brand: "Rue Botanique",
    category: "Hair",
    step: "Condition",
    vessel: "shampoo",
    covers: ["damage"],
    routine: "Mid-lengths to ends after every wash.",
    actives: ["protein"],
    purchased: "Mar 2026",
  },
  {
    id: "hairoil",
    name: "Smoothing Hair Oil",
    brand: "Rue Botanique",
    category: "Hair",
    step: "Style",
    vessel: "hairoil",
    covers: ["frizz"],
    routine: "Two drops on damp ends before air-drying.",
    actives: ["silicone"],
    purchased: "Jan 2026",
  },
  {
    id: "scalptonic",
    name: "Scalp Balancing Tonic",
    brand: "Rue Botanique",
    category: "Hair",
    step: "Wash",
    vessel: "hairoil",
    covers: ["scalp"],
    routine: "Twice weekly on a dry scalp before bed.",
    actives: ["salicylic"],
    purchased: "Oct 2025",
  },

  // Makeup
  {
    id: "foundation",
    name: "Second Skin Fluid Foundation",
    brand: "Atelier Lumen",
    category: "Makeup",
    step: "Base",
    vessel: "foundation",
    covers: ["coverage"],
    routine: "Sheer-to-medium base over SPF.",
    actives: [],
    purchased: "Feb 2026",
  },
  {
    id: "lip",
    name: "Velvet Blur Lip Colour",
    brand: "Atelier Lumen",
    category: "Makeup",
    step: "Colour",
    vessel: "lipstick",
    covers: [],
    routine: "Matte finish — drying if lips are not prepped.",
    actives: [],
    purchased: "Dec 2025",
  },
  {
    id: "setspray",
    name: "Hold Setting Mist",
    brand: "Solane",
    category: "Makeup",
    step: "Base",
    vessel: "foundation",
    covers: ["longwear"],
    routine: "Final step to lock the base in humidity.",
    actives: [],
    purchased: "Sep 2025",
  },
];

/** Shelf Michelle starts with. */
export const defaultShelf = [
  "cleanser",
  "vitc",
  "moisturiser",
  "spf",
  "shampoo",
  "conditioner",
  "foundation",
  "lip",
];

export const defaultProfile = {
  name: "Michelle",
  skinType: "Combination" as SkinType,
  concerns: [
    "hydration",
    "barrier",
    "brightening",
    "texture",
    "frizz",
    "scalp",
    "longwear",
    "lipcare",
  ] as ConcernId[],
  /** What she redeems most — used when there is no gap to close. */
  enjoys: ["hydration", "coverage"] as ConcernId[],
};

export type RewardType = "Deluxe mini" | "Full size" | "Gift set" | "Experience";

export interface Reward {
  id: string;
  name: string;
  brand: string;
  category: Category;
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
  // Skin
  {
    id: "ceramide",
    name: "Ceramide Repair Cream",
    brand: "Maison Clair",
    category: "Skin",
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
    category: "Skin",
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
    category: "Skin",
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
    category: "Skin",
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
    category: "Skin",
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
    category: "Skin",
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
    category: "Skin",
    type: "Deluxe mini",
    points: 250,
    tier: "All members",
    covers: ["brightening"],
    vessel: 1,
    routine: "The handbag size of the SPF already on your shelf, for reapplication.",
    pairsWith: ["spf"],
  },
  {
    id: "balm",
    name: "Rich Cocoon Night Balm",
    brand: "Maison Clair",
    category: "Skin",
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
    category: "Skin",
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
    category: "Skin",
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
    category: "Skin",
    type: "Experience",
    points: 1400,
    tier: "Gold & above",
    covers: ["barrier", "hydration"],
    vessel: 0,
    routine: "A 60-minute in-store treatment focused on calming reactive skin.",
    pairsWith: [],
  },

  // Hair
  {
    id: "antifrizz",
    name: "Humidity Shield Cream",
    brand: "Rue Botanique",
    category: "Hair",
    type: "Deluxe mini",
    points: 400,
    tier: "All members",
    covers: ["frizz"],
    vessel: 1,
    routine: "Smoothed through damp lengths before your hair oil.",
    pairsWith: ["hairoil", "conditioner"],
  },
  {
    id: "scalpserum",
    name: "Scalp Renewal Serum",
    brand: "Rue Botanique",
    category: "Hair",
    type: "Full size",
    points: 900,
    tier: "Gold & above",
    covers: ["scalp", "volume"],
    vessel: 2,
    routine: "Nightly along the parting — targets flaking at the crown.",
    pairsWith: ["shampoo"],
    conflictsWith: ["salicylic"],
    conflictReason: "Doubling up with your salicylic scalp tonic can leave the scalp tight.",
    caution: "Alternate nights with your tonic.",
  },
  {
    id: "bondmask",
    name: "Bond Repair Hair Mask",
    brand: "Rue Botanique",
    category: "Hair",
    type: "Deluxe mini",
    points: 550,
    tier: "All members",
    covers: ["damage"],
    vessel: 0,
    routine: "Weekly, in place of your conditioner.",
    pairsWith: ["conditioner", "shampoo"],
  },
  {
    id: "volumemousse",
    name: "Air Volume Mousse",
    brand: "Solane",
    category: "Hair",
    type: "Full size",
    points: 650,
    tier: "All members",
    covers: ["volume"],
    vessel: 1,
    routine: "At the roots on damp hair, before drying.",
    pairsWith: ["shampoo"],
  },
  {
    id: "blowout",
    name: "Salon Blow-out Session",
    brand: "Sephora Studio",
    category: "Hair",
    type: "Experience",
    points: 1300,
    tier: "Gold & above",
    covers: ["frizz", "volume"],
    vessel: 2,
    routine: "A 45-minute in-store styling session.",
    pairsWith: [],
  },

  // Makeup
  {
    id: "lipbalm",
    name: "Overnight Lip Mask",
    brand: "Maison Clair",
    category: "Makeup",
    type: "Deluxe mini",
    points: 200,
    tier: "All members",
    covers: ["lipcare"],
    vessel: 0,
    routine: "Last thing at night — preps lips for your matte lip colour.",
    pairsWith: ["lip"],
  },
  {
    id: "primer",
    name: "Grip Longwear Primer",
    brand: "Atelier Lumen",
    category: "Makeup",
    type: "Full size",
    points: 700,
    tier: "All members",
    covers: ["longwear"],
    vessel: 1,
    routine: "Under your fluid foundation to hold the base through humidity.",
    pairsWith: ["foundation", "setspray"],
  },
  {
    id: "concealer",
    name: "Soft Focus Concealer",
    brand: "Atelier Lumen",
    category: "Makeup",
    type: "Deluxe mini",
    points: 450,
    tier: "All members",
    covers: ["coverage"],
    vessel: 2,
    routine: "Spot-placed over your foundation where redness shows.",
    pairsWith: ["foundation"],
  },
  {
    id: "powder",
    name: "Blur Setting Powder",
    brand: "Solane",
    category: "Makeup",
    type: "Full size",
    points: 850,
    tier: "Gold & above",
    covers: ["longwear", "coverage"],
    vessel: 1,
    routine: "Pressed into the T-zone at the end of your base.",
    pairsWith: ["foundation", "setspray"],
    avoidFor: ["Dry"],
    avoidReason: "Powder can emphasise dryness on a dehydrated base.",
  },
  {
    id: "makeuplesson",
    name: "Personal Makeup Lesson",
    brand: "Sephora Studio",
    category: "Makeup",
    type: "Experience",
    points: 1150,
    tier: "Gold & above",
    covers: ["coverage", "longwear"],
    vessel: 0,
    routine: "A 60-minute in-store session built around your base products.",
    pairsWith: [],
  },
];

export const rewardTypes: RewardType[] = ["Deluxe mini", "Full size", "Gift set", "Experience"];
