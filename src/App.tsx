import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Dashboard } from "@/pages/Dashboard";
import { Learn } from "@/pages/Learn";
import { Review } from "@/pages/Review";
import { Output } from "@/pages/Output";
import { Article } from "@/pages/Article";
import { Boss } from "@/pages/Boss";
import { Stats } from "@/pages/Stats";
import { Library } from "@/pages/Library";
import { Settings } from "@/pages/Settings";
import { NotFound } from "@/pages/NotFound";
import { hydrateDefaultCorpus, useVocabStore } from "@/store/vocabStore";

export default function App() {
  // apply theme class on mount
  const theme = useVocabStore((s) => s.settings.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // once, only if words empty, load bundled built-in demo corpus is replaced by JSON import tool
  useEffect(() => {
    // If user hasn't imported any words, provide a hint by leaving it empty.
    // Demo corpus can be loaded from /library "载入示例" button.
    void hydrateDefaultCorpus;
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/review" element={<Review />} />
      <Route path="/output" element={<Output />} />
      <Route path="/article" element={<Article />} />
      <Route path="/boss" element={<Boss />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/library" element={<Library />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
