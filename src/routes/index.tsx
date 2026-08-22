import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/curator/SiteHeader";
import { PointsBanner, type RedeemedEntry } from "@/components/curator/PointsBanner";
import { PointCurator } from "@/components/curator/PointCurator";

const title = "Rewards Boutique — AI-scored Beauty Pass rewards";
const description =
  "A Beauty Pass prototype: every Rewards Boutique reward scored against your skin, hair and makeup profile, with best-fit, good-fit and not-for-you reasoning.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const balance = 1240;
  const expiringTotal = 320;
  const [bag, setBag] = useState<RedeemedEntry[]>([]);
  const held = bag.reduce((sum, r) => sum + r.points, 0);
  const available = balance - held;
  const expiringLeft = Math.max(0, expiringTotal - held);


  const handleRedeem = ({
    id,
    product,
    points: cost,
  }: {
    id: string;
    product: string;
    points: number;
  }) => {
    if (cost > available || bag.some((r) => r.id === id)) return;
    setBag((prev) => [...prev, { id, name: product, points: cost }]);
    const fromExpiring = Math.min(cost, expiringLeft);
    toast(`${product} added to your bag.`, {
      description: `${cost.toLocaleString()} points held${fromExpiring ? ` — ${fromExpiring.toLocaleString()} from your expiring balance` : ""}. ${(available - cost).toLocaleString()} points still available.`,
    });

  };

  const handleRemove = (id: string) => {
    const entry = bag.find((r) => r.id === id);
    if (!entry) return;
    setBag((prev) => prev.filter((r) => r.id !== id));
    toast(`${entry.name} removed from your bag.`, {
      description: `${entry.points.toLocaleString()} points released.`,
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <SiteHeader />

      <main>
        <PointsBanner
          points={available}
          expiring={expiringLeft}
          expiryDate="31 Aug 2027"
          redeemed={bag}
          onRemove={handleRemove}
          onSummary={() =>
            toast("Points summary", {
              description:
                "Prototype — a full statement of points earned, spent and expiring would open here.",
            })
          }
        />
        <PointCurator
          points={available}
          redeemed={bag.map((r) => r.id)}
          onRedeem={handleRedeem}
          onRemove={handleRemove}
        />
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-7xl px-8 py-10 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          Prototype — Sephora Singapore Beauty Pass · Rewards Boutique
        </div>
      </footer>
    </div>
  );
}
