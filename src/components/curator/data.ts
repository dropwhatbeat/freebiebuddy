export type ShelfItemId = "cleanser" | "vitc" | "moisturiser" | "spf";

export interface ShelfItem {
  id: ShelfItemId;
  name: string;
  role: string;
}

export const shelfItems: ShelfItem[] = [
  { id: "cleanser", name: "Gentle Cleanser", role: "Step 1 — Cleanse" },
  { id: "vitc", name: "Brightening Vitamin C Serum", role: "Step 2 — Treat" },
  { id: "moisturiser", name: "Hyaluronic Acid Moisturiser", role: "Step 3 — Hydrate" },
  { id: "spf", name: "Daily SPF 50", role: "Step 4 — Protect" },
];

export interface Reward {
  id: string;
  label: string;
  product: string;
  detail: string;
  points: number;
  noteTitle: string;
  note: string;
  primary?: boolean;
  caution?: string;
  connects: ShelfItemId[];
}

export const rewards: Reward[] = [
  {
    id: "minis",
    label: "Try something new",
    product: "Radiance Reset Minis",
    detail: "A travel-size skincare discovery set",
    points: 400,
    noteTitle: "Routine note",
    note: "A gentle first step for your hydration routine. No routine concern identified from your saved profile.",
    connects: [],
  },
  {
    id: "duo",
    label: "Best match for you",
    product: "Barrier Comfort Duo",
    detail: "Hydration-focused serum + moisturiser samples",
    points: 750,
    noteTitle: "Why this fits",
    note: "Matches your hydration goal with ceramide and hyaluronic-acid products. Use after cleansing, before moisturiser.",
    primary: true,
    connects: ["vitc", "moisturiser"],
  },
  {
    id: "evening",
    label: "Use more of your points",
    product: "Evening Ritual Set",
    detail: "A four-piece at-home skincare set",
    points: 1200,
    noteTitle: "Routine note",
    note: "You marked your skin as sensitive. This set contains an exfoliating-acid treatment—review its ingredient guide before trying it.",
    caution:
      "Consider before redeeming: contains an exfoliating-acid treatment. Review the product guide and introduce gradually.",
    connects: [],
  },
];

export interface CatalogueItem {
  id: string;
  name: string;
  detail: string;
  points: number;
  info?: string;
}

export const catalogue: CatalogueItem[] = [
  {
    id: "cleansing-balm",
    name: "Cleansing Balm Mini",
    detail: "Melting balm-to-oil first cleanse",
    points: 300,
  },
  {
    id: "aha",
    name: "Overnight AHA Mask",
    detail: "Leave-on resurfacing mask, 15ml",
    points: 650,
    info: "Sensitive-skin profile: this contains exfoliating acids. Review the product guide before use.",
  },
  {
    id: "retinol",
    name: "Retinol Renewal Mini",
    detail: "Encapsulated retinol night treatment",
    points: 900,
    info: "Routine note: use as directed and avoid combining strong active treatments in the same routine.",
  },
  {
    id: "mist",
    name: "Rosewater Finishing Mist",
    detail: "Hydrating mist, travel size",
    points: 450,
  },
];

export const profileTags = ["Sensitive skin", "Hydration", "Brightening"];
