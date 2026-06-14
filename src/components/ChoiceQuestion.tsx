import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { clsx } from "clsx";
import type { Word } from "@/types";

interface Props {
  word: Word;
  options: string[];
  onAnswer: (correct: boolean) => void;
  revealed: boolean;
}

export function ChoiceQuestion({ word, options, onAnswer, revealed }: Props) {
  const [picked, setPicked] = useState<string | null>(null);

  const opts = useMemo(() => {
    const pool = Array.from(new Set([word.meaning, ...options])).slice(0, 4);
    return pool.sort(() => Math.random() - 0.5);
  }, [word, options]);

  const pick = (opt: string) => {
    if (revealed || picked) return;
    setPicked(opt);
    onAnswer(opt === word.meaning);
  };

  return (
    <div className="paper-card p-4 sm:p-6">
      <div className="text-xs uppercase tracking-[0.18em] text-ink-mute dark:text-night-text/50">
        看英文 → 选中文（en → cn）
      </div>
      <h3 className="mt-2 font-display text-3xl text-ink dark:text-night-text">{word.word}</h3>
      <p className="text-sm text-ink-mute dark:text-night-text/60">
        <span className="font-mono">{word.phonetic}</span> · {word.partOfSpeech}
      </p>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {opts.map((opt) => {
          const isRight = opt === word.meaning;
          const isPicked = picked === opt;
          const show = revealed || picked;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => pick(opt)}
              className={clsx(
                "group text-left rounded-[10px] border p-3 text-[15px] transition-colors",
                !show &&
                  "border-paper-200 dark:border-white/10 hover:border-moss hover:bg-moss/5 text-ink dark:text-night-text",
                show && isRight && "border-moss bg-moss/10 text-moss",
                show && isPicked && !isRight && "border-wine bg-wine/10 text-wine",
                show && !isPicked && !isRight && "border-paper-200 dark:border-white/10 text-ink-mute dark:text-night-text/60",
              )}
              aria-pressed={isPicked}
            >
              <span className="flex items-start justify-between gap-2">
                <span>{opt}</span>
                {show && isRight && <CheckCircle2 size={18} className="text-moss" />}
                {show && isPicked && !isRight && <XCircle size={18} className="text-wine" />}
              </span>
            </button>
          );
        })}
      </div>

      {revealed && picked && picked !== word.meaning && (
        <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-ochre/40 bg-ochre/10 p-3 text-sm text-ink-soft dark:text-night-text/80">
          <Lightbulb size={16} className="mt-0.5 text-ochre" />
          <span>
            正确释义：<span className="font-medium text-ink dark:text-night-text">{word.meaning}</span>
          </span>
        </div>
      )}
    </div>
  );
}
