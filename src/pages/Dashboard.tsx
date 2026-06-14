import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, Target, TrendingUp, Brain, Trophy } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { ProgressBar } from "@/components/ProgressBar";
import { useVocabStore } from "@/store/vocabStore";
import { useStats } from "@/hooks/useTodayQueue";
import { needsReview } from "@/algorithm/scheduler";

export function Dashboard() {
  const words = useVocabStore((s) => s.words);
  const progressMap = useVocabStore((s) => s.progressMap);
  const dailyGoal = useVocabStore((s) => s.settings.dailyGoal);
  const dailyStats = useVocabStore((s) => s.dailyStats);
  const { totals } = useStats();

  const todayStat = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return dailyStats.find((d) => d.date === key) ?? {
      date: key,
      learned: 0,
      reviewed: 0,
      correct: 0,
      wrong: 0,
      focusMinutes: 0,
    };
  }, [dailyStats]);

  const dueCount = useMemo(
    () =>
      words.filter((w) => {
        const p = progressMap[w.id];
        return p && needsReview(p);
      }).length,
    [words, progressMap],
  );

  const streak = useMemo(() => {
    let n = 0;
    const sorted = [...dailyStats].sort((a, b) => (a.date < b.date ? 1 : -1));
    const today = new Date();
    for (let i = 0; i < sorted.length; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const s = sorted.find((x) => x.date === key);
      if (s && (s.learned > 0 || s.reviewed > 0)) {
        n += 1;
      } else {
        break;
      }
    }
    return n;
  }, [dailyStats]);

  const learnedPct = words.length === 0 ? 0 : Math.round((totals.learned / words.length) * 100);
  const goalPct = dailyGoal === 0 ? 0 : Math.round(((todayStat.learned + todayStat.reviewed) / dailyGoal) * 100);

  // Apply html theme
  useEffect(() => {
    // theme may be toggled in settings; managed globally via <App>.
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <NavBar />

      <main className="container py-6 sm:py-10">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
          <StatTile
            Icon={Target}
            title="今日目标"
            value={`${todayStat.learned + todayStat.reviewed} / ${dailyGoal}`}
            hint={`新学 ${todayStat.learned} · 复习 ${todayStat.reviewed}`}
            accent="moss"
            to="/learn"
          />
          <StatTile
            Icon={Trophy}
            title="连击（天）"
            value={String(streak)}
            hint="每日有学习即加 1 天"
            accent="ochre"
          />
          <StatTile
            Icon={Brain}
            title="待复习"
            value={String(dueCount)}
            hint={`已记录进度 ${Object.keys(progressMap).length}`}
            accent="wine"
            to="/review"
          />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            <ProgressBar label="今日进度" value={goalPct} sub="目标 / 已学" />
            <ProgressBar label="词库已学" value={learnedPct} sub={`${totals.learned} / ${words.length}`} />

            <section className="paper-card p-5">
              <h2 className="font-display text-lg text-ink dark:text-night-text">
                学习循环 · Learning Loop
              </h2>
              <ul className="mt-3 space-y-2 text-[15px] text-ink-soft dark:text-night-text/80">
                <li>① 进入 <Link to="/learn" className="text-moss underline">学新词</Link>：听发音 → 英英 → 词根 → 中文揭示 → 涂鸦 → JOL</li>
                <li>② 进入 <Link to="/review" className="text-moss underline">复习</Link>：5 种模态自动交错 + 限时</li>
                <li>③ 完成一组后去 <Link to="/output" className="text-moss underline">输出</Link>：造句 / 词块装配</li>
                <li>④ <Link to="/article" className="text-moss underline">粘贴文章</Link> 自动提取生词并绑定原句</li>
              </ul>
            </section>

            <section className="paper-card p-5">
              <h2 className="font-display text-lg text-ink dark:text-night-text">数据一览</h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <Row k="内置词数" v={String(words.length)} />
                <Row k="有进度词数" v={String(Object.keys(progressMap).length)} />
                <Row k="累计正确" v={String(totals.correct)} />
                <Row k="累计错误" v={String(totals.wrong)} />
                <Row k="今日正确率" v={`${percent(todayStat.correct, todayStat.correct + todayStat.wrong)}%`} />
                <Row k="待复习数" v={String(dueCount)} />
              </dl>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="paper-card p-5">
              <h2 className="font-display text-lg text-ink dark:text-night-text flex items-center gap-2">
                <TrendingUp size={18} className="text-moss" /> 快速入口
              </h2>
              <div className="mt-3 grid gap-2">
                <Link to="/learn" className="btn-primary justify-between">
                  <span className="inline-flex items-center gap-2"><Brain size={16} />学新词</span>
                  <Sparkles size={14} />
                </Link>
                <Link to="/review" className="btn-outline justify-between">
                  <span className="inline-flex items-center gap-2"><BookOpen size={16} />复习（5 模态）</span>
                  <span className="font-mono text-xs">{dueCount}</span>
                </Link>
                <Link to="/output" className="btn-outline justify-between">
                  <span className="inline-flex items-center gap-2"><Sparkles size={16} />输出闭环</span>
                  <span className="text-xs text-ink-mute">造句 / 词块</span>
                </Link>
                <Link to="/article" className="btn-outline justify-between">
                  <span className="inline-flex items-center gap-2"><BookOpen size={16} />导入语料</span>
                  <span className="text-xs text-ink-mute">提取生词</span>
                </Link>
                <Link to="/boss" className="btn-outline justify-between">
                  <span className="inline-flex items-center gap-2"><Trophy size={16} />弱点 Boss 战</span>
                  <span className="text-xs text-ink-mute">lapses 高</span>
                </Link>
                <Link to="/stats" className="btn-ghost justify-between">
                  <span>统计与曲线</span><span className="text-xs text-ink-mute">/stats</span>
                </Link>
              </div>
            </section>

            <section className="paper-card p-5">
              <h3 className="font-display text-lg text-ink dark:text-night-text">九条规律 → 功能映射</h3>
              <p className="mt-1 text-xs text-ink-mute dark:text-night-text/60">
                每一条记忆规律都有具体代码实现，而非抽象玄学。
              </p>
              <ul className="mt-3 grid gap-2 text-[14px] text-ink-soft dark:text-night-text/80">
                <li>① 间隔重复 → <code className="chip">algorithm/scheduler.ts</code></li>
                <li>② 测试效应 → 默认问题态；5 模态题目</li>
                <li>③ 精细加工 → DeepCard：英英→词根→中文揭示</li>
                <li>④ 双重编码 → 发音先行；用户涂鸦 / 配图</li>
                <li>⑤ 生成效应 → /output 造句 / 词块装配</li>
                <li>⑥ 情境编码 → /article 原句绑定 + 例句</li>
                <li>⑦ 交错学习 → 新:旧 加权混洗；5 模态交替</li>
                <li>⑧ 元认知 → JOL 预估；lapses；Boss 战</li>
                <li>⑨ 心流与专注 → FlowTimer 限时 + 连击 + 阶段动画</li>
              </ul>
            </section>
          </aside>
        </div>

        <footer className="mt-10 pb-6 text-center text-xs text-ink-mute dark:text-night-text/50">
          Mémoire · React + Zustand + Tailwind · 数据保存在本地 localStorage
        </footer>
      </main>
    </div>
  );
}

