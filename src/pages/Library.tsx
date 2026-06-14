import { useMemo, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { EmptyState } from "@/components/EmptyState";
import { useVocabStore } from "@/store/vocabStore";
import type { Word, WordProgress } from "@/types";

const DEMO_JSON = `[
  {
    "id": "demo-1",
    "word": "ephemeral",
    "phonetic": "/ɪˈfemərəl/",
    "partOfSpeech": "adj.",
    "meaning": "短暂的；瞬息的",
    "enDef": "lasting for a very short time",
    "example": "The beauty of autumn leaves is ephemeral.",
    "tags": ["GRE"]
  },
  {
    "id": "demo-2",
    "word": "ubiquitous",
    "phonetic": "/juːˈbɪkwɪtəs/",
    "partOfSpeech": "adj.",
    "meaning": "无处不在的",
    "enDef": "present, appearing, or found everywhere",
    "example": "Smartphones are ubiquitous in modern life.",
    "tags": ["GRE"]
  }
]`;

export function Library() {
  const words = useVocabStore((s) => s.words);
  const progressMap = useVocabStore((s) => s.progressMap);
  const importWords = useVocabStore((s) => s.importWords);
  const updateSettings = useVocabStore((s) => s.updateSettings);
  const settings = useVocabStore((s) => s.settings);

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>(settings.activeLibraryTag);

  const allTags = useMemo(() => {
    const s = new Set<string>(["全部"]);
    words.forEach((w) => w.tags?.forEach((t) => s.add(t)));
    return Array.from(s);
  }, [words]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return words.filter((w) => {
      const matchTag = selectedTag === "全部" || w.tags?.includes(selectedTag);
      if (!matchTag) return false;
      if (!q) return true;
      return (
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        w.enDef.toLowerCase().includes(q)
      );
    });
  }, [words, search, selectedTag]);

  const importFromJson = () => {
    try {
      const parsed = JSON.parse(DEMO_JSON) as Word[];
      importWords(parsed);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <NavBar libraryLabel={selectedTag} />
      <main className="container py-6 sm:py-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-ink dark:text-night-text">词库</h1>
            <p className="text-sm text-ink-mute dark:text-night-text/60">
              {words.length} 个词 · 筛选：
              <select
                value={selectedTag}
                onChange={(e) => { setSelectedTag(e.target.value); updateSettings({ activeLibraryTag: e.target.value }); }}
                className="ml-2 rounded-[8px] border border-paper-200 dark:border-white/10 bg-white dark:bg-night-card px-2 py-1 text-sm"
              >
                {allTags.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="按英文 / 中文释义搜索…"
              className="field max-w-xs"
            />
            <button type="button" className="btn-outline" onClick={importFromJson}>载入示例词</button>
            <label className="btn-outline cursor-pointer">
              导入 JSON
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const parsed = JSON.parse(text) as Word[];
                    if (!Array.isArray(parsed)) return;
                    importWords(parsed);
                  } catch {
                    // ignore
                  }
                }}
              />
            </label>
          </div>
        </header>

        {filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="没有找到匹配的词" hint="尝试清空搜索或更改标签。" actionLabel="载入示例" actionHref="#" />
            <div className="mt-4 flex justify-center">
              <button className="btn-primary" onClick={importFromJson}>载入示例</button>
            </div>
          </div>
        ) : (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((w) => (
              <WordCard key={w.id} word={w} progress={progressMap[w.id]} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function WordCard({ word, progress }: { word: Word; progress?: WordProgress }) {
  const [reveal, setReveal] = useState(false);

  return (
    <article className="paper-card p-4 h-full flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-xl text-ink dark:text-night-text">{word.word}</h3>
          <p className="text-sm text-ink-mute dark:text-night-text/60">
            <span className="font-mono">{word.phonetic}</span> · {word.partOfSpeech}
          </p>
        </div>
        {progress && (
          <span className="chip">
            reps {progress.reps} · lapses {progress.lapses}
          </span>
        )}
      </div>

      <p className="mt-2 text-[15px] text-ink-soft dark:text-night-text/80">
        <span className="text-ink-mute dark:text-night-text/50">英英：</span>{word.enDef}
      </p>

      {word.roots && word.roots.length > 0 && (
        <ul className="mt-2 text-sm text-ink-soft dark:text-night-text/80">
          {word.roots.map((r) => (
            <li key={r.root}><span className="font-display text-moss">{r.root}</span> — {r.meaning}</li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-[15px] italic text-ink-soft dark:text-night-text/80">{word.example}</p>

      <div className="mt-3 flex items-center justify-between">
        <button type="button" className="btn-ghost text-xs" onClick={() => setReveal((r) => !r)}>
          {reveal ? "隐藏中文" : "揭示中文释义"}
        </button>
        <span className="chip">{(word.tags ?? []).join(", ") || "默认"}</span>
      </div>
      {reveal && (
        <p className="mt-2 text-sm text-ink dark:text-night-text">{word.meaning}</p>
      )}
    </article>
  );
}
