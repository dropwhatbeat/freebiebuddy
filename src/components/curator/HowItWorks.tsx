const columns = [
  {
    step: "01",
    title: "Member + Catalogue Inputs",
    items: ["Tier and points balance", "Explicit beauty profile", "Availability, eligibility, point cost"],
  },
  {
    step: "02",
    title: "Rules, Ranking & Approved Knowledge Retrieval",
    items: [
      "Hard-filter eligible rewards",
      "Rank candidates with an existing recommender",
      "Retrieve approved product and ingredient facts",
    ],
  },
  {
    step: "03",
    title: "Point Curator Experience",
    items: [
      "Three point-level choices",
      "Short, grounded routine note",
      "Full catalogue remains accessible",
    ],
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-8 py-20">
      <p className="text-[11px] tracking-[0.28em] text-gold uppercase">Behind the curation</p>
      <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
        How the Point Curator arrives at three choices.
      </h2>

      <div className="mt-14 grid grid-cols-1 gap-px border border-hairline bg-hairline md:grid-cols-3">
        {columns.map((col, i) => (
          <div key={col.step} className="relative bg-card p-8">
            <span className="font-serif text-sm text-gold">{col.step}</span>
            <h3 className="mt-3 font-serif text-xl leading-snug">{col.title}</h3>
            <ul className="mt-6 space-y-3 text-sm text-charcoal">
              {col.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <svg viewBox="0 0 8 8" className="mt-2 h-1.5 w-1.5 shrink-0" aria-hidden="true">
                    <circle cx="4" cy="4" r="3" className="fill-gold" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            {i < columns.length - 1 && (
              <svg
                viewBox="0 0 40 12"
                className="absolute top-1/2 -right-[14px] z-10 hidden h-3 w-7 -translate-y-1/2 md:block"
                aria-hidden="true"
                fill="none"
              >
                <path d="M0 6h30M25 2l5 4-5 4" className="stroke-gold" strokeWidth="1.2" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <div className="border-t border-ink pt-6">
          <h3 className="font-serif text-lg">What the model may do</h3>
          <p className="mt-3 text-sm leading-relaxed text-charcoal">
            Transform approved retrieved facts into concise routine notes — phrasing, sequencing and
            plain-language summaries drawn only from information already published for the product.
          </p>
        </div>
        <div className="border-t border-gold pt-6">
          <h3 className="font-serif text-lg">What it may never do</h3>
          <p className="mt-3 text-sm leading-relaxed text-charcoal">
            Alter points, eligibility, inventory or expiry, and never make medical or safety claims.
            Where information is not approved, the note is simply omitted.
          </p>
        </div>
      </div>
    </section>
  );
}
