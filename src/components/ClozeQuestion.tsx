import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Shuffle } from "lucide-react";
import { clsx } from "clsx";
import type { Word } from "@/types";

interface Props {
  word: Word;
  onAnswer: (correct: boolean) => void;
  revealed: boolean;
}

/** 句中填空：将例句中的 word 替换为 _____，让用户选择正确单词。 */
export function ClozeQuestion({ word, onAnswer, revealed }: Props) {
  const tokens = useMemo(
    () => word.example.split(/\b/).filter((t) => t.trim().length > 0),
    [word.example],
  );
  const distractors = useMemo(() => tokens.filter((t) => t !== word.word).slice(-6), [tokens, word.word]);
  const options = useMemo(() => {
    const p = Array.from(new Set([word.word, ...distractors])).slice(0, 5);
    return p.sort(() => Math.random() - 0.5);
  }, [word.word, distractors]);
  const masked = useMemo(() => {
    const re = new RegExp(`\\b${word.word}\\b`, "i");
    return word.example.replace(re, "_____");
  }, [word]);

  const [picked, setPicked] = useState<string | null>(null);

  const pick = (opt: string) => {
    if (revealed || picked) return;
    setPicked(opt);
    onAnswer(opt.toLowerCase() === word.word.toLowerCase());
  };

  return (
    <div className="paper-card p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.18em] text-ink-mute dark:text-night-text/50">
          句中填空 · cloze
        </div>
        <span className="chip">
          <Shuffle size={12} /> 共 {options.length} 个候选
        </span>
      </div>

      <blockquote className="mt-2 border-l-2 border-moss/40 pl-4 text-[17px] italic text-ink dark:text-night-text">
        {masked}
      </blockquote>
      <p className="mt-1 text-sm text-ink-mute dark:text-night-text/60">{word.exampleCn}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((opt) => {
          const isRight = opt.toLowerCase() === word.word.toLowerCase();
          const isPicked = picked === opt;
          const show = revealed || picked;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => pick(opt)}
              className={clsx(
                "rounded-[10px] border px-3 py-2 text-[15px] font-display transition-colors",
                !show &&
                  "border-paper-200 dark:border-white/10 hover:border-moss hover:bg-moss/5 text-ink dark:text-night-text",
                show && isRight && "border-moss bg-moss/10 text-moss",
                show && isPicked && !isRight && "border-wine bg-wine/10 text-wine",
                show && !isPicked && !isRight && "border-paper-200 dark:border-white/10 text-ink-mute dark:text-night-text/60",
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                {opt}
                {show && isRight && <CheckCircle2 size={16} className="text-moss" />}
                {show && isPicked && !isRight && <XCircle size={16} className="text-wine" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
