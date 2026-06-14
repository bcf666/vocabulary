import { useEffect, useState } from "react";
import { Volume2, VolumeX, Eye, EyeOff, ChevronRight } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
import type { Word, WordProgress } from "@/types";
import { daysUntilReview } from "@/algorithm/scheduler";

interface Props {
  word: Word;
  progress?: WordProgress;
  revealMeaning?: boolean;
  showProgressFooter?: boolean;
  onRevealChange?: (revealed: boolean) => void;
  nextLabel?: string;
  onNext?: () => void;
}

export function DeepCard({
  word,
  progress,
  showProgressFooter,
  onRevealChange,
  nextLabel,
  onNext,
}: Props) {
  const { speak, supported } = useSpeech();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!revealed) return;
    onRevealChange?.(revealed);
  }, [revealed, onRevealChange]);

  const toggleReveal = () => setRevealed((r) => !r);

  return (
    <article
      className="paper-card relative overflow-hidden animate-[fadeUp_420ms_ease-out_both]"
      aria-label={`单词卡片：${word.word}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ochre/60 to-transparent" />
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-mute dark:text-night-text/60">
              <span className="chip">
                <span className="font-mono">{word.phonetic}</span>
              </span>
              <span className="chip">{word.partOfSpeech}</span>
              {word.tags?.slice(0, 2).map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight text-ink dark:text-night-text">
              {word.word}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => speak(word.word, { lang: "en-US" })}
              disabled={!supported}
              className="grid h-11 w-11 place-items-center rounded-[10px] border border-paper-200 dark:border-white/10 bg-white dark:bg-night-card text-moss hover:bg-moss hover:text-white transition-colors"
              aria-label="朗读英文单词"
              title="朗读英文"
            >
              {supported ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              onClick={toggleReveal}
              className="grid h-11 w-11 place-items-center rounded-[10px] border border-paper-200 dark:border-white/10 bg-white dark:bg-night-card text-ink-soft dark:text-night-text/70 hover:bg-paper-200 dark:hover:bg-white/10 transition-colors"
              aria-label={revealed ? "隐藏中文释义" : "显示中文释义"}
              title={revealed ? "隐藏中文释义" : "显示中文释义"}
            >
              {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <section className="mt-6">
          <h3 className="text-xs uppercase tracking-[0.18em] text-ink-mute dark:text-night-text/50">
            英英释义 · English
          </h3>
          <p className="mt-1.5 text-[17px] leading-relaxed text-ink dark:text-night-text">
            {word.enDef}
          </p>
          {word.synonyms && word.synonyms.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {word.synonyms.map((s) => (
                <span key={s} className="chip">
                  ≈ {s}
                </span>
              ))}
            </div>
          )}
        </section>

        {word.roots && word.roots.length > 0 && (
          <section className="mt-5">
            <h3 className="text-xs uppercase tracking-[0.18em] text-ink-mute dark:text-night-text/50">
              词根拆解 · Roots
            </h3>
            <ul className="mt-2 space-y-2">
              {word.roots.map((r) => (
                <li
                  key={r.root}
                  className="flex flex-wrap items-center gap-2 text-sm text-ink-soft dark:text-night-text/80"
                >
                  <span className="font-display text-base text-moss">{r.root}</span>
                  <span className="text-ink-mute dark:text-night-text/60">— {r.meaning}</span>
                  {r.relatedWords && r.relatedWords.length > 0 && (
                    <span className="text-ink-mute dark:text-night-text/50">
                      · {r.relatedWords.join(" / ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section
          className="mt-6 rounded-[12px] border border-paper-200 dark:border-white/10 bg-paper-50/70 dark:bg-white/5 p-4"
          aria-live="polite"
        >
          <h3 className="text-xs uppercase tracking-[0.18em] text-ink-mute dark:text-night-text/50">
            中文释义 · {revealed ? "已揭示" : "精细编码（点击揭示）"}
          </h3>
          <p className="mt-1.5 text-[17px] leading-relaxed text-ink dark:text-night-text">
            {revealed ? (
              word.meaning
            ) : (
              <span className="inline-flex items-center gap-1.5 text-ink-mute dark:text-night-text/50">
                <EyeOff size={14} />
                已隐藏 · 点击右上角"眼睛"图标或点击此处揭示
              </span>
            )}
          </p>
          {!revealed && (
            <button
              type="button"
              onClick={toggleReveal}
              className="mt-3 inline-flex items-center gap-1 text-sm text-moss hover:underline"
            >
              揭示中文释义 <ChevronRight size={14} />
            </button>
          )}
        </section>

        <section className="mt-6">
          <h3 className="text-xs uppercase tracking-[0.18em] text-ink-mute dark:text-night-text/50">
            例句 · Example
          </h3>
          <blockquote className="mt-2 border-l-2 border-ochre/70 pl-4 text-[16px] italic text-ink dark:text-night-text">
            {word.example}
          </blockquote>
          {revealed && word.exampleCn && (
            <p className="mt-1.5 text-sm text-ink-mute dark:text-night-text/60">
              {word.exampleCn}
            </p>
          )}
        </section>

        {word.userSentences && word.userSentences.length > 0 && (
          <section className="mt-6">
            <h3 className="text-xs uppercase tracking-[0.18em] text-ink-mute dark:text-night-text/50">
              我的造句 · Your sentences
            </h3>
            <ul className="mt-2 space-y-1 text-[15px] text-ink-soft dark:text-night-text/80">
              {word.userSentences.map((s, i) => (
                <li key={`${i}-${s}`} className="flex gap-2">
                  <span className="text-ink-mute dark:text-night-text/50">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {word.userDoodleUrl && (
          <section className="mt-6">
            <h3 className="text-xs uppercase tracking-[0.18em] text-ink-mute dark:text-night-text/50">
              涂鸦助记 · Doodle
            </h3>
            <img
              src={word.userDoodleUrl}
              alt="涂鸦助记"
              className="mt-2 max-h-40 rounded-[10px] border border-paper-200 dark:border-white/10 bg-white dark:bg-night-card"
            />
          </section>
        )}
      </div>

      {showProgressFooter && progress && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-paper-200 dark:border-white/10 bg-paper-50/50 dark:bg-white/[0.03] px-6 py-3 text-xs text-ink-mute dark:text-night-text/60">
          <span>
            状态 <span className="font-display text-ink dark:text-night-text">{progress.status}</span>
          </span>
          <span>
            reps <span className="font-mono text-ink dark:text-night-text">{progress.reps}</span>
          </span>
          <span>
            lapses <span className="font-mono text-wine">{progress.lapses}</span>
          </span>
          <span>
            EF <span className="font-mono text-moss">{progress.easeFactor.toFixed(2)}</span>
          </span>
          <span>
            下次复习 <span className="font-mono text-ink dark:text-night-text">{daysUntilReview(progress)} 天</span>
          </span>
        </div>
      )}

      {onNext && (
        <div className="flex justify-end border-t border-paper-200 dark:border-white/10 bg-white/60 dark:bg-night-card/60 px-6 py-3">
          <button type="button" onClick={onNext} className="btn-primary">
            {nextLabel ?? "下一步"}
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </article>
  );
}
