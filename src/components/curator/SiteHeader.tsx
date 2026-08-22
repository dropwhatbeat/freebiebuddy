interface Props {
  points: number;
}

const nav = ["Beauty Pass", "Rewards Boutique", "New", "Bag"];

export function SiteHeader({ points }: Props) {
  return (
    <header>
      <div className="bg-ink text-primary-foreground">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8">
          <span className="font-serif text-2xl tracking-[0.42em] uppercase">Sephora</span>
          <nav aria-label="Primary">
            <ul className="flex items-center gap-10 text-xs tracking-[0.18em] uppercase">
              {nav.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="pb-1 transition-colors hover:text-gold-soft focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="border-b border-hairline bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-8 py-3 text-[11px] tracking-[0.16em] text-charcoal uppercase">
          <span className="flex items-center gap-2 text-gold">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden="true">
              <path
                d="M6 0.5 7.4 4.3 11.4 4.5 8.3 7 9.3 10.9 6 8.7 2.7 10.9 3.7 7 0.6 4.5 4.6 4.3Z"
                className="fill-gold"
              />
            </svg>
            Gold Beauty Pass
          </span>
          <span className="h-3 w-px bg-hairline" aria-hidden="true" />
          <span>Michelle, Singapore</span>
          <span className="h-3 w-px bg-hairline" aria-hidden="true" />
          <span aria-live="polite">{points.toLocaleString()} points available</span>
        </div>
      </div>
    </header>
  );
}
