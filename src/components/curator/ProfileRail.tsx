import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";

import { ProductBottle } from "./illustrations";
import { MicroSpark } from "./CompactOrb";
import {
  categories,
  concerns,
  pastPurchases,
  type Category,
  type ConcernId,
  type SkinType,
} from "./data";

const quips = [
  "Careful — those are limited edition.",
  "Please don't rattle the shelf, I just alphabetised it.",
  "One more shake and the serum files a complaint.",
];

export function ProfileRail({
  open,
  onToggle,
  skinType,
  selected,
  shelf,
  onToggleShelf,
  gaps,
  onQuip,
}: {
  open: boolean;
  onToggle: () => void;
  skinType: SkinType;
  selected: ConcernId[];
  shelf: string[];
  onToggleShelf: (id: string) => void;
  gaps: ConcernId[];
  onQuip?: ((line: string) => void) | undefined;
}) {
  const reduced = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  const body = (
    <>
      {/* Beauty profile — read-only mini tags */}
      <section className="border-b border-hairline px-5 py-4">
        <h3 className="font-serif text-base">Beauty profile</h3>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] tracking-[0.18em] text-muted-foreground uppercase">
            Type
          </span>
          <Tag>{skinType} skin</Tag>
        </div>

        {categories.map((cat) => {
          const mine = concerns.filter(
            (c) => c.category === cat && selected.includes(c.id),
          );
          if (!mine.length) return null;
          return (
            <div key={cat} className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] tracking-[0.18em] text-muted-foreground uppercase">
                {cat}
              </span>
              {mine.map((c) => (
                <Tag key={c.id} flagged={gaps.includes(c.id)} title={c.blurb}>
                  {c.label}
                </Tag>
              ))}
            </div>
          );
        })}

        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          {gaps.length
            ? `${gaps.length} concern${gaps.length > 1 ? "s" : ""} your shelves lack today.`
            : "Your shelves answer every concern you've flagged."}
        </p>

        <button
          type="button"
          onClick={() =>
            toast("Prototype", { description: "Your full Beauty Profile would open here." })
          }
          className="mt-3 text-[9px] tracking-[0.18em] text-gold uppercase hover:underline focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
        >
          View my beauty profile ›
        </button>
      </section>

      <section className="px-5 py-5">
        <h3 className="font-serif text-lg">Your shelves</h3>

        {categories.map((cat) => (
          <ShelfGroup
            key={cat}
            category={cat}
            shelf={shelf}
            onToggleShelf={onToggleShelf}
            reduced={Boolean(reduced)}
            onQuip={onQuip}
          />
        ))}
      </section>
    </>
  );

  return (
    <>
      {/* Mobile — collapsed by default, expands downward in normal flow */}
      <div className="lg:hidden">
        <div className="border border-hairline bg-card">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            className="flex w-full items-center justify-between px-5 py-4 text-left focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
          >
            <span className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-gold uppercase">
              <MicroSpark /> Profile &amp; shelf
            </span>
            <span className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              {mobileOpen ? "Hide ›" : "Show ›"}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {mobileOpen && (
              <motion.div
                key="mobile-rail"
                initial={reduced ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="overflow-hidden border-t border-hairline"
              >
                {body}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop */}
      {!open ? (
        <div className="sticky top-24 hidden h-fit lg:block">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-3 border border-hairline bg-card px-3 py-6 text-[10px] tracking-[0.2em] text-charcoal uppercase [writing-mode:vertical-rl] hover:text-ink focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
          >
            Profile &amp; shelf ›
          </button>
        </div>
      ) : (
        <motion.aside
          initial={reduced ? false : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] overflow-y-auto border border-hairline bg-card lg:block"
        >
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <p className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-gold uppercase">
              <MicroSpark /> Reading from
            </p>
            <button
              type="button"
              onClick={onToggle}
              aria-label="Collapse profile and shelf"
              className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase hover:text-ink focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
            >
              ‹ Hide
            </button>
          </div>
          {body}
        </motion.aside>
      )}
    </>
  );
}


function ShelfGroup({
  category,
  shelf,
  onToggleShelf,
  reduced,
  onQuip,
}: {
  category: Category;
  shelf: string[];
  onToggleShelf: (id: string) => void;
  reduced: boolean;
  onQuip?: ((line: string) => void) | undefined;
}) {
  const [adding, setAdding] = useState(false);
  const [wobble, setWobble] = useState(0);
  const clicks = useRef<number[]>([]);
  const items = pastPurchases.filter((p) => p.category === category);
  const onShelf = items.filter((p) => shelf.includes(p.id));
  const notOnShelf = items.filter((p) => !shelf.includes(p.id));

  const nudge = () => {
    if (reduced) return;
    setWobble((w) => w + 1);
    const now = Date.now();
    clicks.current = [...clicks.current, now].filter((t) => now - t < 1600);
    if (clicks.current.length >= 3) {
      clicks.current = [];
      onQuip?.(quips[Math.floor(Math.random() * quips.length)] ?? quips[0]!);
    }
  };

  return (
    <div className="mt-5">
      <p className="flex items-baseline justify-between text-[10px] tracking-[0.2em] text-ink uppercase">
        {category} — currently using:
        <span className="text-muted-foreground">{onShelf.length}</span>
      </p>

      {/* The shelf itself */}
      <div
        key={wobble}
        className={wobble && !reduced ? "shelf-wobble" : undefined}
        onClick={nudge}
        role="presentation"
      >
        <div className="flex min-h-[52px] items-end gap-1 px-1">
          <AnimatePresence initial={false}>
            {onShelf.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={reduced ? false : { opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -10, rotate: -25 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
                className="group relative"
              >
                <div
                  className={`relative transition-transform duration-200 group-hover:-translate-y-1 ${
                    wobble && !reduced ? "bottle-jiggle" : ""
                  }`}
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={`${p.brand} ${p.name}`}
                      loading="lazy"
                      className="h-11 w-9 object-contain object-bottom mix-blend-multiply"
                    />
                  ) : (
                    <ProductBottle
                      id={p.vessel}
                      className="h-11 w-auto shrink-0 text-charcoal transition-colors group-hover:text-ink"
                    />
                  )}
                </div>

                {/* hover label + remove */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-36 -translate-x-1/2 border border-hairline bg-card px-2 py-1.5 opacity-0 shadow-sm transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                  <p className="text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                    {p.brand}
                  </p>
                  <p className="text-[11px] leading-tight text-ink">{p.name}</p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleShelf(p.id);
                    }}
                    className="mt-1 text-[9px] tracking-[0.16em] text-muted-foreground uppercase hover:text-ink focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
                  >
                    × Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {onShelf.length === 0 && (
            <div className="h-10 w-7 rounded-sm border border-dashed border-hairline" />
          )}
        </div>

        {/* plank */}
        <div className="h-px w-full bg-ink/70" />
        <div className="h-1.5 w-full bg-gradient-to-b from-ink/10 to-transparent" />
      </div>

      <AnimatePresence initial={false}>
        {adding && notOnShelf.length > 0 && (
          <motion.ul
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {notOnShelf.map((p) => (
              <li key={p.id} className="flex items-center gap-2 border-b border-hairline py-1.5">
                {p.image ? (
                  <img
                    src={p.image}
                    alt=""
                    loading="lazy"
                    className="h-6 w-6 shrink-0 object-contain mix-blend-multiply"
                  />
                ) : (
                  <ProductBottle id={p.vessel} className="h-6 w-auto shrink-0 text-charcoal" />
                )}
                <span className="min-w-0 flex-1 truncate text-[12px] text-charcoal">
                  <span className="text-muted-foreground">{p.brand}</span> {p.name}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleShelf(p.id)}
                  aria-label={`Add ${p.name} to shelf`}
                  className="text-[10px] tracking-[0.16em] text-gold uppercase hover:underline focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
                >
                  + Add
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {notOnShelf.length > 0 && (
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="mt-2 border border-hairline px-2 py-1 text-[9px] tracking-[0.18em] text-charcoal uppercase transition-colors hover:border-gold hover:text-ink focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
        >
          {adding ? "Close" : `+ Add from past purchases (${notOnShelf.length})`}
        </button>
      )}
    </div>
  );
}

function Tag({
  flagged,
  children,
  title,
}: {
  flagged?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`border px-1.5 py-0.5 text-[10px] tracking-[0.06em] ${
        flagged ? "border-gold bg-gold-soft/40 text-ink" : "border-hairline text-charcoal"
      }`}
    >
      {children}
    </span>
  );
}
