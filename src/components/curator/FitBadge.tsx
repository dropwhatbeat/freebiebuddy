import { motion } from "motion/react";

import type { FitTier } from "./scoring";

export function FitBadge({
  tier,
  segments,
  className = "",
}: {
  tier: FitTier;
  segments: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="flex gap-1" role="img" aria-label={`${tier}, ${segments} of 3`}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{ opacity: i < segments ? 1 : 0.18 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className={`block h-[3px] w-6 ${
              tier === "Okay fit" ? "bg-charcoal" : "bg-gold"
            }`}
          />
        ))}
      </span>
      <span
        className={`text-[10px] tracking-[0.2em] uppercase ${
          tier === "Best fit"
            ? "text-gold"
            : tier === "Good fit"
              ? "text-charcoal"
              : "text-muted-foreground"
        }`}
      >
        {tier}
      </span>
    </div>
  );
}
