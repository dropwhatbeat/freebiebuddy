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

  const topPick = ranked[0];
  const active = activeId ? scored.find((s) => s.reward.id === activeId) : undefined;
  const shown = active ?? topPick;

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
                : "Your routine is complete. Here's what to enjoy."}
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-charcoal">
              {gaps.length
                ? `The Curator read your ${skinType.toLowerCase()} skin, ${shelf.length} shelf products and ${selected.length} concerns. Nothing you own answers ${gapLabels}.`
                : `The Curator read your ${skinType.toLowerCase()} skin and ${shelf.length} shelf products. Every concern is covered, so it is ranking on what you actually enjoy.`}
            </p>

            <div className="mt-10 grid gap-8 border-y border-hairline py-10 lg:grid-cols-[150px_minmax(0,1fr)_300px]">
              <CompactOrb
                className="h-[150px] w-[150px]"
                thinking={Boolean(active)}
                mood={shown?.score.tier === "Not for your skin" ? "caution" : "calm"}
              />

              {shown && (
                <CuratorSpeech
                  title={
                    active
                      ? `Curator · ${shown.reward.name}`
                      : `Curator · top pick for you`
                  }
                  body={`${shown.score.headline} ${shown.reward.routine}`}
                  caution={shown.reward.caution}
                  className="self-start"
                />
              )}

              {shown && (
                <div className="self-start border border-hairline bg-card p-6">
                  <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                    Fit score
                  </p>
                  <FitBadge tier={shown.score.tier} segments={shown.score.segments} />
                  <h2 className="mt-5 font-serif text-xl leading-snug">{shown.reward.name}</h2>
                  <p className="mt-2 font-serif">{shown.reward.points.toLocaleString()} pts</p>
                  <ul className="mt-5 space-y-2 border-t border-hairline pt-4 text-[12px] leading-relaxed text-muted-foreground">
                    {shown.score.lines.map((l) => (
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
                    disabled={
                      redeemed.includes(shown.reward.id) || !shown.score.affordable
                    }
                    onClick={() => handleRedeem(shown.reward)}
                    className={`mt-6 w-full py-3 text-[10px] tracking-[0.22em] uppercase transition-colors focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none ${
                      redeemed.includes(shown.reward.id) || !shown.score.affordable
                        ? "border border-hairline text-muted-foreground"
                        : "bg-ink text-primary-foreground hover:bg-charcoal"
                    }`}
                  >
                    {redeemed.includes(shown.reward.id)
                      ? "Claimed"
                      : shown.score.affordable
                        ? "Claim reward"
                        : `${shown.score.shortBy.toLocaleString()} pts short`}
                  </button>
                </div>
              )}
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
