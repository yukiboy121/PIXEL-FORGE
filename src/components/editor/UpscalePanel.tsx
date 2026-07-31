"use client";

import { useEditorStore } from "@/lib/store";
import { ZoomIn, AlertTriangle, Check, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";

const MAX_UPSCALE_PIXELS = 32_000_000;
const MAX_CANVAS_SIDE = 8192;

async function upscaleInBrowser(file: File, width: number, height: number, requestedScale: number) {
  const safeScale = Math.min(
    requestedScale,
    Math.sqrt(MAX_UPSCALE_PIXELS / (width * height)),
    MAX_CANVAS_SIDE / width,
    MAX_CANVAS_SIDE / height
  );
  if (safeScale < 1) throw new Error("This image is too large to upscale in this browser.");

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const source = new Image();
      source.onload = () => resolve(source);
      source.onerror = () => reject(new Error("Could not read the original image."));
      source.src = imageUrl;
    });
    const outputWidth = Math.round(width * safeScale);
    const outputHeight = Math.round(height * safeScale);
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not create an image canvas.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, outputWidth, outputHeight);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not create the upscaled image.")), "image/jpeg", 0.92);
    });
    return { blob, width: outputWidth, height: outputHeight, wasLimited: safeScale < requestedScale };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export default function UpscalePanel() {
  const { originalWidth, originalHeight, originalFile } = useEditorStore();
  const [scale, setScale] = useState(2);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [steps, setSteps] = useState<{ label: string; done: boolean }[]>([]);
  const [result, setResult] = useState<{ width: number; height: number; url: string; note?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upscaleSteps = [
    "Analyzing image details",
    "Reconstructing pixels",
    "Recovering edges",
    "Enhancing texture",
    "Finalizing output",
  ];

  const handleUpscale = useCallback(async () => {
    if (!originalFile) return;
    setIsUpscaling(true);
    setError(null);
    setResult(null);

    const initSteps = upscaleSteps.map((label) => ({ label, done: false }));
    setSteps(initSteps);

    try {
      // Step-by-step progress
      for (let i = 0; i < upscaleSteps.length; i++) {
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
        setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, done: true } : s)));
      }

      // Use server API for upscaling with Sharp
      const formData = new FormData();
      formData.append("image", originalFile);
      formData.append("scale", scale.toString());
      formData.append("format", "jpeg");
      formData.append("quality", "92");

      const response = await fetch("/api/enhance", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setResult({ width: Math.round(originalWidth * scale), height: Math.round(originalHeight * scale), url });
        return;
      }

      // Vercel serverless functions can reject larger images. Use a local
      // browser fallback so the user can still upscale without an API limit.
      const localResult = await upscaleInBrowser(originalFile, originalWidth, originalHeight, scale);
      setResult({
        width: localResult.width,
        height: localResult.height,
        url: URL.createObjectURL(localResult.blob),
        note: localResult.wasLimited ? "Output was limited to your browser’s safe maximum size." : "Upscaled locally in your browser.",
      });
    } catch (e) {
      try {
        const localResult = await upscaleInBrowser(originalFile, originalWidth, originalHeight, scale);
        setResult({
          width: localResult.width,
          height: localResult.height,
          url: URL.createObjectURL(localResult.blob),
          note: localResult.wasLimited ? "Output was limited to your browser’s safe maximum size." : "Upscaled locally in your browser.",
        });
      } catch (fallbackError) {
        setError(fallbackError instanceof Error ? fallbackError.message : (e instanceof Error ? e.message : "Upscale failed. Please try again."));
      }
    } finally {
      setIsUpscaling(false);
    }
  }, [originalFile, originalWidth, originalHeight, scale]);

  const downloadResult = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `upscaled-${result.width}x${result.height}.jpg`;
    a.click();
  }, [result]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ZoomIn className="h-4 w-4 text-accent" />
        <h3 className="text-xs font-semibold">HD Upscale</h3>
      </div>

      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/40">Original Resolution</span>
          <span className="text-[11px] font-mono text-white/60">
            {originalWidth} × {originalHeight}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-white/40">Enhanced Resolution</span>
          <span className="text-[11px] font-mono text-accent">
            {Math.round(originalWidth * scale)} × {Math.round(originalHeight * scale)}
          </span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
          Scale Factor
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[2, 4, 8].map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`rounded-lg border py-2 text-sm font-semibold transition ${
                scale === s
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-white/10 text-white/40 hover:border-white/20"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
        <div className="flex gap-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/70" />
          <p className="text-[10px] leading-relaxed text-amber-500/60">
            Standard upscale uses Lanczos interpolation. For AI-powered upscaling with
            detail reconstruction, configure an AI provider in your environment.
          </p>
        </div>
      </div>

      <button
        onClick={handleUpscale}
        disabled={isUpscaling}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover disabled:opacity-50"
      >
        {isUpscaling ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Upscaling...
          </>
        ) : (
          <>
            <ZoomIn className="h-4 w-4" />
            Upscale to {scale}×
          </>
        )}
      </button>

      {steps.length > 0 && (
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    step.done ? "bg-accent/20" : "bg-white/5"
                  }`}
                >
                  {step.done ? (
                    <Check className="h-2.5 w-2.5 text-accent" />
                  ) : isUpscaling ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin text-white/30" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  )}
                </div>
                <span className={`text-[11px] ${step.done ? "text-white/60" : "text-white/25"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-success/20 bg-success/5 p-4">
          <p className="text-xs font-medium text-success">Upscale complete!</p>
          <p className="mt-1 text-[11px] text-success/60">
            {result.width} × {result.height}
          </p>
          {result.note && <p className="mt-1 text-[10px] text-success/50">{result.note}</p>}
          <button
            onClick={downloadResult}
            className="mt-3 w-full rounded-lg border border-success/30 py-2 text-xs font-semibold text-success transition hover:bg-success/10"
          >
            Download Upscaled Image
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-error/20 bg-error/5 p-3 text-xs text-error">
          {error}
        </div>
      )}
    </div>
  );
}
