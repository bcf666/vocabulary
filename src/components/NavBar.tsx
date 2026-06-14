import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Brain, Sparkles, BarChart3, Settings, Home } from "lucide-react";
import { clsx } from "clsx";

const NAV = [
  { to: "/", label: "首页", Icon: Home },
  { to: "/learn", label: "学新词", Icon: Brain },
  { to: "/review", label: "复习", Icon: BookOpen },
  { to: "/output", label: "输出", Icon: Sparkles },
  { to: "/article", label: "语料", Icon: BookOpen },
  { to: "/boss", label: "弱点", Icon: Sparkles },
  { to: "/stats", label: "统计", Icon: BarChart3 },
  { to: "/settings", label: "设置", Icon: Settings },
] as const;

export function NavBar({ libraryLabel = "词库" }: { libraryLabel?: string }) {
  const nav = useNavigate();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 border-b border-paper-200 dark:border-white/10 bg-paper/80 dark:bg-night/80 backdrop-blur">
      <div className="container flex items-center justify-between gap-4 py-3">
        <button
          type="button"
          onClick={() => nav("/")}
          className="group flex items-center gap-2 text-left"
        >
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-moss text-white shadow-sm">
            <BookOpen size={18} aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base text-ink dark:text-night-text">
              Mémoire
            </span>
            <span className="block text-xs text-ink-mute dark:text-night-text/60">
              间隔 · 提取 · 精细编码
            </span>
          </span>
        </button>

        <nav
          className={clsx(
            "hidden md:flex items-center gap-1 rounded-full border border-paper-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-1.5 py-1",
          )}
          aria-label="主导航"
        >
          {NAV.map(({ to, label, Icon }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <button
                key={to}
                onClick={() => nav(to)}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-moss text-white shadow-sm"
                    : "text-ink-soft dark:text-night-text/70 hover:bg-paper-200/60 dark:hover:bg-white/10",
                )}
              >
                <Icon size={14} aria-hidden />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="md:hidden flex items-center gap-1 overflow-x-auto">
          {NAV.slice(0, 5).map(({ to, label, Icon }) => {
            const active = pathname === to;
            return (
              <button
                key={to}
                onClick={() => nav(to)}
                className={clsx(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs",
                  active
                    ? "bg-moss text-white"
                    : "text-ink-soft dark:text-night-text/70 border border-paper-200 dark:border-white/10",
                )}
              >
                <Icon size={12} aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
