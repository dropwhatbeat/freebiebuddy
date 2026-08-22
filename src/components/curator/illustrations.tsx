import type { ReactElement, SVGProps } from "react";

const ink = "currentColor";

/** Minimal editorial line figure holding a small gold reward card. */
export function BeautyGuide({
  className,
  ...props
}: SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 300"
      fill="none"
      className={className}
      role="img"
      aria-label="Illustration of the Beauty Guide holding a small gold reward card"
      {...props}
    >
      <g
        stroke={ink}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ink"
      >
        {/* hair */}
        <path d="M62 62c-3-24 8-40 28-40s29 15 27 38c-1 12-4 18-4 25" />
        <path d="M113 85c8-4 11-14 9-26" />
        <path d="M62 62c-5 6-6 16-3 24" />
        {/* face */}
        <path d="M66 60c0 22 8 38 24 38s24-16 24-38" />
        <path d="M80 66c2.5-2 6-2 8 0" />
        <path d="M100 66c2.5-2 6-2 8 0" />
        <path d="M88 82c3 2 7 2 10 0" />
        {/* neck + shoulders */}
        <path d="M84 96v10c0 5-4 7-10 10l-22 9c-8 3-12 9-13 18l-5 44" />
        <path d="M104 96v10c0 5 4 7 10 10l22 9c8 3 12 9 13 18l5 44" />
        {/* coat lapels */}
        <path d="M84 106 74 152l14 10 14-10-10-46" />
        <path d="M88 162v42" />
        {/* arm holding card */}
        <path d="M136 130c6 14 4 26-6 34l-18 14" />
        <path d="M44 132c-6 14-4 26 6 34l14 11" />
        {/* skirt / long line */}
        <path d="M34 191c14 6 26 9 54 9s40-3 54-9" />
        <path d="M40 191l-8 92" />
        <path d="M142 191l8 92" />
        <path d="M32 283c26 7 90 7 118 0" />
        {/* hand */}
        <path d="M112 178c-5 2-8 5-9 9" />
      </g>
      {/* gold reward card */}
      <g>
        <rect
          x="96"
          y="176"
          width="46"
          height="30"
          rx="1"
          transform="rotate(-8 96 176)"
          className="fill-gold-soft stroke-gold"
          strokeWidth="1.2"
        />
        <path
          d="M104 190h26M104 196h16"
          transform="rotate(-8 96 176)"
          className="stroke-gold"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

interface BottleProps {
  className?: string;
}

/** Hand-drawn ink-line skincare vessels. */
export function ProductBottle({ id, className }: BottleProps & { id: string }) {
  const shapes: Record<string, ReactElement> = {
    cleanser: (
      <g>
        <path d="M30 34c-6 1-9 5-9 11v51c0 6 4 10 10 10h28c6 0 10-4 10-10V45c0-6-3-10-9-11" />
        <path d="M36 34V22c0-3 2-5 5-5h8c3 0 5 2 5 5v12" />
        <path d="M35 17h20" />
        <path d="M28 58h34" />
        <path d="M30 70h20" />
      </g>
    ),
    vitc: (
      <g>
        <path d="M34 40h22c4 0 6 3 6 7v42c0 6-4 10-10 10H38c-6 0-10-4-10-10V47c0-4 2-7 6-7z" />
        <path d="M38 40V26h14v14" />
        <path d="M36 20h18c2 0 3 2 3 4s-1 4-3 4H36c-2 0-3-2-3-4s1-4 3-4z" />
        <path d="M32 66h26" />
        <path d="M34 76h14" />
      </g>
    ),
    moisturiser: (
      <g>
        <path d="M24 52h44c3 0 5 2 5 5v34c0 6-4 10-10 10H29c-6 0-10-4-10-10V57c0-3 2-5 5-5z" />
        <path d="M27 52V38c0-3 2-5 5-5h28c3 0 5 2 5 5v14" />
        <path d="M22 70h48" />
        <path d="M30 82h18" />
      </g>
    ),
    spf: (
      <g>
        <path d="M32 44h28l6 44c1 8-4 13-12 13H38c-8 0-13-5-12-13l6-44z" />
        <path d="M36 44V28h20v16" />
        <path d="M38 22h16v6H38z" />
        <path d="M28 74h36" />
        <circle cx="46" cy="60" r="6" />
      </g>
    ),
  };
  return (
    <svg
      viewBox="0 0 92 110"
      fill="none"
      className={className}
      aria-hidden="true"
      stroke={ink}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes[id] ?? shapes['moisturiser']}
    </svg>
  );
}

/** Small drawn reward package used on the rewards shelf. */
export function RewardVessel({ variant, className }: { variant: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 80 60"
      fill="none"
      className={className}
      aria-hidden="true"
      stroke={ink}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {variant === 0 && (
        <g>
          <path d="M14 26h20v28H14zM38 20h12v34H38zM54 30h14v24H54z" />
          <path d="M18 20h12M40 14h8M57 24h8" />
        </g>
      )}
      {variant === 1 && (
        <g>
          <path d="M16 22h22v32H16zM46 16h18v38H46z" />
          <path d="M22 16h10M50 10h10M16 38h22M46 34h18" />
        </g>
      )}
      {variant === 2 && (
        <g>
          <path d="M10 30h14v24H10zM28 22h14v32H28zM46 28h12v26H46zM62 34h10v20H62z" />
          <path d="M13 26h8M31 16h8M49 22h6M64 30h6" />
        </g>
      )}
    </svg>
  );
}

export function ShelfLine({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 18"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M2 4C220 8 780 1 998 5"
        stroke={ink}
        strokeWidth="1.4"
        strokeLinecap="round"
        className="text-ink"
      />
      <path d="M14 8c220 4 760-2 972 2" stroke={ink} strokeWidth="0.7" opacity="0.35" />
    </svg>
  );
}
