import { useEffect, useRef, useState } from "react";
import { Eraser, Download, Pencil } from "lucide-react";

interface Props {
  value?: string;
  onChange?: (dataUrl: string | undefined) => void;
  width?: number;
  height?: number;
}

export function DoodlePad({ value, onChange, width = 520, height = 220 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#2F4F4F");
  const [, force] = useState(0);

  // Hydrate initial value
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#F4EFE3";
    ctx.fillRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        force((v) => v + 1);
      };
      img.src = value;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastRef.current = getPos(e);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !lastRef.current) return;
    const p = getPos(e);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
  };

  const onUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastRef.current = null;
    const dataUrl = canvasRef.current?.toDataURL("image/png", 0.8);
    onChange?.(dataUrl);
  };

  const clear = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#F4EFE3";
    ctx.fillRect(0, 0, width, height);
    onChange?.(undefined);
  };

  const download = () => {
    const url = canvasRef.current?.toDataURL("image/png", 0.9);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `doodle-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="rounded-[14px] border border-paper-200 dark:border-white/10 bg-white dark:bg-night-card shadow-paper p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2 text-sm text-ink-soft dark:text-night-text/80">
          <Pencil size={16} /> 涂鸦助记（生成效应）
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="画笔颜色"
            className="h-8 w-8 cursor-pointer rounded-md border border-paper-200 dark:border-white/10 bg-transparent"
          />
          <button type="button" onClick={clear} className="btn-outline text-xs">
            <Eraser size={14} /> 清空
          </button>
          <button type="button" onClick={download} className="btn-outline text-xs">
            <Download size={14} /> 下载
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className="w-full rounded-[10px] border border-paper-200/80 dark:border-white/10 touch-none cursor-crosshair"
        style={{ aspectRatio: `${width} / ${height}` }}
      />
    </div>
  );
}
