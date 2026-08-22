import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { CompactOrb, MicroSpark } from "./CompactOrb";

/**
 * Freebie Buddy condensed into a companion bar that travels with the picks
 * grid, so the LLM read always sits next to the product it is talking about.
 */
export function BuddyBar({
  title,
  body,
  caution,
  thinking = false,
  mood = "calm",
  readKey,
}: {
  title: string;
  body: string;
  caution?: string | undefined;
  thinking?: boolean;
  mood?: "calm" | "caution";
  /** Changes whenever the read changes, to drive the cross-fade. */
  readKey: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="sticky top-4 z-20 -mx-1 px-1">
      <div className="flex items-start gap-4 border border-gold/50 bg-gold/8 px-4 py-3 backdrop-blur-md">
        <CompactOrb className="h-11 w-11 shrink-0" thinking={thinking} mood={mood} />

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[10px] tracking-[0.24em] text-gold uppercase">
            <MicroSpark /> {title}
          </p>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={readKey}
              initial={reduced ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-charcoal">
                {body}
              </p>
              {caution && (
                <p className="mt-1.5 line-clamp-1 border-l border-gold pl-2 text-[12px] leading-relaxed text-charcoal">
                  {caution}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
