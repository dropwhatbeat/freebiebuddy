import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";

import { BeautyGuide, ProductBottle, RewardVessel, ShelfLine } from "./illustrations";
import { catalogue, profileTags, rewards, shelfItems, type ShelfItemId } from "./data";

interface Line {
  d: string;
  key: string;
}

export function PointCurator({
  points,
  onRedeem,
}: {
  points: number;
  onRedeem: (reward: { product: string; points: number }) => void;
}) {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const shelfRefs = useRef<Partial<Record<ShelfItemId, HTMLElement | null>>>({});
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeReward, setActiveReward] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<string[]>([]);

  const computeLines = useCallback(() => {
    const stage = stageRef.current;
    const reward = rewards.find((r) => r.id === activeReward);
    if (!stage || !reward || reward.connects.length === 0) {
      setLines([]);
      return;
    }
    const card = cardRefs.current[reward.id];
    if (!card) return;
    const base = stage.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    const startX = c.left - base.left + c.width / 2;
    const startY = c.top - base.top;
    const next: Line[] = [];
    for (const id of reward.connects) {
      const el = shelfRefs.current[id];
      if (!el) continue;
      const t = el.getBoundingClientRect();
      const endX = t.left - base.left + t.width / 2;
      const endY = t.bottom - base.top - 8;
      const midY = (startY + endY) / 2;
      next.push({
        key: `${reward.id}-${id}`,
        d: `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`,
      });
    }
    setLines(next);
  }, [activeReward]);

  useLayoutEffect(() => {
    computeLines();
  }, [computeLines]);

  useEffect(() => {
    const handler = () => computeLines();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [computeLines]);

  const rise = reduced
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div ref={stageRef} className="relative">
      {/* connector overlay */}
      <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden="true">
        {lines.map((l) => (
          <path
            key={l.key}
            d={l.d}
            fill="none"
            className="stroke-gold"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
        ))}
      </svg>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-8 pt-20 pb-16 md:grid-cols-[1.5fr_1fr]">
        <motion.div
          {...rise}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <p className="text-[11px] tracking-[0.28em] text-gold uppercase">
            Rewards, matched to you
          </p>
          <h1 className="mt-6 max-w-xl font-serif text-5xl leading-[1.08] tracking-tight md:text-6xl">
            Make your points feel more personal.
          </h1>
          <p className="mt-7 max-w-lg text-[15px] leading-relaxed text-charcoal">
            Choose a reward at the point level that feels right today. Your profile helps us surface
            a thoughtful starting point; the entire Rewards Boutique remains yours to explore.
          </p>
        </motion.div>
        <motion.div
          {...rise}
          transition={{ duration: 0.3, ease: "easeOut", delay: reduced ? 0 : 0.1 }}
          className="flex justify-center"
        >
          <BeautyGuide className="h-[320px] w-auto text-ink" />
        </motion.div>
      </section>

      {/* PROFILE */}
      <section className="mx-auto max-w-6xl px-8 pb-16">
        <div className="border border-hairline bg-card">
          <div className="flex flex-wrap items-center justify-between gap-6 px-8 py-6">
            <div className="flex flex-wrap items-center gap-8">
              <h2 className="font-serif text-xl">Your beauty profile</h2>
              <ul className="flex flex-wrap items-center gap-6 text-xs tracking-[0.14em] text-charcoal uppercase">
                {profileTags.map((tag) => (
                  <li key={tag} className="border-b border-gold pb-1">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() =>
                toast("Prototype only", { description: "Editing your profile isn't wired up yet." })
              }
              className="text-xs tracking-[0.18em] text-ink uppercase underline underline-offset-4 transition-colors hover:text-gold focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
            >
              Edit
            </button>
          </div>
          <p className="border-t border-hairline px-8 py-3 text-xs text-muted-foreground">
            Used only to tailor reward suggestions and routine notes.
          </p>
        </div>
      </section>

      {/* SHELF */}
      <section className="mx-auto max-w-6xl px-8 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl">Your current skincare shelf</h2>
            <p className="mt-3 max-w-xl text-sm text-charcoal">
              Only products marked as currently using shape your routine notes.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              toast("Prototype only", { description: "Shelf editing isn't wired up yet." })
            }
            className="text-xs tracking-[0.18em] text-ink uppercase underline underline-offset-4 transition-colors hover:text-gold focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
          >
            Edit shelf
          </button>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
          {shelfItems.map((item) => {
            const linked = rewards
              .find((r) => r.id === activeReward)
              ?.connects.includes(item.id);
            return (
              <div
                key={item.id}
                ref={(el) => {
                  shelfRefs.current[item.id] = el;
                }}
                className="flex flex-col items-center text-center"
              >
                <ProductBottle
                  id={item.id}
                  className={`h-32 w-auto transition-colors duration-300 ${
                    linked ? "text-gold" : "text-ink"
                  }`}
                />
                <p className="mt-5 font-serif text-[15px] leading-snug">{item.name}</p>
                <p className="mt-1 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  {item.role}
                </p>
              </div>
            );
          })}
        </div>
        <ShelfLine className="mt-2 h-4 w-full text-ink" />
        <p className="mt-4 text-xs text-muted-foreground">
          Remove gifts, finished, or unused products at any time.
        </p>
      </section>

      {/* REWARDS */}
      <section className="border-t border-hairline bg-secondary/40">
        <div className="mx-auto max-w-6xl px-8 py-20">
          <h2 className="font-serif text-3xl">Three ways to use your points.</h2>
          <p className="mt-3 max-w-xl text-sm text-charcoal">
            Selected from the Rewards Boutique at three point levels — hover, tap or focus a card for
            its routine note.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[140px_repeat(3,1fr)]">
            <div className="flex items-end justify-center">
              <BeautyGuide className="h-56 w-auto text-ink" />
            </div>
            {rewards.map((reward, i) => {
              const isActive = activeReward === reward.id;
              const done = redeemed.includes(reward.id);
              return (
                <motion.article
                  key={reward.id}
                  ref={(el) => {
                    cardRefs.current[reward.id] = el;
                  }}
                  initial={reduced ? false : { opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    delay: reduced ? 0 : 0.15 + i * 0.22,
                  }}
                  tabIndex={0}
                  onMouseEnter={() => setActiveReward(reward.id)}
                  onMouseLeave={() => setActiveReward((c) => (c === reward.id ? null : c))}
                  onFocus={() => setActiveReward(reward.id)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setActiveReward((c) => (c === reward.id ? null : c));
                    }
                  }}
                  className={`relative flex flex-col bg-card p-7 transition-[transform,box-shadow] duration-300 focus-visible:outline-none ${
                    reward.primary ? "border border-gold" : "border border-hairline"
                  } ${isActive ? "-translate-y-1.5 shadow-[0_18px_40px_-30px_oklch(0.16_0.003_60)]" : ""}`}
                >
                  <RewardVessel variant={i} className="h-14 w-auto self-start text-ink" />
                  <p
                    className={`mt-6 text-[11px] tracking-[0.2em] uppercase ${
                      reward.primary ? "text-gold" : "text-muted-foreground"
                    }`}
                  >
                    {reward.label}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl leading-snug">{reward.product}</h3>
                  <p className="mt-2 text-sm text-charcoal">{reward.detail}</p>
                  <p className="mt-5 font-serif text-lg">{reward.points.toLocaleString()} points</p>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={reduced ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={reduced ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 border-t border-hairline pt-4">
                          <p className="text-[11px] tracking-[0.18em] text-gold uppercase">
                            {reward.noteTitle}
                          </p>
                          <p className="mt-2 text-[13px] leading-relaxed text-charcoal">
                            {reward.note}
                          </p>
                          {reward.caution && (
                            <p className="mt-4 border-l border-gold pl-3 text-[13px] leading-relaxed text-charcoal">
                              {reward.caution}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-7 pt-1">
                    <button
                      type="button"
                      disabled={done}
                      onClick={() => {
                        setRedeemed((r) => [...r, reward.id]);
                        onRedeem({ product: reward.product, points: reward.points });
                      }}
                      className={`w-full py-3 text-[11px] tracking-[0.22em] uppercase transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none ${
                        done
                          ? "border border-hairline text-muted-foreground"
                          : reward.primary
                            ? "bg-ink text-primary-foreground hover:bg-charcoal"
                            : "border border-ink text-ink hover:bg-ink hover:text-primary-foreground"
                      }`}
                    >
                      {done ? "Chosen" : "Choose reward"}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
          <ShelfLine className="mt-6 h-4 w-full text-ink" />
        </div>
      </section>

      {/* CATALOGUE */}
      <section className="mx-auto max-w-6xl px-8 py-20">
        <h2 className="font-serif text-3xl">The full Rewards Boutique is always open.</h2>
        <p className="mt-3 max-w-xl text-sm text-charcoal">
          Browse every available reward and see routine notes where approved information is
          available.
        </p>
        <button
          type="button"
          aria-expanded={showCatalogue}
          onClick={() => setShowCatalogue((v) => !v)}
          className="mt-8 border-b border-ink pb-1 text-xs tracking-[0.2em] uppercase transition-colors hover:border-gold hover:text-gold focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
        >
          {showCatalogue ? "Hide all rewards ←" : "Explore all rewards →"}
        </button>

        <AnimatePresence initial={false}>
          {showCatalogue && (
            <motion.div
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduced ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-12 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
                {catalogue.map((item, i) => (
                  <div key={item.id} className="relative flex flex-col bg-card p-7">
                    <RewardVessel variant={i % 3} className="h-12 w-auto self-start text-ink" />
                    <div className="mt-6 flex items-start justify-between gap-3">
                      <h3 className="font-serif text-lg leading-snug">{item.name}</h3>
                      {item.info && (
                        <button
                          type="button"
                          aria-label={`Routine note for ${item.name}`}
                          aria-expanded={openInfo === item.id}
                          onClick={() => setOpenInfo((c) => (c === item.id ? null : item.id))}
                          onMouseEnter={() => setOpenInfo(item.id)}
                          onMouseLeave={() => setOpenInfo((c) => (c === item.id ? null : c))}
                          onFocus={() => setOpenInfo(item.id)}
                          onBlur={() => setOpenInfo((c) => (c === item.id ? null : c))}
                          className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold text-[10px] text-gold focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
                        >
                          i
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-charcoal">{item.detail}</p>
                    <p className="mt-4 font-serif">{item.points.toLocaleString()} points</p>
                    <AnimatePresence initial={false}>
                      {item.info && openInfo === item.id && (
                        <motion.p
                          initial={reduced ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={reduced ? undefined : { opacity: 0, height: 0 }}
                          transition={{ duration: 0.22 }}
                          className="mt-4 overflow-hidden border-t border-hairline pt-3 text-[13px] leading-relaxed text-charcoal"
                        >
                          {item.info}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
