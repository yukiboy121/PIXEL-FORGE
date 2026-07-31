"use client";

import { useEditorStore } from "@/lib/store";
import SliderControl from "./SliderControl";
import { Sun, Sparkles, RotateCcw } from "lucide-react";
import { defaultAdjustments, type Adjustments } from "@/lib/ai/types";
import { useCallback } from "react";

const lightSliders: { key: keyof Adjustments; label: string; min: number; max: number }[] = [
  { key: "exposure", label: "Exposure", min: -100, max: 100 },
  { key: "contrast", label: "Contrast", min: -100, max: 100 },
  { key: "highlights", label: "Highlights", min: -100, max: 100 },
  { key: "shadows", label: "Shadows", min: -100, max: 100 },
  { key: "whites", label: "Whites", min: -100, max: 100 },
  { key: "blacks", label: "Blacks", min: -100, max: 100 },
];

export default function LightPanel() {
  const { adjustments, setAdjustment, setAdjustments, pushHistory, analysis } = useEditorStore();

  const handleAutoLight = useCallback(() => {
    if (!analysis) return;
    const newAdj = { ...adjustments };
    if (analysis.exposure.value < 35) {
      newAdj.exposure = Math.min(30, (50 - analysis.exposure.value) * 0.6);
    } else if (analysis.exposure.value > 70) {
      newAdj.exposure = Math.max(-25, (50 - analysis.exposure.value) * 0.5);
    }
    if (analysis.highlights.value > 5) {
      newAdj.highlights = -Math.min(30, analysis.highlights.value * 2);
    }
    if (analysis.shadows.value > 10) {
      newAdj.shadows = Math.min(30, analysis.shadows.value * 1.5);
    }
    if (analysis.contrast.value < 30) {
      newAdj.contrast = 15;
    }
    setAdjustments(newAdj, "AI Lighting Correction");
  }, [analysis, adjustments, setAdjustments]);

  const resetLight = useCallback(() => {
    const newAdj = { ...adjustments };
    lightSliders.forEach((s) => {
      newAdj[s.key] = defaultAdjustments[s.key];
    });
    setAdjustments(newAdj, "Reset Lighting");
  }, [adjustments, setAdjustments]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 text-accent" />
        <h3 className="text-xs font-semibold">AI Lighting</h3>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAutoLight}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent/10 px-3 py-2 text-[11px] font-semibold text-accent transition hover:bg-accent/20"
        >
          <Sparkles className="h-3 w-3" />
          AI Light Fix
        </button>
        <button
          onClick={resetLight}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[11px] text-white/50 transition hover:bg-white/5"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <div className="space-y-3">
        {lightSliders.map((c) => (
          <SliderControl
            key={c.key}
            label={c.label}
            value={adjustments[c.key]}
            min={c.min}
            max={c.max}
            onChange={(v) => setAdjustment(c.key, v)}
            onChangeEnd={() => pushHistory(c.label)}
          />
        ))}
      </div>
    </div>
  );
}
