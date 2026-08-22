import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";

import { RewardVessel } from "./illustrations";
import { FitBadge } from "./FitBadge";
import { MicroSpark } from "./CompactOrb";
import { rewardIngredients, rewardTerms, type Reward } from "./data";
import type { Score } from "./scoring";

export function QuickView({
  reward,
  score,
  done,
  onToggleBag,
  onClose,
}: {
  reward: Reward | null;
  score: Score | null;
  done: boolean;
  onToggleBag: () => void;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!reward) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reward, onClose]);

  return (
    <AnimatePresence>
      {reward && score && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close quick view"
            onClick={onClose}
            className="absolute inset-0 bg-ink/50"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${reward.brand} ${reward.name}`}
            initial={reduced ? false : { opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative grid max-h-[86vh] w-full max-w-4xl grid-cols-1 overflow-y-auto bg-card shadow-xl md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-5 text-2xl leading-none text-charcoal hover:text-ink focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
            >
              ×
            </button>

            <div className="flex items-center justify-center bg-secondary/40 p-12">
              {reward.image ? (
                <img
                  src={reward.image}
                  alt={`${reward.brand} ${reward.name}`}
                  className="h-56 w-auto object-contain"
                />
              ) : (
                <RewardVessel variant={reward.vessel} className="h-32 w-auto text-ink" />
              )}
            </div>


            <div className="p-8 md:p-10">
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                {reward.tier} · {reward.category}
              </p>
              <p className="mt-3 text-[11px] font-semibold tracking-[0.12em] text-ink uppercase">
                {reward.brand}
              </p>
              <h2 className="mt-1 font-serif text-2xl leading-snug">{reward.name}</h2>
              <p className="mt-2 font-serif text-lg">{reward.points.toLocaleString()} pts</p>

              <FitBadge tier={score.tier} segments={score.segments} className="mt-5" />

              <button
                type="button"
                disabled={!done && !score.affordable}
                onClick={onToggleBag}
                className={`mt-6 w-full py-3.5 text-[11px] tracking-[0.2em] uppercase transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none sm:w-64 ${
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
              </button>

              <section className="mt-8 border-t border-hairline pt-6">
                <p className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-gold uppercase">
                  <MicroSpark /> Freebie Buddy's read
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-charcoal">{score.headline}</p>
                <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-muted-foreground">
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
              </section>

              {reward.blurb && (
                <section className="mt-6 border-t border-hairline pt-6">
                  <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                    Editor's note
                  </p>
                  <p className="mt-3 text-[12px] leading-relaxed text-charcoal">{reward.blurb}</p>
                </section>
              )}

              <section className="mt-6 border-t border-hairline pt-6">

                <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                  Key actives
                </p>
                <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-muted-foreground">
                  {(rewardIngredients[reward.id] ?? []).map((ing) => (
                    <li key={ing.name}>
                      <span className="text-ink">{ing.name}.</span> {ing.note}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-6 border-t border-hairline pt-6">
                <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                  In your routine
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-charcoal">{reward.routine}</p>
                {reward.caution && (
                  <p className="mt-2 text-[12px] leading-relaxed text-charcoal">
                    <span className="text-gold">Watch:</span> {reward.caution}
                  </p>
                )}
              </section>

              <p className="mt-6 border-t border-hairline pt-6 text-[11px] leading-relaxed text-muted-foreground">
                {rewardTerms}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
