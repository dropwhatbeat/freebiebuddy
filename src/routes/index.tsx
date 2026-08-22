import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/curator/SiteHeader";
import { PointCurator } from "@/components/curator/PointCurator";
import { HowItWorks } from "@/components/curator/HowItWorks";

const title = "Point Curator — AI-scored Beauty Pass rewards";
const description =
  "A Beauty Pass prototype: every Rewards Boutique item scored against your skin profile and shelf, with best-fit, good-fit and not-for-you reasoning.";

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

const tabs = ["Point Curator", "How it works"] as const;

function Index() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Point Curator");
  const [points, setPoints] = useState(1240);

  const handleRedeem = ({ product, points: cost }: { product: string; points: number }) => {
    setPoints((p) => Math.max(0, p - cost));
    toast(`${product} is yours.`, {
      description: `${cost.toLocaleString()} points redeemed. A confirmation would be sent to your Beauty Pass.`,
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <SiteHeader points={points} />

      <div className="border-b border-hairline">
        <div className="mx-auto flex max-w-6xl gap-10 px-8">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-current={tab === t ? "page" : undefined}
              className={`-mb-px border-b py-4 text-xs tracking-[0.2em] uppercase transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none ${
                tab === t
                  ? "border-ink text-ink"
                  : "border-transparent text-muted-foreground hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <main>
        {tab === "Point Curator" ? (
          <PointCurator points={points} onRedeem={handleRedeem} />
        ) : (
          <HowItWorks />
        )}
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-8 py-10 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          Prototype — Sephora Singapore Beauty Pass · Point Curator
        </div>
      </footer>
    </div>
  );
}
