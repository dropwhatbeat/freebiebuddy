export function SiteHeader() {
  return (
    <header>
      <div className="bg-ink text-primary-foreground">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-8">
          <span className="font-serif text-2xl tracking-[0.42em] uppercase">Sephora</span>
        </div>
      </div>
      <div className="border-b border-hairline bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-8 py-3 text-[11px] tracking-[0.16em] text-charcoal uppercase">
          <span className="flex items-center gap-2 text-gold">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden="true">
              <path
                d="M6 0.5 7.4 4.3 11.4 4.5 8.3 7 9.3 10.9 6 8.7 2.7 10.9 3.7 7 0.6 4.5 4.6 4.3Z"
                className="fill-gold"
              />
            </svg>
            Black Beauty Pass
          </span>
          <span className="h-3 w-px bg-hairline" aria-hidden="true" />
          <span>Emily, Singapore</span>
        </div>
      </div>
    </header>
  );
}
