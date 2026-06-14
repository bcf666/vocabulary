import { Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";

export function NotFound() {
  return (
    <div>
      <NavBar />
      <main className="container py-20 text-center">
        <p className="font-display text-5xl text-ink dark:text-night-text">404</p>
        <p className="mt-2 text-sm text-ink-mute dark:text-night-text/60">这条路径没有对应页面。</p>
        <div className="mt-6 inline-flex gap-2">
          <Link to="/" className="btn-primary">返回首页</Link>
          <Link to="/learn" className="btn-outline">去学新词</Link>
        </div>
      </main>
    </div>
  );
}
