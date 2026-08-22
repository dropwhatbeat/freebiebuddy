import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface RedeemedEntry {
  id: string;
  name: string;
  points: number;
}

export function PointsBanner({
  points,
  expiring,
  expiryDate,
  redeemed,
  onRemove,
  onSummary,
}: {
  points: number;
  expiring: number;
  expiryDate: string;
  redeemed: RedeemedEntry[];
  onRemove: (id: string) => void;
  onSummary: () => void;
}) {
  const reduced = useReducedMotion();
  const [openList, setOpenList] = useState(false);
  const display = useCountUp(points, reduced ?? false);
  const displayExpiring = useCountUp(expiring, reduced ?? false);


  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto max-w-7xl px-8 pt-10"
      aria-label="Beauty Pass points"
    >
      <div className="relative border border-hairline bg-card px-8 py-8">
        <span
          className="absolute top-0 left-0 h-10 w-10 border-t-2 border-l-2 border-ink"
          aria-hidden="true"
        />
        <span
          className="absolute right-0 bottom-0 h-10 w-10 border-r-2 border-b-2 border-gold"
          aria-hidden="true"
        />

        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-charcoal uppercase">
              Welcome, Michelle
            </p>

            <div className="mt-6 flex items-start gap-10">
              <div>
                <p className="font-serif text-5xl leading-none tabular-nums" aria-live="polite">
                  {display.toLocaleString()}
                </p>
                <p className="mt-3 text-[11px] tracking-[0.2em] text-charcoal uppercase">
                  Points available
                </p>
                <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  After items in your bag
                </p>
              </div>

              <span className="h-20 w-px bg-hairline" aria-hidden="true" />

              <div>
                <p className="font-serif text-5xl leading-none text-gold tabular-nums">
                  {displayExpiring.toLocaleString()}
                </p>
                <p className="mt-3 text-[11px] tracking-[0.2em] text-charcoal uppercase">
                  Points expiring
                </p>
                <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  {expiring === 0 ? "All expiring points used" : `On ${expiryDate}`}
                </p>
              </div>

            </div>

            <div className="mt-8 flex flex-wrap items-center gap-8">
              <button
                type="button"
                onClick={() => setOpenList((o) => !o)}
                aria-expanded={openList}
                className="border-b border-ink pb-0.5 text-[11px] tracking-[0.18em] uppercase transition-colors hover:border-gold hover:text-gold focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
              >
                View bag
                {redeemed.length ? ` (${redeemed.length})` : ""}
              </button>
              <button
                type="button"
                onClick={onSummary}
                className="border-b border-ink pb-0.5 text-[11px] tracking-[0.18em] uppercase transition-colors hover:border-gold hover:text-gold focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
              >
                View points summary
              </button>
            </div>
          </div>

          <p className="font-serif text-4xl tracking-[0.06em] uppercase lg:text-5xl">
            Rewards Boutique
          </p>
        </div>

        <AnimatePresence initial={false}>
          {openList && (
            <motion.div
              key="redeemed"
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-8 border-t border-hairline pt-6">
                <p className="text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
                  In your bag
                </p>
                {redeemed.length === 0 ? (
                  <p className="mt-3 text-[13px] text-charcoal">
                    Your bag is empty. Rewards you add will be listed here with the points they hold.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-hairline">
                    {redeemed.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-4 py-2.5 text-[13px]"
                      >
                        <span>{r.name}</span>
                        <span className="flex items-center gap-4">
                          <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase tabular-nums">
                            −{r.points.toLocaleString()} pts
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemove(r.id)}
                            className="text-[10px] tracking-[0.18em] text-charcoal uppercase hover:text-gold hover:underline focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
                          >
                            Remove
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>

                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

function useCountUp(value: number, reduced: boolean) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      from.current = value;
      return;
    }
    const start = from.current;
    if (start === value) return;
    const t0 = performance.now();
    const dur = 600;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);

  return display;
}
