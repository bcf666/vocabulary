import { useCallback, useEffect, useRef, useState } from "react";

type Rate = number; // 0.75–1.25 approximate; we don't use real ASR.

export function useSpeech() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(
    (text: string, opts?: { lang?: string; rate?: Rate; onEnd?: () => void }) => {
      if (!supported || !text.trim()) {
        opts?.onEnd?.();
        return;
      }
      try {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = opts?.lang ?? "en-US";
        utter.rate = opts?.rate ?? 0.95;
        utter.onstart = () => setSpeaking(true);
        utter.onend = () => {
          setSpeaking(false);
          opts?.onEnd?.();
        };
        utter.onerror = () => {
          setSpeaking(false);
          opts?.onEnd?.();
        };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      } catch {
        opts?.onEnd?.();
      }
    },
    [supported],
  );

  return { speak, speaking, supported };
}

/**
 * 跟读自评：浏览器录音需 MediaRecorder + getUserMedia，
 * 本处为"仅前端、不使用真实 ASR"的评分机制：
 *   - 用 Web Speech API 朗读 target 并计时（供参考）；
 *   - 用户可在 UI 中滑动打分条给出自评 1–5；
 * 如需真实 ASR，可替换为 Whisper / 云 API。
 */
export function useSelfRateRecorder(timeLimitSecs = 20) {
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [rate, setRate] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream);
      chunksRef.current = [];
      media.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      media.onstop = () => {
        const url = URL.createObjectURL(
          new Blob(chunksRef.current, { type: "audio/webm" }),
        );
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = media;
      setRecording(true);
      setError(null);
      media.start();
      window.setTimeout(() => {
        if (mediaRef.current && mediaRef.current.state !== "inactive") {
          mediaRef.current.stop();
          setRecording(false);
        }
      }, timeLimitSecs * 1000);
    } catch (err) {
      setError("无法访问麦克风");
      setRecording(false);
    }
  }, [timeLimitSecs]);

  const stop = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
      setRecording(false);
    }
  }, []);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  return { start, stop, recording, audioUrl, rate, setRate, error };
}
