import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  DailyStat,
  QuestionMode,
  ReviewKind,
  UserSettings,
  Word,
  WordProgress,
} from "@/types";
import { applyScore, initProgress, needsReview } from "@/algorithm/scheduler";

interface VocabState {
  words: Word[];
  progressMap: Record<string, WordProgress>;
  settings: UserSettings;
  dailyStats: DailyStat[];
  importWords: (words: Word[]) => void;
  ensureProgress: (wordId: string, difficulty?: WordProgress["initialDifficulty"]) => void;
  setDoodle: (wordId: string, dataUrl: string | undefined) => void;
  setUserSentence: (wordId: string, sentence: string) => void;
  markScore: (
    wordId: string,
    score: 0 | 1 | 2 | 3 | 4 | 5,
    mode: QuestionMode,
    opts?: { jol?: boolean; responseMs?: number },
  ) => void;
  recordSession: (kind: ReviewKind, minutes?: number) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  resetProgress: () => void;
}

const STORAGE_KEY = "vocab-store-v1";

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const defaultSettings: UserSettings = {
  dailyGoal: 20,
  theme: "light",
  defaultCnHidden: true,
  autoSpeakFirst: true,
  flashCardSecs: 4,
  newOldRatio: [3, 7],
  activeLibraryTag: "全部",
};

export const useVocabStore = create<VocabState>()(
  persist(
    (set, get) => ({
      words: [],
      progressMap: {},
      settings: defaultSettings,
      dailyStats: [],

      importWords: (words) => {
        const existingIds = new Set(get().words.map((w) => w.id));
        const merged = [
          ...get().words,
          ...words.filter((w) => !existingIds.has(w.id)),
        ];
        set({ words: merged });
      },

      ensureProgress: (wordId, difficulty) => {
        const { progressMap } = get();
        if (progressMap[wordId]) return;
        set({
          progressMap: {
            ...progressMap,
            [wordId]: initProgress(wordId, difficulty),
          },
        });
        get().recordSession("learn");
      },

      setDoodle: (wordId, dataUrl) => {
        const words = get().words.map((w) =>
          w.id === wordId ? { ...w, userDoodleUrl: dataUrl } : w,
        );
        set({ words });
      },

      setUserSentence: (wordId, sentence) => {
        const words = get().words.map((w) => {
          if (w.id !== wordId) return w;
          const arr = [...(w.userSentences ?? [])];
          if (!arr.includes(sentence)) arr.push(sentence);
          return { ...w, userSentences: arr };
        });
        set({ words });
      },

      markScore: (wordId, score, mode, opts = {}) => {
        const { progressMap } = get();
        const base = progressMap[wordId] ?? initProgress(wordId, "medium");
        const next = applyScore(base, score, mode, opts.jol ?? false, opts.responseMs ?? 0);
        set({
          progressMap: {
            ...progressMap,
            [wordId]: {
              ...base,
              status: next.status,
              reps: next.reps,
              lapses: next.lapses,
              easeFactor: next.easeFactor,
              intervalDays: next.intervalDays,
              lastReviewedAt: Date.now(),
              nextReviewAt: next.nextReviewAt,
              history: next.history,
            },
          },
        });
        get().recordSession(score >= 3 ? "correct" : "wrong");
      },

      recordSession: (kind, minutes = 0) => {
        const date = todayKey();
        const stats = get().dailyStats;
        let today = stats.find((s) => s.date === date);
        if (!today) {
          today = {
            date,
            learned: 0,
            reviewed: 0,
            correct: 0,
            wrong: 0,
            focusMinutes: 0,
          };
        }
        const updated: DailyStat = {
          ...today,
          learned: today.learned + (kind === "learn" ? 1 : 0),
          reviewed: today.reviewed + (kind === "learn" ? 0 : 1),
          correct: today.correct + (kind === "correct" ? 1 : 0),
          wrong: today.wrong + (kind === "wrong" ? 1 : 0),
          focusMinutes: today.focusMinutes + minutes,
        };
        const rest = stats.filter((s) => s.date !== date);
        set({ dailyStats: [...rest, updated].slice(-90) });
      },

      updateSettings: (patch) => {
        set({ settings: { ...get().settings, ...patch } });
      },

      resetProgress: () => {
        set({ progressMap: {}, dailyStats: [] });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            return window.localStorage.getItem(name);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            window.localStorage.setItem(name, value);
          } catch {
            /* ignore quota */
          }
        },
        removeItem: (name) => {
          try {
            window.localStorage.removeItem(name);
          } catch {
            /* ignore */
          }
        },
      })),
      partialize: (state) => ({
        words: state.words,
        progressMap: state.progressMap,
        settings: state.settings,
        dailyStats: state.dailyStats,
      }),
    },
  ),
);

/** Hydrate words.json as initial corpus on first load. Should be called once. */
export function hydrateDefaultCorpus(words: Word[]): void {
  const store = useVocabStore.getState();
  if (store.words.length === 0) {
    store.importWords(words);
  }
}

export function getAllTags(words: Word[]): string[] {
  const set = new Set<string>();
  words.forEach((w) => w.tags?.forEach((t) => set.add(t)));
  return ["全部", ...Array.from(set).sort()];
}

export function pickReviewModesForWord(_word: Word): QuestionMode[] {
  // Keep deterministic mode pool; Review page rotates randomly.
  return ["en→cn", "cn→spell", "listen→spell", "cloze", "speak"];
}

export { needsReview };
