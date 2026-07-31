"use client";

import { useEditorStore } from "@/lib/store";
import SliderControl from "./SliderControl";
import { Palette, Sparkles, RotateCcw } from "lucide-react";
import { defaultAdjustments, type Adjustments } from "@/lib/ai/types";
import { useCallback } from "react";

const colorSliders: { key: keyof Adjustments; label: string; min: number; max: number }[] = [
  { key: "temperature", label: "Temperature", min: -100, max: 100 },
  { key: "tint", label: "Tint", min: -100, max: 100 },
  { key: "saturation", label: "Saturation", min: -100, max: 100 },
  { key: "vibrance", label: "Vibrance", min: -100, max: 100 },
];

const rgbSliders: { key: keyof Adjustments; label: string; min: number; max: number }[] = [
  { key: "redBalance", label: "Red", min: -100, max: 100 },
  { key: "greenBalance", label: "Green", min: -100, max: 100 },
  { key: "blueBalance", label: "Blue", min: -100, max: 100 },
];

export default function ColorPanel() {
  const { adjustments, setAdjustment, setAdjustments, pushHistory, analysis } = useEditorStore();

  const handleAutoBalance = useCallback(() => {
    if (!analysis) return;
    const newAdj = { ...adjustments };
    // Auto-correct based on analysis
    if (analysis.whiteBalance.value > 60) {
      newAdj.temperature = -Math.min(25, (analysis.whiteBalance.value - 50) * 1);
    } else if (analysis.whiteBalance.value < 40) {
      newAdj.temperature = Math.min(25, (50 - analysis.whiteBalance.value) * 1);
    }
    if (analysis.saturation.value < 25) {
      newAdj.vibrance = 15;
      newAdj.saturation = 8;
    } else if (analysis.saturation.value > 70) {
      newAdj.saturation = -15;
    }
    setAdjustments(newAdj, "AI Color Balance");
  }, [analysis, adjustments, setAdjustments]);

  const resetColor = useCallback(() => {
    const newAdj = { ...adjustments };
    colorSliders.forEach((s) => {
      newAdj[s.key] = defaultAdjustments[s.key];
    });
    rgbSliders.forEach((s) => {
      newAdj[s.key] = defaultAdjustments[s.key];
    });
    setAdjustments(newAdj, "Reset Color");
  }, [adjustments, setAdjustments]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-accent" />
        <h3 className="text-xs font-semibold">Color Balance</h3>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAutoBalance}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent/10 px-3 py-2 text-[11px] font-semibold text-accent transition hover:bg-accent/20"
        >
          <Sparkles className="h-3 w-3" />
          AI Balance
        </button>
        <button
          onClick={resetColor}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[11px] text-white/50 transition hover:bg-white/5"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <div className="space-y-3">
        {colorSliders.map((c) => (
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

      <div className="border-t border-white/5 pt-4">
        <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
          RGB Channels
        </h4>
        <div className="space-y-3">
          {rgbSliders.map((c) => (
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
    </div>
  );
}
