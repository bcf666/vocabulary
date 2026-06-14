import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  title?: string;
  hint?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title = "还没有数据",
  hint,
  actionLabel = "去导入词库",
  actionHref = "/library",
}: Props) {
  return (
    <div className="paper-card flex flex-col items-center justify-center py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-paper-200/70 dark:bg-white/10 text-moss">
        <BookOpen size={22} />
      </span>
      <h3 className="mt-3 font-display text-lg text-ink dark:text-night-text">{title}</h3>
      {hint && <p className="mt-1 text-sm text-ink-mute dark:text-night-text/60 max-w-md">{hint}</p>}
      {actionHref && (
        <Link to={actionHref} className="btn-primary mt-4 inline-flex">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
