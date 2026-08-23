import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const examples = [
  "Help my blackheads and fine lines",
  "Boost my Skincredible hydration score",
  "Travel-friendly minis",
];

export function RecommendationPrompt({
  wish,
  busy,
  onSubmit,
  onClear,
}: {
  wish: string | null;
  busy: boolean;
  onSubmit: (value: string) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState("");

  const send = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setDraft("");
    onSubmit(trimmed);
  };

  return (
    <div className="mt-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="flex items-center gap-2 border border-hairline bg-card px-3 py-2 focus-within:border-gold"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tell me what you're after — dry ends, a night out, something for travel…"
          className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          aria-label="Tell Freebie Buddy what you're after"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="shrink-0 bg-foreground px-4 py-2 text-[10px] tracking-[0.2em] text-background uppercase transition-opacity disabled:opacity-35"
        >
          {busy ? "Thinking" : "Ask"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <AnimatePresence initial={false}>
          {wish && (
            <motion.span
              key="wish"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="inline-flex items-center gap-2 border border-gold/50 bg-gold/10 px-3 py-1 text-[11px] text-foreground"
            >
              “{wish}”
              <button
                type="button"
                onClick={onClear}
                aria-label="Clear my request"
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </motion.span>
          )}
        </AnimatePresence>

        {!wish &&
          examples.map((e) => (
            <button
              key={e}
              type="button"
              disabled={busy}
              onClick={() => send(e)}
              className="border border-hairline px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-gold hover:text-foreground disabled:opacity-40"
            >
              {e}
            </button>
          ))}
      </div>
    </div>
  );
}
