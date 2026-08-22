import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { CompactOrb, CuratorSpeech, MicroSpark } from "./CompactOrb";
import { ProfileRail } from "./ProfileRail";
import { Boutique, type ScoredReward } from "./Boutique";
import { RewardCard } from "./RewardCard";
import { QuickView } from "./QuickView";
import { RecommendationPrompt } from "./RecommendationPrompt";
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
import { recommendRewards } from "@/lib/curator.functions";
import { rulePicks, ruleIntro, type RecommendResult } from "@/lib/curator-prompt";


export function PointCurator({
  points,
  redeemed,
  onRedeem,
  onRemove,
}: {
  points: number;
  redeemed: string[];
  onRedeem: (r: { id: string; product: string; points: number }) => void;
  onRemove: (id: string) => void;
}) {
  const reduced = useReducedMotion();
  const [railOpen, setRailOpen] = useState(true);
  const skinType: SkinType = defaultProfile.skinType;
  const [selected] = useState<ConcernId[]>(defaultProfile.concerns);
  const [shelf, setShelf] = useState<string[]>(defaultShelf);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [quickId, setQuickId] = useState<string | null>(null);
  const [quip, setQuip] = useState<string | null>(null);

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
  const quick = quickId ? scored.find((s) => s.reward.id === quickId) : undefined;
  const shown = active ?? picks[0];

  const gapLabels = gaps
    .map((g) => allConcerns.find((c) => c.id === g)?.label ?? g)
    .join(", ")
    .toLowerCase();

  const handleRedeem = (r: Reward) => {
    if (redeemed.includes(r.id) || r.points > points) return;
    onRedeem({ id: r.id, product: r.name, points: r.points });
  };

  const handleRemove = (r: Reward) => onRemove(r.id);


  const toggleShelf = (id: string) =>
    setShelf((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="mx-auto max-w-7xl px-8 pt-10 pb-14">
      <div
        className={`grid gap-12 ${railOpen ? "lg:grid-cols-[300px_minmax(0,1fr)]" : "lg:grid-cols-[52px_minmax(0,1fr)]"}`}
      >
        <ProfileRail
          open={railOpen}
          onToggle={() => setRailOpen((o) => !o)}
          skinType={skinType}
          selected={selected}
          shelf={shelf}
          onToggleShelf={toggleShelf}
          gaps={gaps}
          onQuip={(line) => {
            setQuip(line);
            window.setTimeout(() => setQuip(null), 5000);
          }}
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
              Recommended rewards for you
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-charcoal">
              {`Freebie Buddy read your ${skinType.toLowerCase()} skin, ${shelf.length} products across your skin, hair and makeup shelves and ${selected.length} concerns to rank what your points can get today.`}
            </p>


            <div className="mt-10 grid gap-8 border-t border-hairline pt-10 lg:grid-cols-[150px_minmax(0,1fr)]">
              <CompactOrb
                className="h-[150px] w-[150px]"
                thinking={Boolean(active) || Boolean(quip)}
                mood={
                  !quip && shown?.score.tier === "Not for your skin" ? "caution" : "calm"
                }
              />

              {shown && (
                <CuratorSpeech
                  title={
                    quip
                      ? "Freebie Buddy · ahem"
                      : active
                        ? `Freebie Buddy · ${shown.reward.name}`
                        : `Freebie Buddy · why these picks`
                  }
                  body={
                    quip
                      ? quip
                      : active
                        ? `${shown.score.headline} ${shown.reward.routine}`
                        : gaps.length
                          ? `${picks.length} rewards below close what your shelves are missing — ${gapLabels}. Anything that clashes with your skin type or an active you already use is labelled, not recommended.`
                          : `Nothing is missing, so these ${picks.length} are ranked on ${skinType.toLowerCase()} skin condition and the categories you redeem most.`
                  }
                  caution={!quip && active ? shown.reward.caution : undefined}
                  className="self-start"
                />
              )}

            </div>

            <div className="mt-10 flex items-end justify-between border-b border-hairline pb-4">
              <h2 className="font-serif text-2xl">Top picks</h2>

              <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                {picks.length} picks
              </p>
            </div>

            <div className="grid gap-px bg-hairline sm:grid-cols-2 xl:grid-cols-3">
              {picks.map(({ reward, score }, i) => (
                <motion.div
                  key={reward.id}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                >
                  <RewardCard
                    reward={reward}
                    score={score}
                    done={redeemed.includes(reward.id)}
                    active={activeId === reward.id}
                    onToggleBag={() =>
                      redeemed.includes(reward.id) ? handleRemove(reward) : handleRedeem(reward)
                    }
                    onQuickView={() => setQuickId(reward.id)}
                    onHover={() => setActiveId(reward.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>

          <Boutique
            scored={scored}
            redeemed={redeemed}
            onRedeem={handleRedeem}
            onRemove={handleRemove}
            onExplain={(r) => setActiveId(r.id)}
            onQuickView={(r) => setQuickId(r.id)}
            activeId={activeId}
          />

        </div>
      </div>

      <QuickView
        reward={quick?.reward ?? null}
        score={quick?.score ?? null}
        done={quick ? redeemed.includes(quick.reward.id) : false}
        onToggleBag={() => {
          if (!quick) return;
          if (redeemed.includes(quick.reward.id)) handleRemove(quick.reward);
          else handleRedeem(quick.reward);
        }}
        onClose={() => setQuickId(null)}
      />
    </div>
  );
}
