import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { CompactOrb, MicroSpark } from "./CompactOrb";
import { BuddyBar } from "./BuddyBar";
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


type AiScored = ScoredReward & { aiRoutine: string; aiCaution?: string };

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

  /** Only the newest run may write results; older ones are dropped. */
  const runSeq = useRef(0);
  const [aiResult, setAiResult] = useState<RecommendResult | null>(null);

  const recommend = useMutation({
    mutationFn: async (vars: { shelf: string[]; wish: string | null }) => {
      const id = ++runSeq.current;
      const data = (await runRecommend({
        data: {
          skinType,
          concerns: selected,
          enjoys: defaultProfile.enjoys,
          shelf: vars.shelf,
          points,
          inBag: redeemed,
          wish: vars.wish,
        },
      })) as RecommendResult;
      // A newer run started while this one was in flight — discard it.
      if (id !== runSeq.current) return null;
      return data;
    },
    onSuccess: (data) => {
      if (!data) return;
      setAiResult(data);
      setShelfDirty(false);
    },
  });

  /** Start a run, replacing any in-flight one. */
  const startRecommend = (vars: { shelf: string[]; wish: string | null }) => {
    recommend.mutate(vars);
  };

  // First read on load — exactly once per page load, StrictMode included.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startRecommend({ shelf, wish: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const result: RecommendResult =
    aiResult ??
    ({
      picks: rulePicks({
        skinType,
        concerns: selected,
        enjoys: defaultProfile.enjoys,
        shelf,
        points,
        inBag: redeemed,
      }),
      intro: ruleIntro({
        skinType,
        concerns: selected,
        enjoys: defaultProfile.enjoys,
        shelf,
        points,
        inBag: redeemed,
      }),
      source: "rules",
    } satisfies RecommendResult);

  /** AI picks, hydrated with catalogue data and the local meter. */
  const picks: AiScored[] = useMemo(() => {
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

  /** Rotating, wish-aware status lines so the wait never feels static. */
  const loadingLines = useMemo(() => {
    const shelfCount = shelf.length;
    if (wish) {
      const w = wish.trim();
      return [
        `Reading “${w}” against your beauty profile…`,
        `Filtering the rewards catalogue for “${w}”…`,
        `Checking what your ${shelfCount} shelf products already cover…`,
        `Matching “${w}” with your ${skinType.toLowerCase()} skin…`,
        `Ranking the closest matches and writing your read…`,
      ];
    }
    return [
      `Reading your ${skinType.toLowerCase()} skin profile…`,
      `Browsing your ${shelfCount} products across skin, hair and makeup…`,
      `Weighing your ${selected.length} beauty concerns…`,
      `Curating the rewards your points can reach…`,
      `Picking the three that fit you best…`,
    ];
  }, [wish, shelf.length, skinType, selected.length]);

  const [loadingStep, setLoadingStep] = useState(0);
  useEffect(() => {
    if (!busy) return;
    setLoadingStep(0);
    const id = window.setInterval(
      () => setLoadingStep((i) => (i + 1) % loadingLines.length),
      2000,
    );
    return () => window.clearInterval(id);
  }, [busy, loadingLines]);

  const askWish = (value: string) => {
    setWish(value);
    setShelfDirty(false);
    startRecommend({ shelf, wish: value });
  };

  const clearWish = () => {
    setWish(null);
    startRecommend({ shelf, wish: null });
  };


  const handleRedeem = (r: Reward) => {
    if (redeemed.includes(r.id) || r.points > points) return;
    onRedeem({ id: r.id, product: r.name, points: r.points });
  };

  const handleRemove = (r: Reward) => onRemove(r.id);


  const toggleShelf = (id: string) =>
    setShelf((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      // Only the default (no typed request) state offers a refresh prompt.
      if (!wish) setShelfDirty(true);
      return next;
    });

  /** One read, shared by the hero panel and the sticky companion bar. */
  const speech = {
    title: quip
      ? "Freebie Buddy · ahem"
      : busy
        ? "Freebie Buddy · thinking"
        : activePick || active
          ? `Freebie Buddy · ${shown?.reward.name}`
          : `Freebie Buddy · here's what I suggest for you`,
    body: quip
      ? quip
      : busy
        ? (loadingLines[loadingStep] ?? loadingLines[0]!)
        : activePick
          ? `${activePick.score.headline} ${activePick.aiRoutine}`
          : active
            ? `${active.score.headline} ${active.reward.routine}`
            : result.intro,
    caution:
      !quip && !busy
        ? (activePick?.aiCaution ?? (active ? active.reward.caution : undefined))
        : undefined,
  };


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
              <MicroSpark /> AI reward recommender
            </p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[1.08] text-balance">
              Explore the best rewards for you
            </h1>



            <div className="mt-10 grid gap-8 border-t border-hairline pt-10 lg:grid-cols-[150px_minmax(0,1fr)]">
              <CompactOrb
                className="h-[150px] w-[150px]"
                thinking={busy || Boolean(active) || Boolean(quip)}
                mood={
                  "calm"
                }
              />

              <div className="self-start">
                <RecommendationPrompt
                  wish={wish}
                  busy={busy}
                  concerns={selected}
                  onSubmit={askWish}
                  onClear={clearWish}
                />

                {result.note && !busy && (
                  <p className="mt-3 text-[11px] text-muted-foreground">{result.note}</p>
                )}

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
                      onClick={() => startRecommend({ shelf, wish })}
                      className="bg-foreground px-4 py-2 text-[10px] tracking-[0.2em] text-background uppercase"
                    >
                      Update recommendations
                    </button>
                  </motion.div>
                )}
              </div>

            </div>
          </motion.section>

          <BuddyBar
            className="mt-12"
            title={speech.title}
            body={speech.body}
            caution={speech.caution}
            thinking={busy || Boolean(active) || Boolean(activePick) || Boolean(quip)}
            mood={"calm"}
            readKey={`${activeId ?? "intro"}-${quip ?? ""}-${busy}-${busy ? loadingStep : ""}`}
          />

          <div className="mt-6 flex items-end justify-between border-b border-hairline pb-4">
            <h2 className="font-serif text-2xl">Top picks</h2>

            <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              {busy ? "Curating…" : `${picks.length} ${picks.length === 1 ? "pick" : "picks"}`}
            </p>
          </div>

          <div
            className={
              "grid gap-px bg-hairline " +
              (picks.length === 1
                ? "sm:grid-cols-1 xl:grid-cols-2"
                : picks.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 xl:grid-cols-3")
            }
          >
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
                      onLeave={() => setActiveId(null)}
                    />
                  </motion.div>
                ))}
          </div>

          <Boutique
            scored={scored}
            redeemed={redeemed}
            onRedeem={handleRedeem}
            onRemove={handleRemove}
            onExplain={(r) => setActiveId(r.id)}
            onClearExplain={() => setActiveId(null)}
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
