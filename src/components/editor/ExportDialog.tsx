"use client";

import { useEditorStore } from "@/lib/store";
import { X, Download, FileImage } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useState, useRef, useEffect } from "react";
import { applyAdjustmentsToCanvas } from "@/lib/ai/processor";
import { defaultAdjustments } from "@/lib/ai/types";

function isDefaultAdj(adj: typeof defaultAdjustments): boolean {
  return Object.keys(defaultAdjustments).every(
    (key) =>
      adj[key as keyof typeof defaultAdjustments] ===
      defaultAdjustments[key as keyof typeof defaultAdjustments]
  );
}

export default function ExportDialog() {
  const {
    showExportDialog,
    setShowExportDialog,
    exportOptions,
    setExportOptions,
    originalImageUrl,
    originalWidth,
    originalHeight,
    adjustments,
    projectName,
  } = useEditorStore();

  const [isExporting, setIsExporting] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<string>("—");
  const lastEstimateRef = useRef<string>("");

  const newW = Math.round(originalWidth * exportOptions.scale);
  const newH = Math.round(originalHeight * exportOptions.scale);

  useEffect(() => {
    // Rough estimate
    const pixels = newW * newH;
    let bpp: number;
    if (exportOptions.format === "png") {
      bpp = 4;
    } else {
      bpp = 0.3 + (exportOptions.quality / 100) * 1.5;
    }
    const bytes = pixels * bpp;
    const mb = bytes / (1024 * 1024);
    const est = mb >= 1 ? `~${mb.toFixed(1)} MB` : `~${Math.round(mb * 1024)} KB`;
    if (est !== lastEstimateRef.current) {
      lastEstimateRef.current = est;
      setEstimatedSize(est);
    }
  }, [newW, newH, exportOptions.format, exportOptions.quality]);

  const handleExport = useCallback(async () => {
    if (!originalImageUrl) return;
    setIsExporting(true);

    try {
      // Load original at full resolution
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = originalImageUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      let outputCanvas: HTMLCanvasElement;
      if (!isDefaultAdj(adjustments)) {
        outputCanvas = applyAdjustmentsToCanvas(canvas, adjustments);
      } else {
        outputCanvas = canvas;
      }

      // Scale if needed
      if (exportOptions.scale !== 1) {
        const scaledCanvas = document.createElement("canvas");
        scaledCanvas.width = newW;
        scaledCanvas.height = newH;
        const sCtx = scaledCanvas.getContext("2d")!;
        sCtx.imageSmoothingEnabled = true;
        sCtx.imageSmoothingQuality = "high";
        sCtx.drawImage(outputCanvas, 0, 0, newW, newH);
        outputCanvas = scaledCanvas;
      }

      const mimeType = `image/${exportOptions.format}`;
      const quality = exportOptions.quality / 100;

      outputCanvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsExporting(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${exportOptions.filename || projectName || "image-enhanced"}.${exportOptions.format === "jpeg" ? "jpg" : exportOptions.format}`;
          a.click();
          URL.revokeObjectURL(url);
          setIsExporting(false);
          setShowExportDialog(false);
        },
        mimeType,
        quality
      );
    } catch {
      setIsExporting(false);
    }
  }, [originalImageUrl, adjustments, exportOptions, newW, newH, projectName, setShowExportDialog]);

  if (!showExportDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowExportDialog(false)}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-editor-panel p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileImage className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold">Export Image</h2>
          </div>
          <button
            onClick={() => setShowExportDialog(false)}
            className="rounded-lg p-1 text-white/30 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Format */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
              Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["jpeg", "png", "webp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportOptions({ format: fmt })}
                  className={`rounded-lg border py-2 text-sm font-medium uppercase transition ${
                    exportOptions.format === fmt
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          {exportOptions.format !== "png" && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
                  Quality
                </label>
                <span className="text-[11px] font-mono text-white/40">{exportOptions.quality}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={exportOptions.quality}
                onChange={(e) => setExportOptions({ quality: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="mt-1 flex justify-between text-[9px] text-white/20">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
                <span>Max</span>
              </div>
            </div>
          )}

          {/* Resolution */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
              Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Original", value: 1 },
                { label: "2×", value: 2 },
                { label: "4×", value: 4 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setExportOptions({ scale: opt.value })}
                  className={`rounded-lg border py-2 text-sm font-medium transition ${
                    exportOptions.scale === opt.value
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-[11px] font-mono text-white/30">
              {newW} × {newH}
            </p>
          </div>

          {/* Filename */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
              Filename
            </label>
            <input
              type="text"
              value={exportOptions.filename}
              onChange={(e) => setExportOptions({ filename: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 outline-none transition focus:border-accent/50"
            />
          </div>

          {/* Info */}
          <div className="rounded-lg bg-white/[0.03] px-4 py-3 text-center">
            <span className="text-[11px] text-white/30">Estimated size: </span>
            <span className="text-[11px] font-medium text-white/50">{estimatedSize}</span>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-black transition hover:bg-accent-hover disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Image"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
