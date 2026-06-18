import { useEffect, useMemo, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { DeepCard } from "@/components/DeepCard";
import { DoodlePad } from "@/components/DoodlePad";
import { JOLRate } from "@/components/JOLRate";
import { StageReveal } from "@/components/StageReveal";
import { useVocabStore } from "@/store/vocabStore";
import type { Word, WordProgress } from "@/types";
import { Link } from "react-router-dom";
import { Zap, ChevronRight } from "lucide-react";

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

  useEffect(() => {
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
            词库还没有数据，先去 <Link to="/library" className="text-moss underline">词库</Link> 导入或使用内置高频词。
          </p>
          <div className="mt-6">
            <Link to="/library" className="btn-primary">去词库</Link>
          </div>
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
    setIdx((i) => i + 1);
  };

  const quickFinish = () => {
    // 跳过精细编码：直接用 medium（或用户设置的默认）+ 无涂鸦
    ensureProgress(current.id, "medium");
    recordSession("learn");
    setIdx((i) => i + 1);
  };

  return (
    <div>
      <NavBar />
      <main className="container py-6 sm:py-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-ink dark:text-night-text">学新词</h1>
            <p className="text-sm text-ink-mute dark:text-night-text/60">
              按：DeepCard → JOL → Doodle · 共 {candidates.length} 词待学
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-mute dark:text-night-text/60">
            <span className="font-mono text-ink dark:text-night-text">{idx + 1}</span> / {candidates.length}
            <button type="button" onClick={quickFinish} className="btn-outline ml-2">
              <Zap size={16} /> 跳过精细编码（默认难度）
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <section className="space-y-4">
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
            <div className="flex justify-end">
              <button type="button" className="btn-ghost" onClick={quickFinish}>
                <Zap size={16} /> 跳过 · 使用默认难度 & 无涂鸦 <ChevronRight size={14} />
              </button>
            </div>
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
                <li>或者直接 <span className="text-moss">跳过精细编码</span> 快速完成</li>
              </ol>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
