export type QuestionMode =
  | "en→cn"
  | "cn→spell"
  | "listen→spell"
  | "cloze"
  | "speak";

export interface RootPart {
  root: string;
  meaning: string;
  relatedWords?: string[];
}

export interface Word {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  meaning: string;
  enDef: string;
  synonyms?: string[];
  roots?: RootPart[];
  example: string;
  exampleCn?: string;
  sourceSentences?: string[];
  tags?: string[];
  imageDataUrl?: string;
  userDoodleUrl?: string;
  userSentences?: string[];
}

export interface ReviewEvent {
  at: number;
  mode: QuestionMode;
  score: 0 | 1 | 2 | 3 | 4 | 5;
  jol: boolean;
  responseMs: number;
}

export interface WordProgress {
  wordId: string;
  initialDifficulty: "easy" | "medium" | "hard";
  status: "stranger" | "acquaintance" | "friend";
  reps: number;
  lapses: number;
  easeFactor: number;
  intervalDays: number;
  lastReviewedAt: number;
  nextReviewAt: number;
  history: ReviewEvent[];
}

export interface UserSettings {
  dailyGoal: number;
  theme: "light" | "dark";
  defaultCnHidden: boolean;
  autoSpeakFirst: boolean;
  flashCardSecs: number;
  newOldRatio: [number, number];
  activeLibraryTag: string;
}

export interface DailyStat {
  date: string;
  learned: number;
  reviewed: number;
  correct: number;
  wrong: number;
  focusMinutes: number;
}

export type ReviewKind = "learn" | "review" | "wrong" | "correct";

export interface SchedulerResult {
  status: WordProgress["status"];
  reps: number;
  lapses: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: number;
}
