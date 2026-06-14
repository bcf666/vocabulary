import { useMemo } from "react";
import type { DailyStat } from "@/types";

interface Props {
  stats: DailyStat[];
  days?: number;
}

export function StatChart({ stats, days = 14 }: Props) {
  const width = 720;
  const barH = 110;
  const lineH = 90;
  const pad = 24;
  const gap = 6;

  const data = useMemo(() => {
    const arr: DailyStat[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`;
      const s = stats.find((x) => x.date === key);
      arr.push(s ?? { date: key, learned: 0, reviewed: 0, correct: 0, wrong: 0, focusMinutes: 0 });
    }
    return arr;
  }, [stats, days]);

  const max = Math.max(1, ...data.map((d) => d.learned + d.reviewed));
  const barWidth = (width - pad * 2 - gap * (data.length - 1)) / data.length;

  const curvePoints = useMemo(() => {
    const maxCorrect = Math.max(1, ...data.map((d) => d.correct + d.wrong));
    return data.map((d, i) => {
      const x = pad + i * (barWidth + gap) + barWidth / 2;
      const total = d.correct + d.wrong || 1;
      const y = lineH - pad - (d.correct / maxCorrect) * (lineH - pad * 2);
      void total;
      return { x, y };
    });
  }, [data, barWidth]);

  const path = curvePoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <div className="paper-card p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-ink dark:text-night-text">近 {days} 天</h3>
          <p className="text-xs text-ink-mute dark:text-night-text/60">
            学新词（绿）· 复习（赭）· 正确率曲线
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-ink-soft dark:text-night-text/70">
          <Legend color="#2F4F4F" label="新词" />
          <Legend color="#D4A017" label="复习" />
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-[2px] w-4 bg-wine" /> 正确率曲线
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${barH + lineH + 18}`}
          aria-label="学习统计"
          className="min-w-[560px] w-full"
          role="img"
        >
          {/* bars */}
          {data.map((d, i) => {
            const learnedH = (d.learned / max) * (barH - pad);
            const reviewedH = (d.reviewed / max) * (barH - pad);
            const x = pad + i * (barWidth + gap);
            const yBase = barH - 4;
            return (
              <g key={d.date}>
                <rect
                  x={x}
                  y={yBase - reviewedH}
                  width={barWidth * 0.45}
                  height={reviewedH}
                  fill="#D4A017"
                  opacity={0.7}
                  rx={3}
                />
                <rect
                  x={x + barWidth * 0.5}
                  y={yBase - learnedH}
                  width={barWidth * 0.45}
                  height={learnedH}
                  fill="#2F4F4F"
                  rx={3}
                />
                {(i === 0 || (i + 1) % 2 === 0) && (
                  <text
                    x={x + barWidth / 2}
                    y={barH + 14}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#6B6A62"
                  >
                    {d.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}

          {/* curve */}
          <g transform={`translate(0, ${barH + 18})`}>
            <rect x={0} y={0} width={width} height={lineH} fill="transparent" />
            <path d={path} fill="none" stroke="#8B2635" strokeWidth={2} />
            {curvePoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#8B2635" />
            ))}
            <text x={pad} y={14} fontSize={10} fill="#6B6A62">
              （个人记忆曲线：正确题数趋势）
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
      {label}
    </span>
  );
}
