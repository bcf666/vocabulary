import { useEffect, useRef } from "react";
import type { WordProgress } from "@/types";

interface Props {
  progress: WordProgress;
  onDone?: () => void;
}

function emitParticles(container: HTMLDivElement) {
  for (let i = 0; i < 7; i += 1) {
    const p = document.createElement("span");
    p.className =
      "absolute bottom-0 h-2 w-2 rounded-full bg-ochre/80 animate-[drift_1100ms_ease-out_forwards]";
    p.style.left = `${30 + Math.random() * 40}%`;
    p.style.animationDelay = `${i * 60}ms`;
    container.appendChild(p);
    window.setTimeout(() => p.remove(), 1400);
  }
}

export function StageReveal({ progress, onDone }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const status = progress.status;

  useEffect(() => {
    if (ref.current) emitParticles(ref.current);
    const id = window.setTimeout(() => onDone?.(), 1200);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const titleMap: Record<WordProgress["status"], { zh: string; en: string }> = {
    stranger: { zh: "初次相识", en: "Stranger" },
    acquaintance: { zh: "点头之交", en: "Acquaintance" },
    friend: { zh: "挚友", en: "Friend" },
  };
  const T = titleMap[status];

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[14px] border border-paper-200 dark:border-white/10 bg-white dark:bg-night-card px-6 py-8 text-center"
    >
      <div className="text-xs uppercase tracking-[0.22em] text-ink-mute dark:text-night-text/50">
        Stage Elevation
      </div>
      <div className="mt-1 font-display text-2xl sm:text-3xl text-ink dark:text-night-text">
        {T.zh} · <span className="text-moss">{T.en}</span>
      </div>
      <div className="mx-auto mt-4 flex max-w-sm items-center justify-between text-xs text-ink-mute dark:text-night-text/50">
        <span className={`h-2 w-2 rounded-full ${progress.status === "stranger" ? "bg-ink" : "bg-moss"}`} />
        <span className="h-px flex-1 bg-paper-200 dark:bg-white/10 mx-2" />
        <span className={`h-2 w-2 rounded-full ${progress.status === "acquaintance" ? "bg-ink" : "bg-moss"}`} />
        <span className="h-px flex-1 bg-paper-200 dark:bg-white/10 mx-2" />
        <span className={`h-2 w-2 rounded-full ${progress.status === "friend" ? "bg-ink" : "bg-moss"}`} />
      </div>
      <p className="mt-3 text-sm text-ink-soft dark:text-night-text/70">
        reps {progress.reps} · lapses {progress.lapses} · ease factor{" "}
        {progress.easeFactor.toFixed(2)}
      </p>
    </div>
  );
}
