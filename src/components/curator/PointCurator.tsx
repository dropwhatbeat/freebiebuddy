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
import { openGaps, scoreReward } from "./scoring";
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

  const [wish, setWish] = useState<string | null>(null);
  const [shelfDirty, setShelfDirty] = useState(false);
  const runRecommend = useServerFn(recommendRewards);

  const recommend = useMutation({
    mutationFn: (vars: { shelf: string[]; wish: string | null }) =>
      runRecommend({
        data: {
          skinType,
          concerns: selected,
          enjoys: defaultProfile.enjoys,
          shelf: vars.shelf,
          points,
          wish: vars.wish,
        },
      }) as Promise<RecommendResult>,
    onSuccess: () => setShelfDirty(false),
  });

  // First read on load.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    recommend.mutate({ shelf, wish: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result: RecommendResult =
    recommend.data ??
    ({
      picks: rulePicks({
        skinType,
        concerns: selected,
        enjoys: defaultProfile.enjoys,
        shelf,
        points,
      }),
      intro: ruleIntro({
        skinType,
        concerns: selected,
        enjoys: defaultProfile.enjoys,
        shelf,
        points,
      }),
      source: "rules",
    } satisfies RecommendResult);

  /** AI picks, hydrated with catalogue data and the local meter. */
  const picks: ScoredReward[] = useMemo(() => {
    const byId = new Map(scored.map((s) => [s.reward.id, s]));
    return result.picks
      .map((p) => {
        const base = byId.get(p.rewardId);
        if (!base) return null;
        return {
          reward: base.reward,
          score: {
            ...base.score,
            tier: p.tier,
            segments: p.tier === "Best fit" ? 3 : p.tier === "Good fit" ? 2 : 1,
            headline: p.reason,
          },
          aiRoutine: p.routine,
          aiCaution: p.caution ?? undefined,
        } as ScoredReward & { aiRoutine: string; aiCaution?: string };
      })
      .filter((p): p is ScoredReward & { aiRoutine: string; aiCaution?: string } => Boolean(p));
  }, [result, scored]);

  const active = activeId ? scored.find((s) => s.reward.id === activeId) : undefined;
  const quick = quickId ? scored.find((s) => s.reward.id === quickId) : undefined;
  const activePick = activeId ? picks.find((p) => p.reward.id === activeId) : undefined;
  const shown = activePick ?? active ?? picks[0];

  const busy = recommend.isPending;

  const askWish = (value: string) => {
    setWish(value);
    recommend.mutate({ shelf, wish: value });
  };

  const clearWish = () => {
    setWish(null);
    recommend.mutate({ shelf, wish: null });
  };


  const handleRedeem = (r: Reward) => {
    if (redeemed.includes(r.id) || r.points > points) return;
    onRedeem({ id: r.id, product: r.name, points: r.points });
  };

  const handleRemove = (r: Reward) => onRemove(r.id);


  const toggleShelf = (id: string) =>
    setShelf((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setShelfDirty(true);
      return next;
    });

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
                thinking={busy || Boolean(active) || Boolean(quip)}
                mood={
                  !quip && shown?.score.tier === "Not for your skin" ? "caution" : "calm"
                }
              />

              <div className="self-start">
                <CuratorSpeech
                  title={
                    quip
                      ? "Freebie Buddy · ahem"
                      : busy
                        ? "Freebie Buddy · scoring your rewards"
                        : activePick || active
                          ? `Freebie Buddy · ${shown?.reward.name}`
                          : `Freebie Buddy · here's what I suggest for you`
                  }
                  body={
                    quip
                      ? quip
                      : busy
                        ? wish
                          ? `Reading your shelves against “${wish}” — one moment.`
                          : "Scoring every reward against your profile and shelves — one moment."
                        : activePick
                          ? `${activePick.score.headline} ${activePick.aiRoutine}`
                          : active
                            ? `${active.score.headline} ${active.reward.routine}`
                            : result.intro
                  }
                  caution={
                    !quip && !busy
                      ? (activePick?.aiCaution ?? (active ? active.reward.caution : undefined))
                      : undefined
                  }
                />

                {result.note && !busy && (
                  <p className="mt-3 text-[11px] text-muted-foreground">{result.note}</p>
                )}

                <RecommendationPrompt
                  wish={wish}
                  busy={busy}
                  onSubmit={askWish}
                  onClear={clearWish}
                />

                {shelfDirty && !busy && (
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex flex-wrap items-center gap-3 border border-gold/50 bg-gold/10 px-4 py-3"
                  >
                    <p className="text-[13px] text-foreground">
                      Your shelves changed — my picks are out of date.
                    </p>
                    <button
                      type="button"
                      onClick={() => recommend.mutate({ shelf, wish })}
                      className="bg-foreground px-4 py-2 text-[10px] tracking-[0.2em] text-background uppercase"
                    >
                      Update recommendations
                    </button>
                  </motion.div>
                )}
              </div>

            </div>

            <div className="mt-10 flex items-end justify-between border-b border-hairline pb-4">
              <h2 className="font-serif text-2xl">Top picks</h2>

              <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                {busy ? "Scoring…" : `${picks.length} picks`}
              </p>
            </div>

            <div className="grid gap-px bg-hairline sm:grid-cols-2 xl:grid-cols-3">
              {busy
                ? [0, 1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-card p-6">
                      <div className="h-40 w-full bg-hairline" />
                      <div className="mt-5 h-3 w-1/3 bg-hairline" />
                      <div className="mt-3 h-4 w-2/3 bg-hairline" />
                      <div className="mt-6 h-9 w-full bg-hairline" />
                    </div>
                  ))
                : picks.map(({ reward, score }, i) => (
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
