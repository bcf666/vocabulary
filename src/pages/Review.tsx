import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { ChoiceQuestion } from "@/components/ChoiceQuestion";
import { SpellQuestion } from "@/components/SpellQuestion";
import { ClozeQuestion } from "@/components/ClozeQuestion";
import { SpeakAndRate } from "@/components/SpeakAndRate";
import { FlowTimer } from "@/components/FlowTimer";
import { useVocabStore } from "@/store/vocabStore";
import { useSpeech } from "@/hooks/useSpeech";
import { needsReview } from "@/algorithm/scheduler";
import type { QuestionMode, Word } from "@/types";

const MODES: QuestionMode[] = ["en→cn", "cn→spell", "listen→spell", "cloze", "speak"];

export function Review() {
  const words = useVocabStore((s) => s.words);
  const progressMap = useVocabStore((s) => s.progressMap);
  const markScore = useVocabStore((s) => s.markScore);
  const settings = useVocabStore((s) => s.settings);
  const { speak } = useSpeech();

  const dueWords = useMemo(
    () =>
      words.filter((w) => {
        const p = progressMap[w.id];
        return p && needsReview(p);
      }),
    [words, progressMap],
  );

  const queue = useMemo(() => {
    const [r1, r2] = settings.newOldRatio;
    const newWords = words.filter((w) => !progressMap[w.id]);
    const combined: Array<{ word: Word; mode: QuestionMode }> = [];
    const dueSample = dueWords.slice(0, Math.max(8, Math.round(r2)));
    const newSample = newWords.slice(0, Math.max(4, Math.round(r1)));
    const base = [...dueSample, ...newSample];
    base.sort(() => Math.random() - 0.5);
    base.forEach((word) => {
      const mode = MODES[Math.floor(Math.random() * MODES.length)];
      combined.push({ word, mode });
    });
    return combined;
  }, [dueWords, words, progressMap, settings.newOldRatio]);

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<null | { ok: boolean; score: number }>(null);
  const [timerTick, setTimerTick] = useState(0);
  const [listenReady, setListenReady] = useState(false);
  const [minimal, setMinimal] = useState(true);

  const current = queue[index];
  const flashSecs = settings.flashCardSecs;

  const handleAnswer = (ok: boolean, responseMs = 0) => {
    if (!current || answered) return;
    const score: 0 | 1 | 2 | 3 | 4 | 5 = ok
      ? (responseMs < 6000 ? 5 : responseMs < 12000 ? 4 : 3)
      : (responseMs < 6000 ? 2 : 1);
    markScore(current.word.id, score, current.mode, { responseMs });
    setAnswered({ ok, score });
    if (settings.autoSpeakFirst) speak(current.word.word);
  };

  const next = () => {
    if (index + 1 >= queue.length) {
      // Jump to output if possible
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(null);
    setTimerTick((x) => x + 1);
    setListenReady(false);
  };

  if (words.length === 0) {
    return (
      <div>
        <NavBar />
        <main className="container py-10">
          <h1 className="font-display text-2xl">复习</h1>
          <p className="mt-2 text-sm text-ink-mute dark:text-night-text/60">
            词库为空，先去 <Link to="/library" className="text-moss underline">词库</Link> 导入。
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
          <h1 className="font-display text-2xl text-ink dark:text-night-text">本组已完成</h1>
          <p className="mt-2 text-sm text-ink-mute dark:text-night-text/60">
            可去 <Link to="/output" className="text-moss underline">输出闭环</Link> 做一次造句/词块装配；或去 <Link to="/stats" className="text-moss underline">统计页</Link> 看曲线。
          </p>
          <div className="mt-6 inline-flex gap-2">
            <Link to="/output" className="btn-primary">去输出</Link>
            <Link to="/learn" className="btn-outline">学新词</Link>
            <Link to="/review" className="btn-ghost" onClick={() => { setIndex(0); setAnswered(null); }}>再来一组</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <main className="container py-6 sm:py-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-ink dark:text-night-text">复习 · 5 模态交错</h1>
            <p className="text-sm text-ink-mute dark:text-night-text/60">
              题型自动混洗；每题 {flashSecs}s；答错重置间隔
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-ink-mute dark:text-night-text/60">
            <span className="font-mono text-ink dark:text-night-text">
              {index + 1} / {queue.length}
            </span>
            <span className="chip">当前：{current.mode}</span>
            <label className="ml-2 inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={minimal}
                onChange={(e) => setMinimal(e.target.checked)}
                className="h-4 w-4 accent-moss"
              />
              <span>极简模式（隐藏右侧小卡）</span>
            </label>
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            {current.mode === "en→cn" && (
              <ChoiceQuestion
                word={current.word}
                options={shuffledDistractors(current.word, words, "meaning")}
                onAnswer={(ok) => handleAnswer(ok)}
                revealed={!!answered}
              />
            )}
            {current.mode === "cn→spell" && (
              <SpellQuestion
                word={current.word}
                promptKind="cn→spell"
                onAnswer={(ok, ms) => handleAnswer(ok, ms)}
                revealed={!!answered}
              />
            )}
            {current.mode === "listen→spell" && (
              <SpellQuestion
                word={current.word}
                promptKind="listen→spell"
                onAnswer={(ok, ms) => handleAnswer(ok, ms)}
                revealed={!!answered || listenReady}
                playPrompt={() => {
                  setListenReady(true);
                  speak(current.word.word);
                }}
              />
            )}
            {current.mode === "cloze" && (
              <ClozeQuestion
                word={current.word}
                onAnswer={(ok) => handleAnswer(ok)}
                revealed={!!answered}
              />
            )}
            {current.mode === "speak" && (
              <SpeakAndRate
                word={current.word}
                onAnswer={(ok) => handleAnswer(ok)}
                revealed={!!answered}
              />
            )}

            {answered && (
              <div className="flex items-center justify-between rounded-[12px] border border-paper-200 dark:border-white/10 bg-white dark:bg-night-card px-4 py-3">
                <span className="text-sm text-ink-soft dark:text-night-text/80">
                  提交结果：
                  <span className={answered.ok ? "text-moss font-display" : "text-wine font-display"}>
                    {answered.ok ? `掌握 · score ${answered.score}` : `需要再练 · score ${answered.score}`}
                  </span>
                </span>
                <button type="button" className="btn-primary" onClick={next}>
                  下一题
                </button>
              </div>
            )}
          </div>

          {!minimal && (
            <aside className="space-y-4">
              <div className="paper-card p-4">
                <h3 className="font-display text-ink dark:text-night-text text-base">心流计时</h3>
                <div className="mt-3">
                  <FlowTimer key={timerTick + "-" + index} seconds={flashSecs} onExpire={() => handleAnswer(false, flashSecs * 1000)} />
                </div>
                <p className="mt-3 text-xs text-ink-mute dark:text-night-text/60">
                  到时自动判错并计入 lapses，模拟「提取失败」的学习效果。
                </p>
              </div>

              <section className="paper-card p-4">
                <h3 className="font-display text-ink dark:text-night-text text-base">单词小卡</h3>
                <div className="mt-2">
                  <p className="font-display text-xl">{current.word.word}</p>
                  <p className="text-sm text-ink-mute dark:text-night-text/60">
                    <span className="font-mono">{current.word.phonetic}</span> · {current.word.partOfSpeech}
                  </p>
                  <p className="mt-2 text-[15px] text-ink-soft dark:text-night-text/80">
                    <span className="text-ink-mute dark:text-night-text/50">英英：</span>{current.word.enDef}
                  </p>
                  {current.word.roots && current.word.roots.length > 0 && (
                    <ul className="mt-2 text-sm text-ink-soft dark:text-night-text/80 space-y-1">
                      {current.word.roots.map((r) => (
                        <li key={r.root}><span className="text-moss font-display">{r.root}</span> — {r.meaning}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

function shuffledDistractors(current: Word, pool: Word[], key: "meaning") {
  return pool
    .filter((w) => w.id !== current.id)
    .map((w) => w[key])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
}
