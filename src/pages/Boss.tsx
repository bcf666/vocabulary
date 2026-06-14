import { useMemo, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { ChoiceQuestion } from "@/components/ChoiceQuestion";
import { useVocabStore } from "@/store/vocabStore";
import { Link } from "react-router-dom";

export function Boss() {
  const words = useVocabStore((s) => s.words);
  const progressMap = useVocabStore((s) => s.progressMap);
  const markScore = useVocabStore((s) => s.markScore);

  const weak = useMemo(
    () =>
      words
        .filter((w) => (progressMap[w.id]?.lapses ?? 0) >= 1)
        .sort((a, b) => (progressMap[b.id]?.lapses ?? 0) - (progressMap[a.id]?.lapses ?? 0))
        .slice(0, 10),
    [words, progressMap],
  );

  const [hp, setHp] = useState(100);
  const [combo, setCombo] = useState(0);
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState<null | boolean>(null);

  const word = weak[idx];

  if (weak.length === 0) {
    return (
      <div>
        <NavBar />
        <main className="container py-10 text-center">
          <h1 className="font-display text-2xl text-ink dark:text-night-text">暂无弱点词 🏆</h1>
          <p className="mt-2 text-sm text-ink-mute dark:text-night-text/60">
            先去 <Link to="/review" className="text-moss underline">复习</Link> 暴露自己的 lapses 词。
          </p>
        </main>
      </div>
    );
  }

  const handleAnswer = (ok: boolean) => {
    if (!word || answered !== null) return;
    markScore(word.id, ok ? 4 : 2, "en→cn");
    setAnswered(ok);
    setHp((h) => Math.max(0, h - (ok ? 18 : 8)));
    setCombo((c) => (ok ? c + 1 : 0));
  };

  const next = () => {
    if (idx + 1 >= weak.length) {
      setHp(0);
    } else {
      setIdx((i) => i + 1);
      setAnswered(null);
    }
  };

  return (
    <div>
      <NavBar />
      <main className="container py-6 sm:py-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-ink dark:text-night-text">弱点 Boss 战</h1>
            <p className="text-sm text-ink-mute dark:text-night-text/60">
              以 lapses 降序排序，直到 Boss HP 归零。共 {weak.length} 个弱点词。
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-soft dark:text-night-text/80">
            <span>连击 <span className="font-mono text-ink dark:text-night-text">{combo}</span></span>
            <span className="chip">HP <span className="font-mono ml-1">{hp}</span></span>
          </div>
        </header>

        <section className="paper-card mt-6 p-4 sm:p-6">
          <div className="flex items-center justify-between text-xs text-ink-mute dark:text-night-text/60">
            <span>当前词</span>
            <span className="font-mono">{idx + 1} / {weak.length}</span>
          </div>
          <ChoiceQuestion
            key={word.id + "-" + idx}
            word={word}
            options={weak.filter((w) => w.id !== word.id).slice(0, 3).map((w) => w.meaning)}
            onAnswer={handleAnswer}
            revealed={answered !== null}
          />
          {answered !== null && (
            <div className="mt-4 flex items-center justify-between">
              <span className={answered ? "text-moss" : "text-wine"}>
                {answered ? "击中 Boss！" : "Boss 防御成功，连击被打断。"}
              </span>
              <button className="btn-primary" onClick={next}>
                {idx + 1 >= weak.length ? "查看结果" : "下一弱点"}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
