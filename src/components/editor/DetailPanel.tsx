"use client";

import { useEditorStore } from "@/lib/store";
import SliderControl from "./SliderControl";
import { Focus, RotateCcw } from "lucide-react";
import { defaultAdjustments, type Adjustments } from "@/lib/ai/types";
import { useCallback } from "react";

const detailSliders: { key: keyof Adjustments; label: string; min: number; max: number }[] = [
  { key: "sharpness", label: "Sharpness", min: 0, max: 100 },
  { key: "noiseReduction", label: "Noise Reduction", min: 0, max: 100 },
  { key: "texture", label: "Texture", min: -100, max: 100 },
  { key: "clarity", label: "Clarity", min: -100, max: 100 },
];

export default function DetailPanel() {
  const { adjustments, setAdjustment, setAdjustments, pushHistory } = useEditorStore();

  const resetDetail = useCallback(() => {
    const newAdj = { ...adjustments };
    detailSliders.forEach((s) => {
      newAdj[s.key] = defaultAdjustments[s.key];
    });
    setAdjustments(newAdj, "Reset Detail");
  }, [adjustments, setAdjustments]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Focus className="h-4 w-4 text-accent" />
          <h3 className="text-xs font-semibold">Detail Enhancement</h3>
        </div>
        <button
          onClick={resetDetail}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-white/40 transition hover:bg-white/5 hover:text-white/70"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <div className="space-y-3">
        {detailSliders.map((c) => (
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

      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
        <p className="text-[10px] leading-relaxed text-white/30">
          <strong className="text-white/40">Tip:</strong> Use sharpness sparingly to avoid artifacts.
          Noise reduction works best on shadow areas and is intelligently blended.
        </p>
      </div>
    </div>
  );
}
