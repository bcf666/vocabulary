import { useEffect, useState } from "react";
import { Mic, MicOff, Play, Pause } from "lucide-react";
import { clsx } from "clsx";
import { useSelfRateRecorder, useSpeech } from "@/hooks/useSpeech";
import type { Word } from "@/types";

interface Props {
  word: Word;
  onAnswer: (correct: boolean) => void;
  revealed: boolean;
}

export function SpeakAndRate({ word, onAnswer, revealed }: Props) {
  const { speak } = useSpeech();
  const { start, stop, recording, audioUrl, rate, setRate } = useSelfRateRecorder(20);
  const [playing, setPlaying] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!revealed && submitted) onAnswer(rate >= 3);
  }, [revealed, submitted, rate, onAnswer]);

  const audioRef = (() => {
    if (!audioUrl) return null;
    return (
      <audio
        src={audioUrl}
        onPlay={() => setPlaying(true)}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
      />
    );
  })();

  return (
    <div className="paper-card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.18em] text-ink-mute dark:text-night-text/50">
          跟读并自评（speak + self rate，非 ASR）
        </div>
        <span className="chip">目标：{word.word}</span>
      </div>

      <p className="mt-3 text-[17px] leading-relaxed text-ink dark:text-night-text">
        {word.example}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className="btn-outline text-sm" onClick={() => speak(word.example)}>
          <Play size={14} /> 先听示例
        </button>
        {!recording ? (
          <button type="button" className="btn-primary text-sm" onClick={start}>
            <Mic size={14} /> 点此跟读（最多 20 秒）
          </button>
        ) : (
          <button type="button" className="btn-primary text-sm" onClick={stop}>
            <MicOff size={14} /> 停止录音
          </button>
        )}
        {audioUrl && audioRef && (
          <button
            type="button"
            className="btn-outline text-sm"
            onClick={() => {
              const el = document.querySelector<HTMLAudioElement>("audio");
              if (!el) return;
              if (el.paused) el.play().catch(() => undefined);
              else el.pause();
            }}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "暂停回放" : "回放录音"}
          </button>
        )}
        {/* hidden audio element */}
        <span className="hidden">{audioRef}</span>
      </div>

      <div className="mt-5">
        <label className="text-sm text-ink-soft dark:text-night-text/80 flex items-center justify-between">
          <span>自评（1–5，体现发音、重读、连读完成度）</span>
          <span className="font-display text-moss">{rate} / 5</span>
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="mt-2 w-full accent-moss"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="btn-primary"
          disabled={!audioUrl || submitted}
          onClick={() => setSubmitted(true)}
        >
          提交，作为一次<span className={clsx(rate >= 3 ? "text-moss" : "text-wine")}>{rate >= 3 ? "掌握" : "需再练"}</span>
        </button>
      </div>
    </div>
  );
}
