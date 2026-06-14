import { NavBar } from "@/components/NavBar";
import { StatChart } from "@/components/StatChart";
import { useStats } from "@/hooks/useTodayQueue";
import { useVocabStore } from "@/store/vocabStore";

export function Stats() {
  const { dailyStats, totals } = useStats();
  const words = useVocabStore((s) => s.words);

  return (
    <div>
      <NavBar />
      <main className="container py-6 sm:py-10">
        <header>
          <h1 className="font-display text-2xl text-ink dark:text-night-text">统计 · 个人记忆曲线</h1>
          <p className="text-sm text-ink-mute dark:text-night-text/60">
            每日学习 / 复习次数、正确率，以及个人记忆曲线折线（近 14 天）。
          </p>
        </header>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Metric title="累计学习" value={totals.learned} hint="进入间隔队列的词数" />
          <Metric title="累计复习" value={totals.reviewed} hint="所有复习题次数" />
          <Metric title="累计正确" value={totals.correct} hint={`正确率 ${pct(totals.correct, totals.correct + totals.wrong)}%`} />
          <Metric title="累计错误" value={totals.wrong} hint="用于 lapses / Boss 战" />
        </div>

        <div className="mt-6">
          <StatChart stats={dailyStats} days={14} />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section className="paper-card p-5">
            <h2 className="font-display text-lg text-ink dark:text-night-text">每日明细（最近 14 天）</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-[520px] w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-mute dark:text-night-text/60">
                    <th className="py-2 pr-4">日期</th>
                    <th className="py-2 pr-4">新学</th>
                    <th className="py-2 pr-4">复习</th>
                    <th className="py-2 pr-4">正确</th>
                    <th className="py-2 pr-4">错误</th>
                    <th className="py-2 pr-4">正确率</th>
                  </tr>
                </thead>
                <tbody>
                  {[...dailyStats]
                    .sort((a, b) => (a.date < b.date ? 1 : -1))
                    .slice(0, 14)
                    .map((d) => (
                      <tr key={d.date} className="border-t border-paper-200 dark:border-white/10">
                        <td className="py-2 pr-4 font-mono text-ink dark:text-night-text">{d.date}</td>
                        <td className="py-2 pr-4">{d.learned}</td>
                        <td className="py-2 pr-4">{d.reviewed}</td>
                        <td className="py-2 pr-4 text-moss">{d.correct}</td>
                        <td className="py-2 pr-4 text-wine">{d.wrong}</td>
                        <td className="py-2 pr-4">{pct(d.correct, d.correct + d.wrong)}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {dailyStats.length === 0 && <p className="mt-2 text-sm text-ink-mute dark:text-night-text/60">还没有学习记录。</p>}
            </div>
          </section>

          <section className="paper-card p-5">
            <h2 className="font-display text-lg text-ink dark:text-night-text">总体</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Row k="词库规模" v={String(words.length)} />
              <Row k="记录天数" v={String(dailyStats.length)} />
              <Row k="累计正确" v={String(totals.correct)} />
              <Row k="累计错误" v={String(totals.wrong)} />
            </dl>
            <p className="mt-4 text-xs text-ink-mute dark:text-night-text/60">
              所有数据保存在浏览器 localStorage 中。清空浏览器缓存/本页缓存会导致数据丢失。
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function Metric({ title, value, hint }: { title: string; value: number; hint?: string }) {
  return (
    <div className="paper-card p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-ink-mute dark:text-night-text/60">{title}</p>
      <p className="mt-2 font-display text-3xl text-ink dark:text-night-text">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-mute dark:text-night-text/60">{hint}</p>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-[10px] border border-paper-200/80 dark:border-white/10 px-3 py-2 flex items-center justify-between">
      <dt className="text-ink-mute dark:text-night-text/60">{k}</dt>
      <dd className="font-mono text-ink dark:text-night-text">{v}</dd>
    </div>
  );
}

function pct(a: number, b: number) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}
