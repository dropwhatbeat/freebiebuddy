import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { RewardVessel } from "./illustrations";
import { MicroSpark } from "./Genie";
import { rewardCatalogue, rewardTypes, type Reward } from "./data";

type TypeFilter = "All" | (typeof rewardTypes)[number];
type EligFilter = "All rewards" | "Within my points" | "Gold & above";

export function Boutique({
  points,
  redeemed,
  onRedeem,
  onExplain,
}: {
  points: number;
  redeemed: string[];
  onRedeem: (r: Reward) => void;
  onExplain: (r: Reward) => void;
}) {
  const reduced = useReducedMotion();
  const [type, setType] = useState<TypeFilter>("All");
  const [elig, setElig] = useState<EligFilter>("All rewards");
  const [sort, setSort] = useState<"Points: low to high" | "Points: high to low">(
    "Points: low to high",
  );

  const items = useMemo(() => {
    let list = rewardCatalogue.filter((r) => (type === "All" ? true : r.type === type));
    if (elig === "Within my points") list = list.filter((r) => r.points <= points);
    if (elig === "Gold & above") list = list.filter((r) => r.tier === "Gold & above");
    return [...list].sort((a, b) =>
      sort === "Points: low to high" ? a.points - b.points : b.points - a.points,
    );
  }, [type, elig, sort, points]);

  return (
    <section id="boutique" className="border-t border-hairline bg-secondary/30">
      <div className="mx-auto max-w-6xl px-8 py-24">
        <p className="text-[11px] tracking-[0.28em] text-gold uppercase">The full boutique</p>
        <h2 className="mt-5 font-serif text-4xl">Everything your points can reach.</h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-charcoal">
          The Curator only ever suggests — it never hides. Filter the whole Rewards Boutique by
          type and eligibility.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-6 border-y border-hairline py-5">
          <FilterGroup
            label="Type"
            value={type}
            options={["All", ...rewardTypes]}
            onChange={(v) => setType(v as TypeFilter)}
          />
          <FilterGroup
            label="Eligibility"
            value={elig}
            options={["All rewards", "Within my points", "Gold & above"]}
            onChange={(v) => setElig(v as EligFilter)}
          />
          <FilterGroup
            label="Sort"
            value={sort}
            options={["Points: low to high", "Points: high to low"]}
            onChange={(v) => setSort(v as typeof sort)}
          />
          <span className="ml-auto text-xs tracking-[0.14em] text-muted-foreground uppercase">
            {items.length} rewards
          </span>
        </div>

        <motion.div layout className="mt-12 grid grid-cols-1 gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence initial={false}>
            {items.map((r) => {
              const affordable = r.points <= points;
              const done = redeemed.includes(r.id);
              return (
                <motion.article
                  layout
                  key={r.id}
                  initial={reduced ? false : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="group flex flex-col bg-card p-6"
                >
                  <div className="flex items-start justify-between">
                    <RewardVessel
                      variant={r.vessel}
                      className="h-12 w-auto text-ink transition-colors duration-300 group-hover:text-gold"
                    />
                    <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                      {r.type}
                    </span>
                  </div>
                  <p className="mt-6 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    {r.brand}
                  </p>
                  <h3 className="mt-2 font-serif text-lg leading-snug">{r.name}</h3>
                  <p className="mt-3 font-serif">{r.points.toLocaleString()} pts</p>
                  <p className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                    {r.tier}
                  </p>

                  <div className="mt-6 flex items-center gap-4 pt-1">
                    <button
                      type="button"
                      disabled={done || !affordable}
                      onClick={() => onRedeem(r)}
                      className={`flex-1 py-2.5 text-[10px] tracking-[0.2em] uppercase transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none ${
                        done || !affordable
                          ? "border border-hairline text-muted-foreground"
                          : "border border-ink text-ink hover:bg-ink hover:text-primary-foreground"
                      }`}
                    >
                      {done ? "Claimed" : affordable ? "Claim" : "Not enough"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onExplain(r)}
                      aria-label={`Ask the Curator about ${r.name}`}
                      className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] text-gold uppercase hover:underline focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
                    >
                      <MicroSpark /> Ask
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
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
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
        {label}
      </span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`relative pb-1 text-xs transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none ${
            value === o ? "text-ink" : "text-muted-foreground hover:text-ink"
          }`}
        >
          {o}
          {value === o && (
            <motion.span
              layoutId={`filter-${label}`}
              className="absolute inset-x-0 -bottom-px h-px bg-gold"
            />
          )}
        </button>
      ))}
    </div>
  );
}
