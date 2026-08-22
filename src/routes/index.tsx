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
  const [bag, setBag] = useState<RedeemedEntry[]>([]);
  const available = balance - bag.reduce((sum, r) => sum + r.points, 0);

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
    toast(`${product} added to your bag.`, {
      description: `${cost.toLocaleString()} points held. ${(available - cost).toLocaleString()} points still available.`,
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <SiteHeader />

      <main>
        <PointsBanner
          points={available}
          expiring={320}
          expiryDate="31 Aug 2027"
          redeemed={bag}
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
