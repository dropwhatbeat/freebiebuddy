import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";

import { ProductBottle, RewardVessel, ShelfLine } from "./illustrations";
import { GenieMascot, GenieSpeech, MicroSpark } from "./Genie";
import { Boutique } from "./Boutique";
import {
  concerns,
  defaultShelf,
  pastPurchases,
  rewardCatalogue,
  type ConcernId,
  type Reward,
} from "./data";

interface Line {
  key: string;
  d: string;
}

interface Message {
  title: string;
  body: string;
  caution?: string | undefined;
}

const idleMessage: Message = {
  title: "Curator · reading your shelf",
  body: "I compare what you are using against what you told me your skin needs, then look for the smallest reward that closes the difference. Hover a product or a reward and I'll show my reasoning.",
};

export function PointCurator({
  points,
  onRedeem,
}: {
  points: number;
  onRedeem: (reward: { product: string; points: number }) => void;
}) {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const shelfRefs = useRef<Record<string, HTMLElement | null>>({});
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  const [selected, setSelected] = useState<ConcernId[]>([
    "hydration",
    "barrier",
    "brightening",
    "texture",
  ]);
  const [shelf, setShelf] = useState<string[]>(defaultShelf);
  const [activeReward, setActiveReward] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(idleMessage);
  const [thinking, setThinking] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [redeemed, setRedeemed] = useState<string[]>([]);

  const shelfProducts = useMemo(
    () => pastPurchases.filter((p) => shelf.includes(p.id)),
    [shelf],
  );
  const covered = useMemo(
    () => new Set(shelfProducts.flatMap((p) => p.covers)),
    [shelfProducts],
  );
  const gaps = useMemo(
    () => selected.filter((c) => !covered.has(c)),
    [selected, covered],
  );

  const suggestions = useMemo(() => {
    const scoreGap = (r: Reward) => r.covers.filter((c) => gaps.includes(c)).length;
    if (gaps.length) {
      return [...rewardCatalogue]
        .filter((r) => scoreGap(r) > 0)
        .sort((a, b) => scoreGap(b) - scoreGap(a) || a.points - b.points)
        .slice(0, 3);
    }
    return [...rewardCatalogue]
      .filter((r) => r.covers.some((c) => selected.includes(c)))
      .sort((a, b) => a.points - b.points)
      .slice(0, 3);
  }, [gaps, selected]);

  /* brief "thinking" pulse whenever the inputs change */
  useEffect(() => {
    setThinking(true);
    const t = setTimeout(() => setThinking(false), 900);
    return () => clearTimeout(t);
  }, [selected, shelf]);

  const computeLines = useCallback(() => {
    const stage = stageRef.current;
    const reward = rewardCatalogue.find((r) => r.id === activeReward);
    if (!stage || !reward || reward.pairsWith.length === 0) {
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
    for (const id of reward.pairsWith) {
      const el = shelfRefs.current[id];
      if (!el) continue;
      const t = el.getBoundingClientRect();
      const endX = t.left - base.left + t.width / 2;
      const endY = t.bottom - base.top - 10;
      const midY = (startY + endY) / 2;
      next.push({
        key: `${reward.id}-${id}`,
        d: `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`,
      });
    }
    setLines(next);
  }, [activeReward]);

  useLayoutEffect(() => computeLines(), [computeLines]);
  useEffect(() => {
    const h = () => computeLines();
    window.addEventListener("resize", h);
    window.addEventListener("scroll", h, true);
    return () => {
      window.removeEventListener("resize", h);
      window.removeEventListener("scroll", h, true);
    };
  }, [computeLines]);

  const linkedShelf = useMemo(
    () => rewardCatalogue.find((r) => r.id === activeReward)?.pairsWith ?? [],
    [activeReward],
  );

  const rise = reduced ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } };

  const redeem = (r: Reward) => {
    setRedeemed((v) => [...v, r.id]);
    onRedeem({ product: r.name, points: r.points });
    setMessage({
      title: "Curator · added to your routine",
      body: `${r.name} is on its way. ${r.routine}`,
    });
  };

  return (
    <div ref={stageRef} className="relative">
      <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden="true">
        {lines.map((l) => (
          <motion.path
            key={l.key}
            d={l.d}
            fill="none"
            className="stroke-gold"
            strokeWidth="1"
            strokeDasharray="3 5"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </svg>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-8 pt-20 pb-20 md:grid-cols-[1.35fr_1fr]">
        <motion.div {...rise} transition={{ duration: 0.35, ease: "easeOut" }}>
          <p className="flex items-center gap-2 text-[11px] tracking-[0.28em] text-gold uppercase">
            <MicroSpark /> AI point curator
          </p>
          <h1 className="mt-6 max-w-xl font-serif text-5xl leading-[1.06] tracking-tight md:text-[3.9rem]">
            Michelle, your shelf is <em className="not-italic text-gold">almost</em> complete.
          </h1>
          <p className="mt-7 max-w-lg text-[15px] leading-relaxed text-charcoal">
            I read the {shelfProducts.length} products you are using against the{" "}
            {selected.length} concerns in your skin profile, then spend your{" "}
            {points.toLocaleString()} points on the difference.
          </p>
          <div className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-hairline pt-6 text-xs tracking-[0.14em] uppercase">
            <Stat label="Shelf" value={`${shelfProducts.length} products`} />
            <Stat label="Concerns covered" value={`${selected.length - gaps.length}/${selected.length}`} />
            <Stat label="Open gaps" value={gaps.length ? `${gaps.length}` : "None"} />
          </div>
        </motion.div>

        <motion.div
          {...rise}
          transition={{ duration: 0.4, ease: "easeOut", delay: reduced ? 0 : 0.12 }}
          className="flex justify-center"
        >
          <GenieMascot className="h-[330px] w-[210px]" thinking={thinking} />
        </motion.div>
      </section>

      {/* PROFILE + SHELF */}
      <section className="mx-auto max-w-6xl px-8 pb-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.4fr]">
          {/* skin profile */}
          <div className="border border-hairline bg-card p-8">
            <h2 className="font-serif text-2xl">Skin profile</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-charcoal">
              Tap a concern to add or remove it — I re-curate instantly.
            </p>
            <ul className="mt-7 space-y-px">
              {concerns.map((c) => {
                const on = selected.includes(c.id);
                const gap = gaps.includes(c.id);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setSelected((s) =>
                          s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id],
                        )
                      }
                      className={`flex w-full items-center justify-between gap-4 border-b border-hairline py-3 text-left transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none ${
                        on ? "text-ink" : "text-muted-foreground hover:text-ink"
                      }`}
                    >
                      <span>
                        <span className="text-[13px] tracking-[0.1em] uppercase">{c.label}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground normal-case">
                          {c.blurb}
                        </span>
                      </span>
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                          on ? "border-gold bg-gold-soft" : "border-hairline"
                        }`}
                      >
                        {on && !gap && <span className="h-1.5 w-1.5 bg-gold" />}
                        {on && gap && <span className="text-[9px] leading-none text-gold">!</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              ! marks a concern nothing on your shelf currently addresses.
            </p>
          </div>

          {/* shelf */}
          <div className="border border-hairline bg-card p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl">Your shelf</h2>
                <p className="mt-3 text-[13px] text-charcoal">
                  Built from what you are actually using. Hover a product for my notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen((v) => !v)}
                aria-expanded={drawerOpen}
                className="text-[11px] tracking-[0.2em] text-ink uppercase underline underline-offset-4 transition-colors hover:text-gold focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
              >
                {drawerOpen ? "Close purchases" : "Add from past purchases"}
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
              <AnimatePresence initial={false}>
                {shelfProducts.map((p) => {
                  const linked = linkedShelf.includes(p.id);
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={reduced ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      ref={(el) => {
                        shelfRefs.current[p.id] = el;
                      }}
                      className="group relative flex flex-col items-center text-center"
                    >
                      <button
                        type="button"
                        onMouseEnter={() =>
                          setMessage({
                            title: `Curator · ${p.step.toLowerCase()} step`,
                            body: `${p.routine} ${p.why}`,
                          })
                        }
                        onFocus={() =>
                          setMessage({
                            title: `Curator · ${p.step.toLowerCase()} step`,
                            body: `${p.routine} ${p.why}`,
                          })
                        }
                        className="focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
                      >
                        <motion.span
                          className="block"
                          whileHover={reduced ? {} : { y: -6 }}
                          transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        >
                          <ProductBottle
                            id={p.vessel}
                            className={`h-24 w-auto transition-colors duration-300 ${
                              linked ? "text-gold" : "text-ink group-hover:text-gold"
                            }`}
                          />
                        </motion.span>
                      </button>
                      <p className="mt-4 font-serif text-[14px] leading-snug">{p.name}</p>
                      <p className="mt-1 text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                        {p.step}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShelf((s) => s.filter((x) => x !== p.id))}
                        className="mt-2 text-[10px] tracking-[0.14em] text-muted-foreground uppercase opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                      >
                        Remove
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <ShelfLine className="mt-3 h-4 w-full text-ink" />

            <AnimatePresence initial={false}>
              {drawerOpen && (
                <motion.div
                  initial={reduced ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-8 border-t border-hairline pt-6">
                    <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                      Past purchases · Beauty Pass history
                    </p>
                    <ul className="mt-4 space-y-px">
                      {pastPurchases.map((p) => {
                        const on = shelf.includes(p.id);
                        return (
                          <li
                            key={p.id}
                            className="flex items-center justify-between gap-4 border-b border-hairline py-3"
                          >
                            <span>
                              <span className="font-serif text-[15px]">{p.name}</span>
                              <span className="ml-3 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                                {p.brand} · {p.step}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setShelf((s) =>
                                  on ? s.filter((x) => x !== p.id) : [...s, p.id],
                                )
                              }
                              className={`shrink-0 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none ${
                                on
                                  ? "border border-hairline text-muted-foreground"
                                  : "border border-ink text-ink hover:bg-ink hover:text-primary-foreground"
                              }`}
                            >
                              {on ? "On shelf" : "Add"}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* GAP READOUT */}
      <section className="mx-auto max-w-6xl px-8 py-16">
        <div className="border border-hairline bg-card">
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-hairline px-8 py-5">
            <p className="flex items-center gap-2 text-[11px] tracking-[0.24em] text-gold uppercase">
              <motion.span
                animate={thinking && !reduced ? { rotate: 360 } : {}}
                transition={{ duration: 0.9, ease: "linear" }}
                className="flex"
              >
                <MicroSpark />
              </motion.span>
              {thinking ? "Re-curating…" : "Live match analysis"}
            </p>
            <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
              {selected.length - gaps.length} of {selected.length} concerns covered
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3">
            {selected.map((id) => {
              const c = concerns.find((x) => x.id === id)!;
              const gap = gaps.includes(id);
              const by = shelfProducts.filter((p) => p.covers.includes(id));
              return (
                <div key={id} className="bg-card px-8 py-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[12px] tracking-[0.16em] uppercase">{c.label}</p>
                    <span
                      className={`text-[10px] tracking-[0.16em] uppercase ${
                        gap ? "text-gold" : "text-muted-foreground"
                      }`}
                    >
                      {gap ? "Gap" : "Covered"}
                    </span>
                  </div>
                  <div className="mt-4 h-px w-full bg-hairline">
                    <motion.div
                      className={gap ? "h-px bg-gold" : "h-px bg-ink"}
                      initial={{ width: 0 }}
                      animate={{ width: gap ? "22%" : "100%" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-4 text-[13px] leading-relaxed text-charcoal">
                    {gap
                      ? "Nothing on your shelf targets this yet."
                      : `Handled by ${by.map((p) => p.name).join(", ")}.`}
                  </p>
                </div>
              );
            })}
            {selected.length === 0 && (
              <div className="bg-card px-8 py-6 text-[13px] text-charcoal">
                Pick a concern above and I will start matching.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SUGGESTIONS + GENIE */}
      <section className="border-t border-hairline bg-secondary/40">
        <div className="mx-auto max-w-6xl px-8 py-20">
          <h2 className="font-serif text-4xl">
            {gaps.length
              ? "Three rewards that close the gap."
              : "Nothing missing — so, more of what you love."}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-charcoal">
            {gaps.length
              ? `Your profile flags ${gaps
                  .map((g) => concerns.find((c) => c.id === g)!.label.toLowerCase())
                  .join(" and ")}, and nothing on your shelf answers that yet.`
              : "Your shelf already answers every concern you listed, so I am leaning on what you actually enjoy redeeming — hydration, and the products you finish."}
          </p>

          <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[300px_1fr]">
            {/* mascot column */}
            <div id="genie-anchor" className="lg:sticky lg:top-24 lg:self-start">
              <div className="flex items-start gap-4">
                <GenieMascot className="h-40 w-24 shrink-0" thinking={thinking} />
                <div className="flex-1">
                  <GenieSpeech {...message} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {suggestions.map((r, i) => {
                const isActive = activeReward === r.id;
                const done = redeemed.includes(r.id);
                const affordable = r.points <= points;
                const closes = r.covers.filter((c) => gaps.includes(c));
                return (
                  <motion.article
                    key={r.id}
                    layout
                    ref={(el) => {
                      cardRefs.current[r.id] = el;
                    }}
                    initial={reduced ? false : { opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: reduced ? 0 : i * 0.12 }}
                    tabIndex={0}
                    onMouseEnter={() => {
                      setActiveReward(r.id);
                      setMessage({
                        title: `Curator · why ${r.name}`,
                        body: `${r.why} ${r.routine}`,
                        caution: r.caution,
                      });
                    }}
                    onFocus={() => {
                      setActiveReward(r.id);
                      setMessage({
                        title: `Curator · why ${r.name}`,
                        body: `${r.why} ${r.routine}`,
                        caution: r.caution,
                      });
                    }}
                    onMouseLeave={() => setActiveReward((c) => (c === r.id ? null : c))}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node))
                        setActiveReward((c) => (c === r.id ? null : c));
                    }}
                    className={`relative flex flex-col bg-card p-7 transition-[transform,box-shadow] duration-300 focus-visible:outline-none ${
                      i === 0 ? "border border-gold" : "border border-hairline"
                    } ${isActive ? "-translate-y-1.5 shadow-[0_18px_40px_-30px_oklch(0.16_0.003_60)]" : ""}`}
                  >
                    <RewardVessel
                      variant={r.vessel}
                      className={`h-14 w-auto self-start transition-colors ${
                        isActive ? "text-gold" : "text-ink"
                      }`}
                    />
                    <p className="mt-6 text-[10px] tracking-[0.2em] text-gold uppercase">
                      {closes.length
                        ? `Closes ${closes
                            .map((c) => concerns.find((x) => x.id === c)!.label.toLowerCase())
                            .join(" + ")}`
                        : i === 0
                          ? "Best match for you"
                          : "Because you enjoy hydration"}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl leading-snug">{r.name}</h3>
                    <p className="mt-2 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                      {r.brand} · {r.type}
                    </p>
                    <p className="mt-5 font-serif text-lg">{r.points.toLocaleString()} points</p>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={reduced ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <p className="mt-5 border-t border-hairline pt-4 text-[13px] leading-relaxed text-charcoal">
                            {r.routine}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-auto pt-7">
                      <button
                        type="button"
                        disabled={done || !affordable}
                        onClick={() => redeem(r)}
                        className={`w-full py-3 text-[11px] tracking-[0.22em] uppercase transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none ${
                          done || !affordable
                            ? "border border-hairline text-muted-foreground"
                            : i === 0
                              ? "bg-ink text-primary-foreground hover:bg-charcoal"
                              : "border border-ink text-ink hover:bg-ink hover:text-primary-foreground"
                        }`}
                      >
                        {done ? "Chosen" : affordable ? "Choose reward" : "Not enough points"}
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Boutique
        points={points}
        redeemed={redeemed}
        onRedeem={(r) => {
          redeem(r);
          toast("Added to your Beauty Pass", { description: r.name });
        }}
        onExplain={(r) => {
          setMessage({
            title: `Curator · ${r.name}`,
            body: `${r.why} ${r.routine}`,
            caution: r.caution,
          });
          document.getElementById("genie-anchor")?.scrollIntoView({ behavior: "smooth" });
          toast("The Curator has notes", { description: "Scroll up to read the reasoning." });
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col gap-1">
      <span className="text-[10px] tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="font-serif text-lg tracking-normal normal-case">{value}</span>
    </span>
  );
}
