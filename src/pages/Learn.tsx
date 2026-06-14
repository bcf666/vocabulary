import { useEffect, useMemo, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { DeepCard } from "@/components/DeepCard";
import { DoodlePad } from "@/components/DoodlePad";
import { JOLRate } from "@/components/JOLRate";
import { StageReveal } from "@/components/StageReveal";
import { useVocabStore } from "@/store/vocabStore";
import type { Word, WordProgress } from "@/types";
import { Link } from "react-router-dom";

type Step = "card" | "jol" | "doodle" | "done";

export function Learn() {
  const words = useVocabStore((s) => s.words);
  const progressMap = useVocabStore((s) => s.progressMap);
  const ensureProgress = useVocabStore((s) => s.ensureProgress);
  const recordSession = useVocabStore((s) => s.recordSession);
  const storeSetDoodle = useVocabStore((s) => s.setDoodle);
  const settings = useVocabStore((s) => s.settings);

  const candidates = useMemo(
    () => words.filter((w) => !progressMap[w.id]),
    [words, progressMap],
  );

  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<Step>("card");
  const [jol, setJol] = useState<WordProgress["initialDifficulty"]>("medium");
  const [doodle, setDoodle] = useState<string | undefined>(undefined);
  const [, setDoodleSeed] = useState(0);

  const current: Word | undefined = candidates[idx];
  const [showStage, setShowStage] = useState(false);

  useEffect(() => {
    // reset when moving to new word
    setStep("card");
    setJol("medium");
    setDoodle(undefined);
    setDoodleSeed((s) => s + 1);
  }, [idx]);

  if (words.length === 0) {
    return (
      <div>
        <NavBar />
        <main className="container py-10">
          <h1 className="font-display text-2xl text-ink dark:text-night-text">学新词</h1>
          <p className="mt-2 text-sm text-ink-mute dark:text-night-text/60">
            词库还没有数据，先去 <Link to="/library" className="text-moss underline">词库</Link> 导入或使用内置演示词表。
          </p>
        </main>
      </div>
    );
  }

  if (!current) {
    return (
      <div>
        <NavBar />
        <main className="container py-10 text-center">
          <h1 className="font-display text-2xl text-ink dark:text-night-text">已经没有新词啦 🎉</h1>
          <p className="mt-2 text-sm text-ink-mute dark:text-night-text/60">
            所有词都已具有学习记录，去 <Link to="/review" className="text-moss underline">复习</Link> 巩固记忆。
          </p>
          <div className="mt-6 inline-flex gap-2">
            <Link to="/review" className="btn-primary">去复习</Link>
            <Link to="/library" className="btn-outline">导入更多</Link>
          </div>
        </main>
      </div>
    );
  }

  const confirmLearn = () => {
    ensureProgress(current.id, jol);
    if (doodle) storeSetDoodle(current.id, doodle);
    recordSession("learn");
    setShowStage(true);
    window.setTimeout(() => {
      setShowStage(false);
      setIdx((i) => i + 1);
    }, 1200);
  };

  return (
    <div>
      <NavBar />
      <main className="container py-6 sm:py-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-ink dark:text-night-text">学新词</h1>
            <p className="text-sm text-ink-mute dark:text-night-text/60">
              按：DeepCard → JOL → Doodle；中文释义默认隐藏（精细加工）
            </p>
          </div>
          <div className="text-sm text-ink-mute dark:text-night-text/60">
            进度 <span className="font-mono text-ink dark:text-night-text">{idx + 1}</span> / {Math.max(candidates.length, 0)}
          </div>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <section className="space-y-4">
            {showStage ? (
              <StageReveal
                progress={{
                  wordId: current.id,
                  initialDifficulty: jol,
                  status: "acquaintance",
                  reps: 1,
                  lapses: 0,
                  easeFactor: 2.5,
                  intervalDays: 1,
                  lastReviewedAt: Date.now(),
                  nextReviewAt: Date.now() + 86_400_000,
                  history: [],
                }}
              />
            ) : (
              <DeepCard
                key={current.id + (settings.defaultCnHidden ? "-hidden" : "")}
                word={current}
                nextLabel={step === "card" ? "进入 JOL 预估" : step === "jol" ? "进入 Doodle" : "提交，进入间隔队列"}
                onNext={() => {
                  if (step === "card") setStep("jol");
                  else if (step === "jol") setStep("doodle");
                  else confirmLearn();
                }}
              />
            )}
          </section>

          <section className="space-y-4">
            <JOLRate
              value={jol}
              onChange={setJol}
              label="学这个词之前，预估难度（JOL）"
            />
            <div className="text-xs text-ink-mute dark:text-night-text/60">
              此难度影响 easeFactor 初始值（困难起始 2.1、简单 2.9）。
            </div>
            <DoodlePad value={doodle} onChange={setDoodle} />
            <div className="paper-card p-4 text-sm text-ink-soft dark:text-night-text/80">
              <p className="font-display text-ink dark:text-night-text mb-2">建议工作流</p>
              <ol className="space-y-1.5 list-decimal list-inside">
                <li>先听发音；阅读英英释义与词根拆解（不揭示中文）</li>
                <li>尝试用 <span className="text-moss">自己的话</span> 说一次释义，然后点击揭示中文</li>
                <li>给难度 JOL；简单涂鸦一个「助记」意象（生成效应）</li>
                <li>提交 → 单词进入间隔队列</li>
              </ol>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
