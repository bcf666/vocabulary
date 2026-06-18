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
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    updateSettings({ theme: dark ? "dark" : "light" });
  }, [dark, updateSettings]);

  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal);
  const [ratioNew, setRatioNew] = useState(settings.newOldRatio[0]);
  const [ratioOld, setRatioOld] = useState(settings.newOldRatio[1]);
  const [defaultCnHidden, setDefaultCnHidden] = useState(settings.defaultCnHidden);

  const persist = () => {
    updateSettings({
      dailyGoal,
      defaultCnHidden,
      newOldRatio: [ratioNew, ratioOld],
    });
  };

  return (
    <div>
      <NavBar />
      <main className="container py-6 sm:py-10 max-w-3xl">
        <h1 className="font-display text-2xl text-ink dark:text-night-text">设置</h1>
        <p className="mt-1 text-sm text-ink-mute dark:text-night-text/60">
          保留最常用的 4 项：主题、每日目标、新/旧比、默认中文隐藏。
        </p>

        <section className="paper-card mt-6 p-5">
          <h3 className="font-display text-lg">主题 · Theme</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className={dark ? "btn-outline" : "btn-primary"} onClick={() => setDark(false)}>浅色</button>
            <button className={dark ? "btn-primary" : "btn-outline"} onClick={() => setDark(true)}>深色</button>
          </div>
        </section>

        <section className="paper-card mt-5 p-5">
          <h3 className="font-display text-lg">每日目标 · Goal</h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-ink-mute dark:text-night-text/60">每日学习 + 复习的目标数</span>
            <input
              type="number"
              min={5}
              max={500}
              className="field max-w-xs"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
            />
          </div>
        </section>

        <section className="paper-card mt-5 p-5">
          <h3 className="font-display text-lg">新 / 旧比例</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-ink-mute dark:text-night-text/60">新单词权重</label>
              <input
                type="number"
                min={1}
                max={20}
                className="field mt-1"
                value={ratioNew}
                onChange={(e) => setRatioNew(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm text-ink-mute dark:text-night-text/60">复习词权重</label>
              <input
                type="number"
                min={1}
                max={20}
                className="field mt-1"
                value={ratioOld}
                onChange={(e) => setRatioOld(Number(e.target.value))}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-mute dark:text-night-text/60">
            当前比例为 新:{ratioNew} / 旧:{ratioOld}。值越大，该类别在复习队列中出现频率越高。
          </p>
        </section>

        <section className="paper-card mt-5 p-5">
          <h3 className="font-display text-lg">默认中文隐藏</h3>
          <label className="mt-3 flex items-center justify-between rounded-[10px] border border-paper-200 dark:border-white/10 px-3 py-3 cursor-pointer">
            <span className="text-[15px] text-ink dark:text-night-text">
              学新词/复习时默认隐藏中文（强制先进行英英→词根→猜测的流程）
            </span>
            <span
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${defaultCnHidden ? "bg-moss" : "bg-paper-300"}`}
              aria-hidden
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white transform transition-transform ${defaultCnHidden ? "translate-x-5" : "translate-x-1"}`}
              />
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={defaultCnHidden}
              onChange={(e) => setDefaultCnHidden(e.target.checked)}
            />
          </label>
        </section>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            className="btn-ghost"
            onClick={() => {
              if (confirm("确认清空所有学习进度？此操作不可撤销。")) resetProgress();
            }}
          >
            清空学习进度
          </button>
          <button className="btn-primary" onClick={persist}>保存设置</button>
        </div>
      </main>
    </div>
  );
}
