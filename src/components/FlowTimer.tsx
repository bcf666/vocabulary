import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

interface Props {
  seconds: number;
  onExpire?: () => void;
  active?: boolean;
}

export function FlowTimer({ seconds, onExpire, active = true }: Props) {
  const [remain, setRemain] = useState(seconds);

  useEffect(() => {
    setRemain(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!active) return;
    if (remain <= 0) {
      onExpire?.();
      return;
    }
    const id = window.setTimeout(() => setRemain((r) => r - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remain, active, onExpire]);

  const pct = Math.max(0, Math.min(100, (remain / seconds) * 100));

  return (
    <div className="flex items-center gap-3 text-sm text-ink-soft dark:text-night-text/80">
      <span className="inline-flex items-center gap-1.5">
        <Timer size={14} />
        <span className="font-mono tabular-nums">{remain}s</span>
      </span>
      <span className="relative block h-1.5 flex-1 overflow-hidden rounded-full bg-paper-200/80 dark:bg-white/10">
        <span
          className="absolute inset-y-0 left-0 bg-moss transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </span>
    </div>
  );
}
