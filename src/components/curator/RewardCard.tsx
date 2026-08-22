import { motion, useReducedMotion } from "motion/react";

import { RewardVessel } from "./illustrations";

import type { Reward } from "./data";
import type { Score } from "./scoring";

export function RewardCard({
  reward,
  score,
  done,
  active,
  onToggleBag,
  onQuickView,
  onHover,
  onLeave,
}: {
  reward: Reward;
  score: Score;
  done: boolean;
  active: boolean;
  onToggleBag: () => void;
  onQuickView: () => void;
  onHover: () => void;
  onLeave?: () => void;
}) {
  const reduced = useReducedMotion();
  const dim = false;

  return (
    <article
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      tabIndex={0}
      className={`group flex h-full flex-col bg-card p-5 transition-colors focus-visible:outline-none ${
        active ? "bg-secondary/40" : ""
      }`}
    >
      <div className="relative flex h-24 items-center justify-center">
        {reward.image ? (
          <img
            src={reward.image}
            alt={`${reward.brand} ${reward.name}`}
            loading="lazy"
            className={`h-20 w-auto object-contain transition-transform duration-300 group-hover:-translate-y-0.5 ${
              dim ? "opacity-50 grayscale" : ""
            }`}
          />
        ) : (
          <RewardVessel
            variant={reward.vessel}
            className={`h-12 w-auto transition-transform duration-300 group-hover:-translate-y-0.5 ${
              dim ? "text-muted-foreground" : "text-ink group-hover:text-gold"
            }`}
          />
        )}

        <button
          type="button"
          onClick={onQuickView}
          className="absolute inset-x-0 bottom-0 bg-ink/90 py-2 text-[10px] tracking-[0.22em] text-primary-foreground uppercase opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
        >
          Quick view
        </button>
      </div>

      <p className="mt-4 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        {reward.tier}
      </p>
      <p className="mt-2 text-[11px] font-semibold tracking-[0.12em] text-ink uppercase">
        {reward.brand}
      </p>
      <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] font-serif text-base leading-snug">
        {reward.name}
      </h3>
      <p className="mt-1 font-serif">{reward.points.toLocaleString()} pts</p>

      <motion.button
        type="button"
        {...(reduced ? {} : { whileTap: { scale: 0.985 } })}
        disabled={!done && !score.affordable}
        onClick={onToggleBag}
        className={`mt-4 w-full py-3 text-[11px] tracking-[0.18em] uppercase transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none ${
          done
            ? "border border-gold bg-gold-soft/40 text-ink hover:bg-transparent"
            : !score.affordable
              ? "border border-hairline text-muted-foreground"
              : "bg-ink text-primary-foreground hover:bg-charcoal"
        }`}
      >
        {done
          ? "In bag — remove"
          : score.affordable
            ? "Add to bag"
            : `${score.shortBy.toLocaleString()} pts short`}
      </motion.button>
    </article>
  );
}
