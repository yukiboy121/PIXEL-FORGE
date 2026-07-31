"use client";

import { useEditorStore } from "@/lib/store";
import { generateAutoAdjustments, analyzeImageData } from "@/lib/ai/analyzer";
import { applyPreset } from "@/lib/ai/presets";
import { useState, useCallback } from "react";
import { Wand2, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const processingSteps = [
  "Reading image data",
  "Detecting subjects",
  "Analyzing lighting",
  "Mapping color palette",
  "Evaluating detail & noise",
  "Optimizing exposure",
  "Recovering shadows",
  "Balancing colors",
  "Enhancing details",
  "Finalizing corrections",
];

export default function AIAutoPanel() {
  const {
    originalImageUrl,
    analysis,
    setAnalysis,
    setAdjustments,
    setIsAnalyzing,
  } = useEditorStore();

  const [steps, setSteps] = useState<{ label: string; done: boolean }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const runAutoEdit = useCallback(async () => {
    if (!originalImageUrl) return;
    setIsProcessing(true);
    setProcessingTime(null);
    const startTime = Date.now();

    const initSteps = processingSteps.map((label) => ({ label, done: false }));
    setSteps(initSteps);

    // Simulate step-by-step progress while processing
    const stepPromise = (async () => {
      for (let i = 0; i < processingSteps.length; i++) {
        await new Promise((r) => setTimeout(r, 200 + Math.random() * 200));
        setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, done: true } : s)));
      }
    })();

    // Actual processing
    const processPromise = (async () => {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = originalImageUrl;
      });

      // Create a smaller version for analysis
      const maxDim = 800;
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.floor(img.naturalWidth * scale);
      const h = Math.floor(img.naturalHeight * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const analysisResult = analyzeImageData(imageData);
      setAnalysis(analysisResult);
      setIsAnalyzing(false);

      const autoAdj = generateAutoAdjustments(analysisResult);
      return autoAdj;
    })();

    const [, autoAdj] = await Promise.all([stepPromise, processPromise]);
    setAdjustments(autoAdj, "AI Auto Edit");
    setProcessingTime(Date.now() - startTime);
    setIsProcessing(false);
  }, [originalImageUrl, setAnalysis, setAdjustments, setIsAnalyzing]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-accent" />
        <h3 className="text-xs font-semibold">AI Auto Edit</h3>
      </div>

      <p className="text-[11px] leading-relaxed text-white/40">
        AI analyzes your image and automatically applies intelligent corrections for exposure,
        color, detail, and lighting.
      </p>

      <button
        onClick={runAutoEdit}
        disabled={isProcessing || !originalImageUrl}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="h-4 w-4" />
        {isProcessing ? "Processing..." : "Apply AI Auto Edit"}
      </button>

      <AnimatePresence>
        {steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
              {isProcessing ? "AI Processing" : "Complete"}
            </div>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition ${
                      step.done ? "bg-accent/20" : "bg-white/5"
                    }`}
                  >
                    {step.done ? (
                      <Check className="h-2.5 w-2.5 text-accent" />
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] transition ${
                      step.done ? "text-white/60" : "text-white/25"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            {processingTime !== null && (
              <div className="mt-3 border-t border-white/5 pt-3 text-[10px] text-white/30">
                Completed in {(processingTime / 1000).toFixed(1)}s
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Presets */}
      <div className="border-t border-white/5 pt-4">
        <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
          AI Presets
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "natural", label: "Natural" },
              { id: "cinematic", label: "Cinematic" },
              { id: "clean", label: "Clean" },
              { id: "portrait", label: "Portrait" },
              { id: "landscape", label: "Landscape" },
              { id: "product", label: "Product" },
              { id: "social", label: "Social" },
              { id: "night", label: "Night" },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                const adj = applyPreset(preset.id);
                setAdjustments(adj, `Preset: ${preset.label}`);
              }}
              className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] font-medium text-white/50 transition hover:border-white/10 hover:bg-white/[0.05] hover:text-white/80"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
