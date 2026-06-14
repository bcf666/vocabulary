import { useMemo } from "react";
import { Check, Brain } from "lucide-react";
import { clsx } from "clsx";

interface EstimateProps {
  value: "easy" | "medium" | "hard";
  onChange: (value: "easy" | "medium" | "hard") => void;
  label?: string;
}

const LABELS = {
  easy: { zh: "简单", en: "Easy", color: "text-moss", bg: "bg-moss/10", border: "border-moss/40" },
  medium: { zh: "中等", en: "Medium", color: "text-ochre", bg: "bg-ochre/10", border: "border-ochre/40" },
  hard: { zh: "困难", en: "Hard", color: "text-wine", bg: "bg-wine/10", border: "border-wine/40" },
} as const;

export function JOLRate({ value, onChange, label }: EstimateProps) {
  const current = LABELS[value];
  const keys = Object.keys(LABELS) as Array<keyof typeof LABELS>;

  return (
    <div className="paper-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-ink-soft dark:text-night-text/80">
          <Brain size={16} /> {label ?? "预估难度（JOL）"}
        </div>
        <span className="text-xs text-ink-mute dark:text-night-text/50">
          当前：
          <span className={clsx("font-display ml-1", current.color)}>
            {current.zh} · {current.en}
          </span>
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {keys.map((k) => {
          const L = LABELS[k];
          const active = value === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChange(k)}
              className={clsx(
                "rounded-[10px] border p-3 text-left transition-colors",
                "hover:shadow-paper",
                active ? `${L.border} ${L.bg}` : "border-paper-200 dark:border-white/10 bg-white dark:bg-night-card",
              )}
              aria-pressed={active}
            >
              <div className="flex items-center justify-between">
                <span className={clsx("font-display text-base text-ink dark:text-night-text")}>
                  {L.zh}
                </span>
                {active ? <Check size={16} className={L.color} /> : <span className="text-xs text-ink-mute dark:text-night-text/50">{L.en}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** "学习后判断是否掌握" 打分条 */
export function MasterySlider({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-paper-200 dark:border-white/10 px-3 py-2 text-sm text-ink-soft dark:text-night-text/80">
      <span>复习后判断：我掌握了吗？</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={clsx(
          "inline-flex items-center gap-1 rounded-full px-3 py-1.5",
          value ? "bg-moss text-white" : "bg-paper-200 dark:bg-white/10 text-ink",
        )}
      >
        <Check size={14} /> {value ? "已掌握" : "尚需再练"}
      </button>
    </div>
  );
}

export function useRandomJOLSeed() {
  return useMemo(() => Math.random().toString(36).slice(2, 8), []);
}
