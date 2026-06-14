import { useMemo, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { useVocabStore } from "@/store/vocabStore";
import { Link } from "react-router-dom";
import type { Word } from "@/types";

export function Article() {
  const words = useVocabStore((s) => s.words);
  const importWords = useVocabStore((s) => s.importWords);
  const settings = useVocabStore((s) => s.settings);
  const updateSettings = useVocabStore((s) => s.updateSettings);

  const [text, setText] = useState<string>(
    "Paste an article in English. Words you have not yet learned will be extracted and added to the queue, each bound to the original sentence for contextual encoding.",
  );

  const analysis = useMemo(() => {
    const known = new Set(words.map((w) => w.word.toLowerCase()));
    const raw = text
      .replace(/[^A-Za-z'’\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && t.length < 24)
      .map((t) => t.toLowerCase());
    const unique = Array.from(new Set(raw));
    const newWords = unique.filter((w) => !known.has(w));

    // bind sentence
    const sentences = text.split(/(?<=[.!?])\s+/);
    const byWord = new Map<string, string>();
    for (const w of newWords) {
      for (const s of sentences) {
        if (new RegExp(`\\b${w}\\b`, "i").test(s)) {
          byWord.set(w, s.trim());
          break;
        }
      }
    }
    return { unique, newWords, byWord };
  }, [text, words]);

  const [imported, setImported] = useState(false);
  const doImport = () => {
    const additions: Word[] = analysis.newWords.map((w, i) => ({
      id: `imported-${Date.now()}-${i}`,
      word: w,
      phonetic: undefined,
      partOfSpeech: "(导入)",
      meaning: "（需手工补充释义）",
      enDef: "(自导入的生词，需要补充详细释义)",
      synonyms: [],
      example: analysis.byWord.get(w)?.slice(0, 140) ?? "",
      exampleCn: undefined,
      sourceSentences: [analysis.byWord.get(w) ?? ""],
      tags: ["自导入"],
    }));
    importWords(additions);
    setImported(true);
    if (settings.activeLibraryTag === "全部") {
      // keep
    }
  };

  return (
    <div>
      <NavBar />
      <main className="container py-6 sm:py-10">
        <header>
          <h1 className="font-display text-2xl text-ink dark:text-night-text">语料导入 · 情境编码</h1>
          <p className="text-sm text-ink-mute dark:text-night-text/60">
            粘贴一篇英文文章，提取不在本地词库中的生词，并绑定原句。
          </p>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <section className="paper-card p-5">
            <label className="text-sm text-ink-soft dark:text-night-text/80">粘贴原文</label>
            <textarea
              className="field mt-2 min-h-[220px] font-serif"
              value={text}
              onChange={(e) => { setText(e.target.value); setImported(false); }}
              placeholder="Paste an article..."
            />
            <div className="mt-2 text-xs text-ink-mute dark:text-night-text/60">
              共识别 {analysis.unique.length} 个独特词（≥3 字母），其中 {analysis.newWords.length} 个是新词。
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Link to="/library" className="btn-ghost">去词库 →</Link>
              <button className="btn-primary" disabled={analysis.newWords.length === 0} onClick={doImport}>
                导入这 {analysis.newWords.length} 个新词
              </button>
            </div>
            {imported && (
              <div className="mt-3 rounded-[10px] border border-moss/30 bg-moss/5 p-3 text-sm text-moss">
                已导入！单词仍需要你手工补充 <b>释义 / 词根拆解</b> 以便精细加工。
              </div>
            )}
          </section>

          <section className="paper-card p-5">
            <h3 className="font-display text-lg text-ink dark:text-night-text">候选新词</h3>
            {analysis.newWords.length === 0 ? (
              <p className="mt-2 text-sm text-ink-mute dark:text-night-text/60">没有检测到新词。</p>
            ) : (
              <ul className="mt-3 space-y-3 max-h-[420px] overflow-auto pr-1">
                {analysis.newWords.slice(0, 60).map((w) => (
                  <li key={w} className="rounded-[10px] border border-paper-200 dark:border-white/10 p-3">
                    <p className="font-display text-lg text-ink dark:text-night-text">{w}</p>
                    {analysis.byWord.get(w) && (
                      <p className="mt-1 text-sm text-ink-soft dark:text-night-text/80 italic">
                        {analysis.byWord.get(w)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="btn-ghost mt-3"
              onClick={() => updateSettings({ activeLibraryTag: "自导入" })}
            >
              在词库中标记筛选 "自导入"
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
