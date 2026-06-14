import { useMemo } from "react";
import { needsReview, useVocabStore } from "@/store/vocabStore";
import type { Word, WordProgress } from "@/types";

interface QueueItem {
  word: Word;
  progress: WordProgress;
  reason: "new" | "due" | "lapse";
}

export function useTodayQueue(): QueueItem[] {
  const words = useVocabStore((s) => s.words);
  const progressMap = useVocabStore((s) => s.progressMap);
  const [newRatio, oldRatio] = useVocabStore((s) => s.settings.newOldRatio);

  return useMemo(() => {
    const now = Date.now();
    const newWords: Word[] = [];
    const due: Word[] = [];
    const lapse: Word[] = [];

    for (const w of words) {
      const p = progressMap[w.id];
      if (!p) {
        newWords.push(w);
        continue;
      }
      if (needsReview(p, now)) due.push(w);
      if (p.lapses >= 2) lapse.push(w);
    }

    // Shuffle helpers
    const shuffled = <T,>(arr: T[]) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const total = Math.min(
      newWords.length + due.length + lapse.length,
      60,
    );
    const newTarget = Math.round((newRatio / (newRatio + oldRatio)) * total);
    const dueTarget = total - newTarget;

    const newPart = shuffled(newWords).slice(0, newTarget);
    const duePart = shuffled(due).slice(0, dueTarget);
    // lapse up to 20%
    const lapseCap = Math.max(0, Math.round(total * 0.2));
    const lapsePart = shuffled(lapse).slice(0, lapseCap);

    const merge: QueueItem[] = [
      ...newPart.map<QueueItem>((word) => ({
        word,
        progress:
          progressMap[word.id] ??
          ({
            wordId: word.id,
            initialDifficulty: "medium",
            status: "stranger",
            reps: 0,
            lapses: 0,
            easeFactor: 2.5,
            intervalDays: 0,
            lastReviewedAt: now,
            nextReviewAt: now,
            history: [],
          } as WordProgress),
        reason: "new",
      })),
      ...duePart.map<QueueItem>((word) => ({
        word,
        progress: progressMap[word.id] as WordProgress,
        reason: "due",
      })),
      ...lapsePart.map<QueueItem>((word) => ({
        word,
        progress: progressMap[word.id] as WordProgress,
        reason: "lapse",
      })),
    ];

    // interleave
    return shuffled(merge);
  }, [words, progressMap, newRatio, oldRatio]);
}

export function useStats() {
  const dailyStats = useVocabStore((s) => s.dailyStats);
  const words = useVocabStore((s) => s.words);
  const progressMap = useVocabStore((s) => s.progressMap);

  const totals = useMemo(() => {
    const learned = words.filter((w) => progressMap[w.id]).length;
    const reviewed = dailyStats.reduce((acc, s) => acc + s.reviewed, 0);
    const correct = dailyStats.reduce((acc, s) => acc + s.correct, 0);
    const wrong = dailyStats.reduce((acc, s) => acc + s.wrong, 0);
    return { learned, reviewed, correct, wrong };
  }, [dailyStats, words, progressMap]);

  return { dailyStats, totals };
}
