import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { ProductBottle } from "./illustrations";
import { MicroSpark } from "./CompactOrb";
import {
  categories,
  concerns,
  pastPurchases,
  skinTypes,
  type Category,
  type ConcernId,
  type SkinType,
} from "./data";

export function ProfileRail({
  open,
  onToggle,
  skinType,
  onSkinType,
  selected,
  onToggleConcern,
  shelf,
  onToggleShelf,
  gaps,
}: {
  open: boolean;
  onToggle: () => void;
  skinType: SkinType;
  onSkinType: (s: SkinType) => void;
  selected: ConcernId[];
  onToggleConcern: (c: ConcernId) => void;
  shelf: string[];
  onToggleShelf: (id: string) => void;
  gaps: ConcernId[];
}) {
  const reduced = useReducedMotion();

  if (!open) {
    return (
      <div className="sticky top-24 hidden h-fit lg:block">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-3 border border-hairline bg-card px-3 py-6 text-[10px] tracking-[0.2em] text-charcoal uppercase [writing-mode:vertical-rl] hover:text-ink focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
        >
          Profile & shelf ›
        </button>
      </div>
    );
  }

  return (
    <motion.aside
      initial={reduced ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-24 h-fit max-h-[calc(100vh-7rem)] overflow-y-auto border border-hairline bg-card"
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

      <section className="border-b border-hairline px-5 py-5">
        <h3 className="font-serif text-lg">Beauty profile</h3>
        <p className="mt-3 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Skin type
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {skinTypes.map((s) => (
            <Chip key={s} active={s === skinType} onClick={() => onSkinType(s)}>
              {s}
            </Chip>
          ))}
        </div>

        {categories.map((cat) => (
          <div key={cat}>
            <p className="mt-6 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              {cat} concerns
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {concerns
                .filter((c) => c.category === cat)
                .map((c) => (
                  <Chip
                    key={c.id}
                    active={selected.includes(c.id)}
                    flagged={gaps.includes(c.id)}
                    onClick={() => onToggleConcern(c.id)}
                    title={c.blurb}
                  >
                    {c.label}
                  </Chip>
                ))}
            </div>
          </div>
        ))}

        <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
          {gaps.length
            ? `${gaps.length} concern${gaps.length > 1 ? "s" : ""} with nothing on your shelves.`
            : "Your shelves answer every concern you've flagged."}
        </p>
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
          />
        ))}
      </section>
    </motion.aside>
  );
}

function ShelfGroup({
  category,
  shelf,
  onToggleShelf,
  reduced,
}: {
  category: Category;
  shelf: string[];
  onToggleShelf: (id: string) => void;
  reduced: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const items = pastPurchases.filter((p) => p.category === category);
  const onShelf = items.filter((p) => shelf.includes(p.id));
  const notOnShelf = items.filter((p) => !shelf.includes(p.id));

  return (
    <div className="mt-5">
      <p className="flex items-baseline justify-between text-[10px] tracking-[0.2em] text-ink uppercase">
        {category} — currently using:
        <span className="text-muted-foreground">{onShelf.length}</span>
      </p>

      <ul className="mt-1">
        <AnimatePresence initial={false}>
          {onShelf.map((p) => (
            <motion.li
              key={p.id}
              layout
              initial={reduced ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="group flex items-center gap-2 border-b border-hairline py-1.5"
            >
              <ProductBottle id={p.vessel} className="h-6 w-auto shrink-0 text-ink" />
              <span className="min-w-0 flex-1 truncate text-[12px] text-ink">{p.name}</span>
              <button
                type="button"
                onClick={() => onToggleShelf(p.id)}
                aria-label={`Remove ${p.name} from shelf`}
                className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
              >
                ×
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {onShelf.length === 0 && (
        <p className="mt-1 text-[11px] text-muted-foreground">Nothing here yet.</p>
      )}

      <AnimatePresence initial={false}>
        {adding && notOnShelf.length > 0 && (
          <motion.ul
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {notOnShelf.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2 border-b border-hairline py-1.5"
              >
                <ProductBottle id={p.vessel} className="h-6 w-auto shrink-0 text-charcoal" />
                <span className="min-w-0 flex-1 truncate text-[12px] text-charcoal">
                  {p.name}
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


function Chip({
  active,
  flagged,
  children,
  onClick,
  title,
}: {
  active: boolean;
  flagged?: boolean;
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`border px-3 py-1.5 text-[11px] tracking-[0.08em] transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none ${
        active
          ? flagged
            ? "border-gold bg-gold-soft/40 text-ink"
            : "border-ink bg-ink text-primary-foreground"
          : "border-hairline text-muted-foreground hover:border-charcoal hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
