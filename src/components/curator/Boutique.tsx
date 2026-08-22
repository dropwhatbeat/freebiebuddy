import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { RewardVessel } from "./illustrations";
import { MicroSpark } from "./CompactOrb";
import { categories, type Reward } from "./data";
import { tierRank, type FitTier, type Score } from "./scoring";

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
  onExplain,
  activeId,
}: {
  scored: ScoredReward[];
  redeemed: string[];
  onRedeem: (r: Reward) => void;
  onExplain: (r: Reward) => void;
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
              <motion.article
                layout
                key={reward.id}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onMouseEnter={() => onExplain(reward)}
                onFocus={() => onExplain(reward)}
                tabIndex={0}
                className={`group flex flex-col bg-card p-6 transition-colors focus-visible:outline-none ${
                  activeId === reward.id ? "bg-secondary/40" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <RewardVessel
                    variant={reward.vessel}
                    className={`h-12 w-auto transition-colors duration-300 ${
                      score.tier === "Not for your skin"
                        ? "text-muted-foreground"
                        : "text-ink group-hover:text-gold"
                    }`}
                  />
                  <span className="text-right text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                    {reward.category}
                  </span>
                </div>




                <FitBadge tier={score.tier} segments={score.segments} />

                <p className="mt-4 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                  {reward.brand}
                </p>
                <h3 className="mt-2 font-serif text-lg leading-snug">{reward.name}</h3>
                <p className="mt-3 font-serif">{reward.points.toLocaleString()} pts</p>
                <p className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                  {reward.tier}
                </p>

                <p className="mt-4 text-[13px] leading-relaxed text-charcoal">
                  {score.headline}
                </p>

                <ul className="mt-3 space-y-1.5 border-t border-hairline pt-3 text-[12px] leading-relaxed text-muted-foreground transition-opacity duration-300">
                  {score.lines.map((l) => (
                    <li key={l.label} className="flex gap-2">
                      <span
                        aria-hidden
                        className={
                          l.weight === "negative"
                            ? "text-charcoal"
                            : l.weight === "positive"
                              ? "text-gold"
                              : "text-muted-foreground"
                        }
                      >
                        {l.weight === "negative" ? "—" : l.weight === "positive" ? "+" : "·"}
                      </span>
                      <span>
                        <span className="text-ink">{l.label}.</span> {l.detail}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex items-center gap-4 pt-6">
                  <button
                    type="button"
                    disabled={done || !score.affordable}
                    onClick={() => onRedeem(reward)}
                    className={`flex-1 py-2.5 text-[10px] tracking-[0.2em] uppercase transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none ${
                      done || !score.affordable
                        ? "border border-hairline text-muted-foreground"
                        : "border border-ink text-ink hover:bg-ink hover:text-primary-foreground"
                    }`}
                  >
                    {done
                      ? "Claimed"
                      : score.affordable
                        ? "Claim reward"
                        : `${score.shortBy.toLocaleString()} pts short`}
                  </button>
                  <button
                    type="button"
                    onClick={() => onExplain(reward)}
                    aria-label={`Ask the Curator about ${reward.name}`}
                    className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] text-gold uppercase hover:underline focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
                  >
                    <MicroSpark className="h-2.5 w-2.5" /> Ask
                  </button>
                </div>
              </motion.article>
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

export function FitBadge({
  tier,
  segments,
  className = "",
}: {
  tier: FitTier;
  segments: number;
  className?: string;
}) {
  return (
    <div className={`mt-5 flex items-center gap-3 ${className}`}>
      <span
        className={`flex gap-1`}
        role="img"
        aria-label={`${tier}, ${segments} of 3`}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{ opacity: i < segments ? 1 : 0.18 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className={`block h-[3px] w-6 ${
              tier === "Not for your skin" ? "bg-charcoal" : "bg-gold"
            }`}
          />
        ))}
      </span>
      <span
        className={`text-[10px] tracking-[0.2em] uppercase ${
          tier === "Best fit"
            ? "text-gold"
            : tier === "Good fit"
              ? "text-charcoal"
              : "text-muted-foreground"
        }`}
      >
        {tier}
      </span>
    </div>
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
