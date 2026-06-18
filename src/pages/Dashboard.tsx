import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, Target, TrendingUp, Brain, Trophy, PlayCircle, BookMarked, Layers } from "lucide-react";
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

  const learnedCount = Object.keys(progressMap).length;
  const newCount = Math.max(0, words.length - learnedCount);

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

  useEffect(() => {
    // theme is managed globally via <App>
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <NavBar />

      <main className="container py-6 sm:py-10">
        {/* 顶部：大号 CTA —— 开始今日复习 */}
        <section className="paper-card relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-moss/10 blur-2xl" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-ink-mute dark:text-night-text/60">今日目标 · Today</p>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl text-ink dark:text-night-text">
                {dueCount > 0 ? `有 ${dueCount} 个单词等你复习` : words.length === 0 ? "欢迎使用 —— 先载入词库" : "暂无到期单词，继续加油！"}
              </h1>
              <p className="mt-2 text-sm text-ink-mute dark:text-night-text/60">
                今日已学 <span className="font-display text-ink dark:text-night-text">{todayStat.learned + todayStat.reviewed}</span> / {dailyGoal} · 连击 <span className="font-display text-ink dark:text-night-text">{streak}</span> 天
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {dueCount > 0 && (
                <Link to="/review" className="btn-primary text-base px-5 py-3">
                  <PlayCircle size={18} />
                  开始今日复习
                </Link>
              )}
              {newCount > 0 && (
                <Link to="/learn" className="btn-outline text-base px-5 py-3">
                  <Brain size={18} />
                  学新词（{newCount}）
                </Link>
              )}
              {words.length === 0 && (
                <Link to="/library" className="btn-primary text-base px-5 py-3">
                  <BookMarked size={18} />
                  去词库一键载入
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* 第二行：三个快捷入口 —— 待复习 / 已学 / 未学 */}
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Link to="/review" className="paper-card group relative overflow-hidden p-5 block transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-mute dark:text-night-text/60">待复习</p>
                <p className="mt-2 font-display text-4xl text-wine">{dueCount}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-wine/10 text-wine">
                <Target size={18} />
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-mute dark:text-night-text/60 group-hover:text-ink-soft dark:group-hover:text-night-text/80">点击进入复习 →</p>
          </Link>

          <Link to="/library" className="paper-card group relative overflow-hidden p-5 block transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-mute dark:text-night-text/60">已学</p>
                <p className="mt-2 font-display text-4xl text-moss">{learnedCount}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-moss/10 text-moss">
                <Trophy size={18} />
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-mute dark:text-night-text/60 group-hover:text-ink-soft dark:group-hover:text-night-text/80">点击查看词库 →</p>
          </Link>

          <Link to="/learn" className="paper-card group relative overflow-hidden p-5 block transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-mute dark:text-night-text/60">未学</p>
                <p className="mt-2 font-display text-4xl text-ochre">{newCount}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-ochre/10 text-ochre">
                <Layers size={18} />
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-mute dark:text-night-text/60 group-hover:text-ink-soft dark:group-hover:text-night-text/80">点击学新词 →</p>
          </Link>
        </div>

        {/* 进度条 */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ProgressBar label="今日进度" value={goalPct} sub={`${todayStat.learned + todayStat.reviewed} / ${dailyGoal}`} />
          <ProgressBar label="词库已学" value={learnedPct} sub={`${learnedCount} / ${words.length}`} />
        </div>

        {/* 学习循环提示 + 数据一览 */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section className="paper-card p-5">
            <h2 className="font-display text-lg text-ink dark:text-night-text">推荐流程</h2>
            <ul className="mt-3 space-y-2 text-[15px] text-ink-soft dark:text-night-text/80">
              <li>① <Link to="/review" className="text-moss underline">先复习</Link>：把到期的单词再过一遍（可跳过精细编码）</li>
              <li>② <Link to="/learn" className="text-moss underline">学新词</Link>：每日少量，坚持胜过激进</li>
              <li>③ <Link to="/output" className="text-moss underline">输出闭环</Link>：造句 / 词块装配，巩固记忆</li>
              <li>④ <Link to="/stats" className="text-moss underline">查看曲线</Link>：看长期学习趋势</li>
            </ul>
          </section>

          <aside className="space-y-4">
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
                  <span className="inline-flex items-center gap-2"><BookOpen size={16} />复习</span>
                  <span className="font-mono text-xs">{dueCount}</span>
                </Link>
                <Link to="/output" className="btn-outline justify-between">
                  <span className="inline-flex items-center gap-2"><Sparkles size={16} />输出闭环</span>
                  <span className="text-xs text-ink-mute">造句 / 词块</span>
                </Link>
                <Link to="/library" className="btn-outline justify-between">
                  <span className="inline-flex items-center gap-2"><BookMarked size={16} />词库管理</span>
                  <span className="text-xs text-ink-mute">{words.length} 词</span>
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
          </aside>
        </div>

        <footer className="mt-10 pb-6 text-center text-xs text-ink-mute dark:text-night-text/50">
          Mémoire · React + Zustand + Tailwind · 数据保存在本地 localStorage
        </footer>
      </main>
    </div>
  );
}
