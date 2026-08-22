import type { ReactElement, SVGProps } from "react";

const ink = "currentColor";

type BottleProps = SVGProps<SVGSVGElement> & { className?: string };

/** Line-drawn vessel for a shelf product. */
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
    mask: (
      <g>
        <path d="M26 46h40c4 0 6 3 6 7v34c0 7-5 12-12 12H32c-7 0-12-5-12-12V53c0-4 2-7 6-7z" />
        <path d="M36 46V32h20v14" />
        <path d="M40 26h12v6H40z" />
        <path d="M30 66c6-4 12-4 18 0s12 4 18 0" />
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
    shampoo: (
      <g>
        <path d="M28 40h36c4 0 6 3 6 7v44c0 6-4 10-10 10H32c-6 0-10-4-10-10V47c0-4 2-7 6-7z" />
        <path d="M40 40V24h12v16" />
        <path d="M38 18h16l-2 6H40z" />
        <path d="M24 62h44" />
        <path d="M30 74h16" />
      </g>
    ),
    hairoil: (
      <g>
        <path d="M36 46h20c3 0 5 2 5 6v38c0 6-4 10-10 10H41c-6 0-10-4-10-10V52c0-4 2-6 5-6z" />
        <path d="M41 46V28h10v18" />
        <path d="M40 20h12v8H40z" />
        <path d="M34 68h24" />
        <path d="M42 14v4M50 12v6" />
      </g>
    ),
    foundation: (
      <g>
        <path d="M32 42h28c3 0 5 2 5 5v46c0 5-4 9-9 9H36c-5 0-9-4-9-9V47c0-3 2-5 5-5z" />
        <path d="M40 42V26h12v16" />
        <path d="M38 18h16v8H38z" />
        <path d="M27 78h38" />
      </g>
    ),
    lipstick: (
      <g>
        <path d="M36 54h20v40c0 4-3 7-7 7h-6c-4 0-7-3-7-7V54z" />
        <path d="M38 54V34c0-3 2-5 5-5h6c3 0 5 2 5 5v20" />
        <path d="M40 29V16c0-3 3-5 6-5s6 2 6 5v13" />
        <path d="M34 66h24" />
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
