import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * The mascot: an animated glass dropper ("the Curator") with a gold serum
 * droplet for a mind. Not a human — a beauty tool that thinks.
 */
export function GenieMascot({
  className,
  thinking = false,
}: {
  className?: string;
  thinking?: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={reduced ? {} : { y: [0, -7, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 140 220"
        fill="none"
        className="h-full w-full"
        role="img"
        aria-label="Illustration of the Curator, an animated glass dropper with a gold droplet"
      >
        {/* orbiting analysis sparks */}
        <g className="stroke-gold" strokeWidth="0.9" opacity={thinking ? 0.9 : 0.35}>
          <ellipse
            cx="70"
            cy="70"
            rx="52"
            ry="20"
            strokeDasharray="2 6"
            className={reduced ? "" : "orbit-slow"}
          />
          <ellipse
            cx="70"
            cy="70"
            rx="44"
            ry="30"
            strokeDasharray="1 7"
            className={reduced ? "" : "orbit-reverse"}
          />
        </g>


        <g
          className="text-ink"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* rubber bulb head */}
          <path d="M70 22c-16 0-27 10-27 24 0 12 8 20 8 28h38c0-8 8-16 8-28 0-14-11-24-27-24z" />
          <path d="M50 74h40" />
          {/* collar */}
          <path d="M55 74v10h30V74" />
          {/* glass barrel */}
          <path d="M58 84h24v78c0 6-3 10-6 16l-6 12-6-12c-3-6-6-10-6-16V84z" />
          {/* measure ticks */}
          <path d="M62 104h8M62 118h8M62 132h8M62 146h8" strokeWidth="1" opacity="0.5" />
        </g>

        {/* eyes */}
        <g className={`fill-ink ${reduced ? "" : "blink"}`}>
          <circle cx="61" cy="46" r="2.6" />
          <circle cx="79" cy="46" r="2.6" />
        </g>

        <path
          d="M64 56c4 3.5 8 3.5 12 0"
          className="stroke-ink"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* serum column rising and falling */}
        <g className={reduced ? "" : "serum-pulse"}>
          <rect x="60.5" y="96" width="19" height="64" className="fill-gold-soft" />
        </g>

        {/* gold droplet at the tip */}
        <path
          d="M70 178c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13z"
          className={`fill-gold ${reduced ? "" : "droplet"}`}
        />
      </svg>
    </motion.div>
  );
}

/** Editorial speech panel that types in beside the mascot. */
export function GenieSpeech({
  title,
  body,
  caution,
}: {
  title: string;
  body: string;
  caution?: string | undefined;
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
        className="relative border border-hairline bg-card p-6"
      >
        <span className="absolute -left-[7px] top-9 h-3 w-3 rotate-45 border-b border-l border-hairline bg-card" />
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
