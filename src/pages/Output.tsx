import { useMemo, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { useVocabStore } from "@/store/vocabStore";
import { Link } from "react-router-dom";

const CHUNK_K = 3;

export function Output() {
  const words = useVocabStore((s) => s.words);
  const progressMap = useVocabStore((s) => s.progressMap);
  const setUserSentence = useVocabStore((s) => s.setUserSentence);

  const activePool = useMemo(
    () => words.filter((w) => progressMap[w.id]).slice(-10),
    [words, progressMap],
  );

  const word = activePool[Math.floor(Math.random() * activePool.length)] ?? words[0];

  const [sentence, setSentence] = useState("");
  const [chunks, setChunks] = useState<string[]>([]);
  const [assembled, setAssembled] = useState<string[]>([]);
  const [mode, setMode] = useState<"sentence" | "chunk">("sentence");

  if (!word) {
    return (
      <div>
        <NavBar />
        <main className="container py-10">
          <h1 className="font-display text-2xl">输出闭环</h1>
          <p className="mt-2 text-sm text-ink-mute dark:text-night-text/60">
            还没有可供复习的单词。请先去 <Link to="/learn" className="text-moss underline">学新词</Link>。
          </p>
        </main>
      </div>
    );
  }

  const prepareChunks = () => {
    const tokens = word.example
      .replace(/[.,!?;]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 0);
    const seed = tokens.slice(0, Math.max(CHUNK_K, Math.min(tokens.length, 6)));
    const extra = [word.word, ...(word.synonyms ?? []).slice(0, 2)];
    const pool = Array.from(new Set([...seed, ...extra]));
    pool.sort(() => Math.random() - 0.5);
    setChunks(pool);
    setAssembled([]);
    setMode("chunk");
  };

  const addChunk = (c: string) => {
    if (assembled.includes(c)) return;
    setAssembled((a) => [...a, c]);
  };
  const removeChunk = (idx: number) => {
    setAssembled((a) => a.filter((_, i) => i !== idx));
  };

  const submitSentence = () => {
    if (!sentence.trim()) return;
    setUserSentence(word.id, sentence.trim());
    setSentence("");
  };

  const submitChunks = () => {
    if (assembled.length < 3) return;
    setUserSentence(word.id, assembled.join(" "));
  };

  return (
    <div>
      <NavBar />
      <main className="container py-6 sm:py-10">
        <header>
          <h1 className="font-display text-2xl text-ink dark:text-night-text">输出闭环</h1>
          <p className="text-sm text-ink-mute dark:text-night-text/60">
            用目标词造句 / 装配词块 —— 生成效应让记忆更稳固。
          </p>
        </header>

        <section className="paper-card mt-6 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="font-display text-2xl text-ink dark:text-night-text">{word.word}</p>
              <p className="text-sm text-ink-mute dark:text-night-text/60">
                <span className="font-mono">{word.phonetic}</span> · {word.partOfSpeech}
              </p>
            </div>
            <div className="inline-flex gap-1.5">
              <button className={mode === "sentence" ? "btn-primary" : "btn-ghost"} onClick={() => setMode("sentence")}>
                造句
              </button>
              <button className={mode === "chunk" ? "btn-primary" : "btn-ghost"} onClick={() => { setMode("chunk"); prepareChunks(); }}>
                词块装配
              </button>
            </div>
          </div>

          <p className="mt-3 text-[15px] text-ink-soft dark:text-night-text/80">
            <span className="text-ink-mute dark:text-night-text/50">英英：</span>{word.enDef}
          </p>
          <p className="mt-2 text-[15px] text-ink-soft dark:text-night-text/80">{word.example}</p>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {mode === "sentence" ? (
            <div className="paper-card p-5">
              <h3 className="font-display text-lg">请用 <span className="text-moss">{word.word}</span> 造一个句子</h3>
              <textarea
                className="field mt-3 min-h-[120px] font-serif"
                placeholder="写一个你日常会用到的句子，更利于情境编码"
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
              />
              <div className="mt-3 flex justify-end gap-2">
                <button className="btn-outline" onClick={() => setSentence("")}>清空</button>
                <button className="btn-primary" onClick={submitSentence} disabled={!sentence.trim()}>
                  保存造句
                </button>
              </div>
            </div>
          ) : (
            <div className="paper-card p-5">
              <h3 className="font-display text-lg">词块装配：点击拼出一个小句子</h3>
              <div className="mt-3 min-h-[72px] rounded-[10px] border border-dashed border-paper-300 dark:border-white/20 p-3">
                {assembled.length === 0 ? (
                  <p className="text-sm text-ink-mute dark:text-night-text/60">
                    从下方候选项点击拼接；顺序会影响结果。
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {assembled.map((c, i) => (
                      <button
                        key={i + c}
                        type="button"
                        onClick={() => removeChunk(i)}
                        className="chip hover:border-wine"
                      >
                        {c} <span className="text-wine">×</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {chunks.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => addChunk(c)}
                    className="chip hover:border-moss disabled:opacity-50"
                    disabled={assembled.includes(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button type="button" className="btn-outline" onClick={prepareChunks}>换一批词块</button>
                <button type="button" className="btn-primary" disabled={assembled.length < 3} onClick={submitChunks}>
                  保存为造句
                </button>
              </div>
            </div>
          )}

          <div className="paper-card p-5">
            <h3 className="font-display text-lg">已存造句（属于此词）</h3>
            {word.userSentences && word.userSentences.length > 0 ? (
              <ol className="mt-3 space-y-2 text-[15px] text-ink-soft dark:text-night-text/80 list-decimal list-inside">
                {word.userSentences.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-ink-mute dark:text-night-text/60">还没有保存过造句。</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
