import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * The mascot: a gold-rimmed compact mirror that blinks, catches a highlight
 * sweep, and pulses a scan ring while it is scoring rewards.
 */
export function CompactOrb({
  className,
  thinking = false,
  mood = "calm",
}: {
  className?: string;
  thinking?: boolean;
  mood?: "calm" | "caution";
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={reduced ? {} : { y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        className="h-full w-full"
        role="img"
        aria-label="Freebie Buddy: an illustrated compact mirror that reads your skin profile"
      >
        <defs>
          <clipPath id="orb-mirror">
            <circle cx="80" cy="80" r="42" />
          </clipPath>
        </defs>

        {/* scan rings */}
        <g className="stroke-gold" strokeWidth="0.9" opacity={thinking ? 0.95 : 0.4}>
          <circle
            cx="80"
            cy="80"
            r="66"
            strokeDasharray="2 8"
            className={reduced ? "" : "orb-spin"}
          />
          <circle
            cx="80"
            cy="80"
            r="57"
            strokeDasharray="1 10"
            className={reduced ? "" : "orb-spin-rev"}
          />
        </g>
        {thinking && !reduced && (
          <circle cx="80" cy="80" r="50" className="stroke-gold orb-scan" strokeWidth="1" />
        )}

        {/* compact rim */}
        <circle cx="80" cy="80" r="50" className="stroke-ink" strokeWidth="1.6" />
        <circle cx="80" cy="80" r="46" className="stroke-gold" strokeWidth="1" opacity="0.8" />

        {/* hinge + clasp */}
        <path
          d="M80 30v-8M74 24h12"
          className="stroke-ink"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="80" cy="130" r="4" className="stroke-ink" strokeWidth="1.4" />

        {/* mirror face */}
        <circle cx="80" cy="80" r="42" className="fill-gold-soft" opacity="0.28" />
        <g clipPath="url(#orb-mirror)">
          <rect
            x="-70"
            y="0"
            width="34"
            height="160"
            className={`fill-gold ${reduced ? "" : "orb-sweep"}`}
            opacity="0.32"
            transform="rotate(18 80 80)"
          />
        </g>
        <circle cx="80" cy="80" r="42" className="stroke-hairline" strokeWidth="1" />

        {/* face */}
        {thinking && !reduced && (
          <g className="stroke-ink orb-brow" strokeWidth="1.4" strokeLinecap="round">
            <path d="M60 64c4-3 9-3 12-1" />
            <path d="M100 64c-4-3-9-3-12-1" />
          </g>
        )}
        <g
          className={`fill-ink ${
            reduced ? "" : thinking ? "orb-think-blink" : "orb-blink"
          }`}
        >
          <circle cx="66" cy="74" r="3" />
          <circle cx="94" cy="74" r="3" />
        </g>
        {thinking && !reduced ? (
          <ellipse
            cx="80"
            cy="94"
            rx="6"
            ry="4.5"
            className="stroke-ink orb-mouth-think"
            strokeWidth="1.5"
            fill="none"
          />
        ) : (
          <path
            d={mood === "caution" ? "M70 96c6-5 14-5 20 0" : "M70 92c6 6 14 6 20 0"}
            className="stroke-ink"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        )}
        {thinking && !reduced && (
          <g className="fill-gold">
            <circle cx="112" cy="52" r="2.4" className="orb-bubble" style={{ animationDelay: "0s" }} />
            <circle cx="122" cy="42" r="3.2" className="orb-bubble" style={{ animationDelay: "0.25s" }} />
            <circle cx="133" cy="31" r="4" className="orb-bubble" style={{ animationDelay: "0.5s" }} />
          </g>
        )}
        {/* blush of light */}
        <path
          d="M54 62c5-6 12-9 20-9"
          className="stroke-gold"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

      </svg>
    </motion.div>
  );
}

/** Editorial panel Freebie Buddy speaks through. */
export function CuratorSpeech({
  title,
  body,
  caution,
  className = "",
}: {
  title: string;
  body: string;
  caution?: string | undefined;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={title + body}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={`relative border border-hairline bg-card p-6 ${className}`}
      >
        <span className="absolute top-9 -left-[7px] h-3 w-3 rotate-45 border-b border-l border-hairline bg-card" />
        <p className="flex items-center gap-2 text-[10px] tracking-[0.24em] text-gold uppercase">
          <MicroSpark /> {title}
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-charcoal">{body}</p>
        {caution && (
          <p className="mt-4 border-l border-gold pl-3 text-[13px] leading-relaxed text-charcoal">
            {caution}
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export function MicroSpark({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 0.5 7.2 4.8 11.5 6 7.2 7.2 6 11.5 4.8 7.2 0.5 6 4.8 4.8z"
        className="fill-gold"
      />
    </svg>
  );
}

/** Tiny Freebie Buddy glyph that marks LLM-written copy. */
export function BuddyMark({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={`${className} shrink-0`}
      role="img"
      aria-label="Written by Freebie Buddy"
    >
      <circle cx="8" cy="8" r="6.4" className="stroke-gold" strokeWidth="1.1" />
      <circle cx="8" cy="8" r="4.6" className="fill-gold-soft" opacity="0.5" />
      <circle cx="6.2" cy="7.2" r="0.9" className="fill-ink" />
      <circle cx="9.8" cy="7.2" r="0.9" className="fill-ink" />
      <path
        d="M6.2 9.6c1.2 1.2 2.4 1.2 3.6 0"
        className="stroke-ink"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

