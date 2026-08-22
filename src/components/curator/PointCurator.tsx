import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { CompactOrb, CuratorSpeech, MicroSpark } from "./CompactOrb";
import { ProfileRail } from "./ProfileRail";
import { Boutique, FitBadge, type ScoredReward } from "./Boutique";
import {
  defaultProfile,
  defaultShelf,
  rewardCatalogue,
  type ConcernId,
  type Reward,
  type SkinType,
} from "./data";
import { openGaps, scoreReward, tierRank } from "./scoring";
import { concerns as allConcerns } from "./data";

export function PointCurator({
  points,
  onRedeem,
}: {
  points: number;
  onRedeem: (r: { product: string; points: number }) => void;
}) {
  const reduced = useReducedMotion();
  const [railOpen, setRailOpen] = useState(true);
  const [skinType, setSkinType] = useState<SkinType>(defaultProfile.skinType);
  const [selected, setSelected] = useState<ConcernId[]>(defaultProfile.concerns);
  const [shelf, setShelf] = useState<string[]>(defaultShelf);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const gaps = useMemo(() => openGaps(selected, shelf), [selected, shelf]);

  const scored: ScoredReward[] = useMemo(
    () =>
      rewardCatalogue.map((reward) => ({
        reward,
        score: scoreReward(reward, {
          skinType,
          selectedConcerns: selected,
          shelf,
          enjoys: defaultProfile.enjoys,
          points,
        }),
      })),
    [skinType, selected, shelf, points],
  );

  const ranked = useMemo(
    () =>
      [...scored].sort(
        (a, b) =>
          tierRank[a.score.tier] - tierRank[b.score.tier] ||
          Number(b.score.affordable) - Number(a.score.affordable) ||
          b.score.gapsClosed.length - a.score.gapsClosed.length ||
          a.reward.points - b.reward.points,
      ),
    [scored],
  );

  /** Up to three picks: gap-closers first, one per open concern where possible. */
  const picks = useMemo(() => {
    const chosen: ScoredReward[] = [];
    const usedConcerns = new Set<ConcernId>();
    const usable = ranked.filter((s) => s.score.tier !== "Not for your skin");

    for (const s of usable.filter((x) => x.score.gapsClosed.length)) {
      if (chosen.length >= 3) break;
      if (s.score.gapsClosed.some((c) => usedConcerns.has(c))) continue;
      s.score.gapsClosed.forEach((c) => usedConcerns.add(c));
      chosen.push(s);
    }
    for (const s of usable) {
      if (chosen.length >= 3) break;
      if (!chosen.includes(s)) chosen.push(s);
    }
    return chosen;
  }, [ranked]);

  const active = activeId ? scored.find((s) => s.reward.id === activeId) : undefined;
  const shown = active ?? picks[0];

  const gapLabels = gaps
    .map((g) => allConcerns.find((c) => c.id === g)?.label ?? g)
    .join(", ")
    .toLowerCase();

  const handleRedeem = (r: Reward) => {
    if (redeemed.includes(r.id) || r.points > points) return;
    setRedeemed((prev) => [...prev, r.id]);
    onRedeem({ product: r.name, points: r.points });
  };

  const toggleConcern = (c: ConcernId) =>
    setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const toggleShelf = (id: string) =>
    setShelf((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="mx-auto max-w-7xl px-8 py-14">
      <div
        className={`grid gap-12 ${railOpen ? "lg:grid-cols-[300px_minmax(0,1fr)]" : "lg:grid-cols-[52px_minmax(0,1fr)]"}`}
      >
        <ProfileRail
          open={railOpen}
          onToggle={() => setRailOpen((o) => !o)}
          skinType={skinType}
          onSkinType={setSkinType}
          selected={selected}
          onToggleConcern={toggleConcern}
          shelf={shelf}
          onToggleShelf={toggleShelf}
          gaps={gaps}
        />

        <div className="min-w-0">
          {/* Hero */}
          <motion.section
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="flex items-center gap-2 text-[11px] tracking-[0.28em] text-gold uppercase">
              <MicroSpark /> AI reward scoring
            </p>
            <h1 className="mt-5 max-w-2xl font-serif text-5xl leading-[1.08]">
              {gaps.length
                ? `Your points can close ${gaps.length} gap${gaps.length > 1 ? "s" : ""}.`
                : "Your shelves are complete. Here's what suits you."}
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-charcoal">
              {gaps.length
                ? `The Curator read your ${skinType.toLowerCase()} skin, ${shelf.length} products across your skin, hair and makeup shelves, and ${selected.length} concerns. Nothing you own answers ${gapLabels}.`
                : `The Curator read your ${skinType.toLowerCase()} skin and ${shelf.length} products across your skin, hair and makeup shelves. Every concern is covered, so it is ranking on skin condition and what you enjoy.`}
            </p>

            <div className="mt-10 grid gap-8 border-t border-hairline pt-10 lg:grid-cols-[150px_minmax(0,1fr)]">
              <CompactOrb
                className="h-[150px] w-[150px]"
                thinking={Boolean(active)}
                mood={shown?.score.tier === "Not for your skin" ? "caution" : "calm"}
              />

              {shown && (
                <CuratorSpeech
                  title={active ? `Curator · ${shown.reward.name}` : `Curator · why these picks`}
                  body={
                    active
                      ? `${shown.score.headline} ${shown.reward.routine}`
                      : gaps.length
                        ? `${picks.length} rewards below close what your shelves are missing — ${gapLabels}. Anything that clashes with your skin type or an active you already use is labelled, not recommended.`
                        : `Nothing is missing, so these ${picks.length} are ranked on ${skinType.toLowerCase()} skin condition and the categories you redeem most.`
                  }
                  caution={active ? shown.reward.caution : undefined}
                  className="self-start"
                />
              )}
            </div>

            <div className="mt-10 flex items-end justify-between border-b border-hairline pb-4">
              <h2 className="font-serif text-2xl">
                {gaps.length ? "Recommended to close your gaps" : "Best fits for your profile"}
              </h2>
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                {picks.length} picks
              </p>
            </div>

            <div className="grid gap-px bg-hairline sm:grid-cols-2 xl:grid-cols-3">
              {picks.map(({ reward, score }, i) => (
                <motion.article
                  key={reward.id}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  onMouseEnter={() => setActiveId(reward.id)}
                  onFocus={() => setActiveId(reward.id)}
                  tabIndex={0}
                  className={`flex flex-col bg-card p-6 transition-colors focus-visible:outline-none ${
                    activeId === reward.id ? "bg-secondary/40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] tracking-[0.2em] text-gold uppercase">
                      {reward.category}
                    </span>
                  </div>
                  <FitBadge tier={score.tier} segments={score.segments} />
                  <h3 className="mt-4 font-serif text-xl leading-snug">{reward.name}</h3>
                  <p className="mt-1 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    {reward.brand}
                  </p>
                  <p className="mt-3 font-serif">{reward.points.toLocaleString()} pts</p>
                  <p className="mt-3 text-[13px] leading-relaxed text-charcoal">
                    {score.headline}
                  </p>
                  <ul className="mt-3 space-y-2 border-t border-hairline pt-3 text-[12px] leading-relaxed text-muted-foreground">
                    {score.lines.map((l) => (
                      <li key={l.label} className="flex gap-2">
                        <span
                          aria-hidden
                          className={
                            l.weight === "negative"
                              ? "text-charcoal"
                              : l.weight === "positive"
                                ? "text-gold"
                                : "text-muted-foreground"
                          }
                        >
                          {l.weight === "negative" ? "—" : l.weight === "positive" ? "+" : "·"}
                        </span>
                        <span>
                          <span className="text-ink">{l.label}.</span> {l.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={redeemed.includes(reward.id) || !score.affordable}
                    onClick={() => handleRedeem(reward)}
                    className={`mt-auto w-full py-3 text-[10px] tracking-[0.22em] uppercase transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none ${
                      redeemed.includes(reward.id) || !score.affordable
                        ? "mt-6 border border-hairline text-muted-foreground"
                        : "mt-6 bg-ink text-primary-foreground hover:bg-charcoal"
                    }`}
                  >
                    {redeemed.includes(reward.id)
                      ? "Claimed"
                      : score.affordable
                        ? "Claim reward"
                        : `${score.shortBy.toLocaleString()} pts short`}
                  </button>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <Boutique
            scored={scored}
            redeemed={redeemed}
            onRedeem={handleRedeem}
            onExplain={(r) => setActiveId(r.id)}
            activeId={activeId}
          />
        </div>
      </div>
    </div>
  );
}