function StatTile({
  Icon,
  title,
  value,
  hint,
  accent,
  to,
}: {
  Icon: typeof Sparkles;
  title: string;
  value: string;
  hint?: string;
  accent: "moss" | "wine" | "ochre";
  to?: string;
}) {
  const Content = (
    <div className="paper-card relative overflow-hidden p-5 h-full">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 ${accent === "moss" ? "bg-moss" : accent === "wine" ? "bg-wine" : "bg-ochre"}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-mute dark:text-night-text/60">{title}</p>
          <p className="mt-2 font-display text-3xl text-ink dark:text-night-text">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-mute dark:text-night-text/60">{hint}</p>}
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-[10px] ${accent === "moss" ? "bg-moss/10 text-moss" : accent === "wine" ? "bg-wine/10 text-wine" : "bg-ochre/10 text-ochre"}`}>
          <Icon size={18} />
        </span>
      </div>
    </div>
  );
  return to ? <Link to={to} className="block h-full">{Content}</Link> : Content;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-[10px] border border-paper-200/80 dark:border-white/10 px-3 py-2 flex items-center justify-between">
      <dt className="text-ink-mute dark:text-night-text/60">{k}</dt>
      <dd className="font-mono text-ink dark:text-night-text">{v}</dd>
    </div>
  );
}

function percent(a: number, b: number) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}
