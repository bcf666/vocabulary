import { clsx } from "clsx";

interface Props {
  value: number; // 0–100
  label?: string;
  sub?: string;
  className?: string;
}

export function ProgressBar({ value, label, sub, className }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={clsx("paper-card p-4 sm:p-5", className)}>
      {label && (
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-lg text-ink dark:text-night-text">{label}</h3>
          {sub && <span className="text-xs text-ink-mute dark:text-night-text/60">{sub}</span>}
        </div>
      )}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-200 dark:bg-white/10">
        <span
          className="block h-full bg-gradient-to-r from-moss to-moss/80"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-right text-xs text-ink-mute dark:text-night-text/50">{Math.round(pct)}%</div>
    </div>
  );
}
