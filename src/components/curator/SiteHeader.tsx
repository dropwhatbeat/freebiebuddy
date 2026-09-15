export function SiteHeader() {
  return (
    <header>
      <div className="bg-ink text-primary-foreground">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-8">
          <span className="font-serif text-2xl tracking-[0.2em] uppercase">My Rewards</span>
        </div>
      </div>
      <div className="border-b border-hairline bg-background">
        <div className="mx-auto flex max-w-7xl items-center px-8 py-3 text-[11px] tracking-[0.16em] text-charcoal uppercase">
          <span>Emily, Singapore</span>
        </div>
      </div>
    </header>
  );
}
