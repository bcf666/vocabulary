import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { clsx } from "clsx";
import type { Word } from "@/types";

interface Props {
  word: Word;
  promptKind?: "cn→spell" | "listen→spell";
  onAnswer: (correct: boolean, responseMs: number) => void;
  revealed: boolean;
  playPrompt?: () => void;
}

export function SpellQuestion({ word, promptKind = "cn→spell", onAnswer, revealed, playPrompt }: Props) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [startAt] = useState(() => Date.now());

  const correct = value.trim().toLowerCase() === word.word.toLowerCase();

  const submit = () => {
    if (revealed || submitted) return;
    setSubmitted(true);
    onAnswer(correct, Date.now() - startAt);
  };

  return (
    <div className="paper-card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.18em] text-ink-mute dark:text-night-text/50">
          {promptKind === "listen→spell" ? "听音 → 写单词（listen → spell）" : "看中文 → 拼单词（cn → spell）"}
        </div>
        {promptKind === "listen→spell" && playPrompt && (
          <button type="button" onClick={playPrompt} className="btn-outline text-xs">
            再听一次
          </button>
        )}
      </div>

      <h3 className="mt-2 font-display text-2xl text-ink dark:text-night-text">
        {promptKind === "listen→spell" ? "请拼写听到的单词" : word.meaning}
      </h3>
      <p className="text-sm text-ink-mute dark:text-night-text/60">
        {promptKind === "listen→spell"
          ? "提示：先点击右侧按钮听一次"
          : `词性 ${word.partOfSpeech} · 共 ${word.word.length} 个字母`}
      </p>

      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        disabled={revealed || submitted}
        placeholder="在此输入英文单词…"
        className={clsx(
          "mt-5 w-full field text-lg font-display",
          submitted && correct && "ring-2 ring-moss/40 border-moss",
          submitted && !correct && "ring-2 ring-wine/40 border-wine",
        )}
        aria-label="英文拼写输入"
      />

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-sm text-ink-mute dark:text-night-text/60">
          {submitted && (
            <span className="inline-flex items-center gap-1">
              {correct ? (
                <>
                  <CheckCircle2 size={16} className="text-moss" /> 正确
                </>
              ) : (
                <>
                  <XCircle size={16} className="text-wine" /> 正确拼写：
                  <span className="font-display text-ink dark:text-night-text">{word.word}</span>
                </>
              )}
            </span>
          )}
        </span>
        <button type="button" onClick={submit} className="btn-primary" disabled={submitted || revealed || !value.trim()}>
          提交
        </button>
      </div>
    </div>
  );
}
