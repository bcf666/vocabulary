import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { useVocabStore } from "@/store/vocabStore";

export function Settings() {
  const settings = useVocabStore((s) => s.settings);
  const updateSettings = useVocabStore((s) => s.updateSettings);
  const resetProgress = useVocabStore((s) => s.resetProgress);

  const [dark, setDark] = useState<boolean>(settings.theme === "dark");
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark"); else root.classList.remove("dark");
    updateSettings({ theme: dark ? "dark" : "light" });
  }, [dark]);

  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal);
  const [defaultCnHidden, setDefaultCnHidden] = useState(settings.defaultCnHidden);
  const [autoSpeakFirst, setAutoSpeakFirst] = useState(settings.autoSpeakFirst);
  const [flashCardSecs, setFlashCardSecs] = useState(settings.flashCardSecs);
  const [ratioNew, setRatioNew] = useState(settings.newOldRatio[0]);
  const [ratioOld, setRatioOld] = useState(settings.newOldRatio[1]);

  const persist = () => {
    updateSettings({
      dailyGoal,
      defaultCnHidden,
      autoSpeakFirst,
      flashCardSecs,
      newOldRatio: [ratioNew, ratioOld],
    });
  };

  return (
    <div>
      <NavBar />
      <main className="container py-6 sm:py-10 max-w-3xl">
        <h1 className="font-display text-2xl text-ink dark:text-night-text">设置</h1>

        <section className="paper-card mt-6 p-5">
          <h3 className="font-display text-lg">主题 · Theme</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className={dark ? "btn-outline" : "btn-primary"} onClick={() => setDark(false)}>浅色</button>
            <button className={dark ? "btn-primary" : "btn-outline"} onClick={() => setDark(true)}>深色</button>
          </div>
        </section>

        <section className="paper-card mt-5 p-5">
          <h3 className="font-display text-lg">学习目标 · Goal</h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-ink-mute dark:text-night-text/60">每日目标（词）</span>
            <input
              type="number" min={5} max={200}
              className="field max-w-xs"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
            />
          </div>
        </section>

        <section className="paper-card mt-5 p-5">
          <h3 className="font-display text-lg">精细加工 / 双重编码</h3>
          <Toggle label="中文释义默认隐藏（精细加工）" value={defaultCnHidden} onChange={setDefaultCnHidden} />
          <Toggle label="进入 Learn/Review 题面时自动朗读英文（发音先行）" value={autoSpeakFirst} onChange={setAutoSpeakFirst} />
        </section>

        <section className="paper-card mt-5 p-5">
          <h3 className="font-display text-lg">心流 / 交错学习</h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-ink-mute dark:text-night-text/60">限时闪卡秒数</span>
            <input
              type="number" min={3} max={60}
              className="field max-w-xs"
              value={flashCardSecs}
              onChange={(e) => setFlashCardSecs(Number(e.target.value))}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-ink-mute dark:text-night-text/60">新:旧 — 新比例</label>
              <input type="number" min={1} max={20} className="field mt-1" value={ratioNew} onChange={(e) => setRatioNew(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-ink-mute dark:text-night-text/60">新:旧 — 旧比例</label>
              <input type="number" min={1} max={20} className="field mt-1" value={ratioOld} onChange={(e) => setRatioOld(Number(e.target.value))} />
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-mute dark:text-night-text/60">
            交错学习按新:旧加权混洗，易错词按 lapses 超额采样最多当日队列 20–30%。
          </p>
        </section>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button className="btn-ghost" onClick={() => {
            if (confirm("确认清空所有学习进度？")) resetProgress();
          }}>清空学习进度</button>
          <button className="btn-primary" onClick={persist}>保存设置</button>
        </div>
      </main>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="mt-3 flex items-center justify-between rounded-[10px] border border-paper-200 dark:border-white/10 px-3 py-2 cursor-pointer">
      <span className="text-[15px] text-ink dark:text-night-text">{label}</span>
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-moss" : "bg-paper-300"}`}
        aria-hidden
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white transform transition-transform ${value ? "translate-x-5" : "translate-x-1"}`} />
      </span>
      <input type="checkbox" className="sr-only" checked={value} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
