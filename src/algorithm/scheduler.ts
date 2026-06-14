import type {
  SchedulerResult,
  WordProgress,
  ReviewEvent,
  QuestionMode,
} from "@/types";

const DAY_MS = 86_400_000;

export function initProgress(
  wordId: string,
  difficulty: WordProgress["initialDifficulty"] = "medium",
): WordProgress {
  const now = Date.now();
  return {
    wordId,
    initialDifficulty: difficulty,
    status: "stranger",
    reps: 0,
    lapses: 0,
    easeFactor: difficulty === "hard" ? 2.1 : difficulty === "easy" ? 2.9 : 2.5,
    intervalDays: 0,
    lastReviewedAt: now,
    nextReviewAt: now + DAY_MS,
    history: [],
  };
}

/**
 * SM-2 简化版：score 0–5 决定 intervalDays 与 easeFactor；
 * 答错（score ≤ 2）时 intervalDays 重置为 1 并 lapses += 1；
 * 答对时 intervalDays 指数扩展；
 * status 跃迁依据 reps 与 lapses。
 */
export function applyScore(
  prev: WordProgress,
  score: 0 | 1 | 2 | 3 | 4 | 5,
  mode: QuestionMode,
  jol = false,
  responseMs = 0,
): SchedulerResult & { history: ReviewEvent[] } {
  const correct = score >= 3;
  const quality = score;
  let ef = prev.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;

  let intervalDays: number;
  let reps = prev.reps + (correct ? 1 : 0);
  let lapses = prev.lapses + (correct ? 0 : 1);

  if (!correct) {
    intervalDays = 1;
  } else if (prev.reps === 0) {
    intervalDays = 1;
  } else if (prev.reps === 1) {
    intervalDays = 3;
  } else {
    intervalDays = Math.max(1, Math.round(prev.intervalDays * ef));
  }

  let status: WordProgress["status"] = prev.status;
  if (lapses >= 3) status = "stranger";
  else if (reps >= 6 && lapses === 0) status = "friend";
  else if (reps >= 2) status = "acquaintance";
  else status = "stranger";

  const event: ReviewEvent = {
    at: Date.now(),
    mode,
    score,
    jol,
    responseMs,
  };
  const history = [...prev.history, event].slice(-200);

  return {
    status,
    reps,
    lapses,
    easeFactor: Number(ef.toFixed(3)),
    intervalDays,
    nextReviewAt: Date.now() + intervalDays * DAY_MS,
    history,
  };
}

export function needsReview(progress: WordProgress, now = Date.now()): boolean {
  return now >= progress.nextReviewAt;
}

export function daysUntilReview(progress: WordProgress, now = Date.now()): number {
  const diff = progress.nextReviewAt - now;
  return Math.max(0, Math.ceil(diff / DAY_MS));
}
