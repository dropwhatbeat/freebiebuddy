import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { RewardCard } from "./RewardCard";
import { categories, type Reward } from "./data";
import { tierRank, type Score } from "./scoring";

export { FitBadge } from "./FitBadge";

export interface ScoredReward {
  reward: Reward;
  score: Score;
}

type TypeFilter = "All" | (typeof categories)[number];
type EligFilter = "All rewards" | "Within my points" | "Gold & above";
type FitFilter = "Everything" | "Good and up" | "Best fit only";
type SortKey = "Best fit first" | "Points: low to high" | "Points: high to low";

export function Boutique({
  scored,
  redeemed,
  onRedeem,
  onRemove,
  onExplain,
  onQuickView,
  activeId,
}: {
  scored: ScoredReward[];
  redeemed: string[];
  onRedeem: (r: Reward) => void;
  onRemove: (r: Reward) => void;
  onExplain: (r: Reward) => void;
  onQuickView: (r: Reward) => void;
  activeId: string | null;
}) {
  const reduced = useReducedMotion();
  const [type, setType] = useState<TypeFilter>("All");
  const [elig, setElig] = useState<EligFilter>("All rewards");
  const [fit, setFit] = useState<FitFilter>("Everything");
  const [sort, setSort] = useState<SortKey>("Best fit first");

  const items = useMemo(() => {
    let list = scored.filter(({ reward }) => (type === "All" ? true : reward.category === type));
    if (elig === "Within my points") list = list.filter((s) => s.score.affordable);
    if (elig === "Gold & above") list = list.filter((s) => s.reward.tier === "Gold & above");
    if (fit === "Best fit only") list = list.filter((s) => s.score.tier === "Best fit");
    if (fit === "Good and up") list = list.filter((s) => s.score.tier !== "Not for your skin");
    return [...list].sort((a, b) => {
      if (sort === "Points: low to high") return a.reward.points - b.reward.points;
      if (sort === "Points: high to low") return b.reward.points - a.reward.points;
      return (
        tierRank[a.score.tier] - tierRank[b.score.tier] || a.reward.points - b.reward.points
      );
    });
  }, [scored, type, elig, fit, sort]);

  return (
    <section id="boutique" className="mt-16 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-5">
        <div>
          <p className="text-[11px] tracking-[0.28em] text-gold uppercase">Rewards boutique</p>
          <h2 className="mt-3 font-serif text-3xl">Everything your points can reach.</h2>
        </div>
        <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          Every reward is scored against your profile and shelves. Nothing is hidden — poor
          matches are labelled, not removed.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-5 border-b border-hairline py-5">
        <FilterGroup
          label="Type"
          value={type}
          options={["All", ...categories]}
          onChange={(v) => setType(v as TypeFilter)}
        />
        <FilterGroup
          label="Eligibility"
          value={elig}
          options={["All rewards", "Within my points", "Gold & above"]}
          onChange={(v) => setElig(v as EligFilter)}
        />
        <FilterGroup
          label="Fit"
          value={fit}
          options={["Everything", "Good and up", "Best fit only"]}
          onChange={(v) => setFit(v as FitFilter)}
        />
        <FilterGroup
          label="Sort"
          value={sort}
          options={["Best fit first", "Points: low to high", "Points: high to low"]}
          onChange={(v) => setSort(v as SortKey)}
        />
        <span className="ml-auto text-xs tracking-[0.14em] text-muted-foreground uppercase">
          {items.length} rewards
        </span>
      </div>


      <div className="mt-10 grid grid-cols-1 gap-px bg-hairline sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false}>
          {items.map(({ reward, score }) => {
            const done = redeemed.includes(reward.id);
            return (
              <motion.div
                layout
                key={reward.id}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <RewardCard
                  reward={reward}
                  score={score}
                  done={done}
                  active={activeId === reward.id}
                  onToggleBag={() => (done ? onRemove(reward) : onRedeem(reward))}
                  onQuickView={() => onQuickView(reward)}
                  onHover={() => onExplain(reward)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {items.length === 0 && (
        <p className="mt-12 text-sm text-muted-foreground">
          No rewards match those filters. Loosen the fit filter to see the full boutique.
        </p>
      )}
    </section>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={`text-[12px] transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none ${
              value === o
                ? "text-ink underline decoration-gold underline-offset-4"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
