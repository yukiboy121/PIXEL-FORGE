"use client";

import { useEditorStore } from "@/lib/store";
import SliderControl from "./SliderControl";
import { RotateCcw } from "lucide-react";
import type { Adjustments } from "@/lib/ai/types";

const basicControls: { key: keyof Adjustments; label: string; min: number; max: number }[] = [
  { key: "exposure", label: "Exposure", min: -100, max: 100 },
  { key: "contrast", label: "Contrast", min: -100, max: 100 },
  { key: "highlights", label: "Highlights", min: -100, max: 100 },
  { key: "shadows", label: "Shadows", min: -100, max: 100 },
  { key: "whites", label: "Whites", min: -100, max: 100 },
  { key: "blacks", label: "Blacks", min: -100, max: 100 },
];

const colorControls: { key: keyof Adjustments; label: string; min: number; max: number }[] = [
  { key: "temperature", label: "Temperature", min: -100, max: 100 },
  { key: "tint", label: "Tint", min: -100, max: 100 },
  { key: "saturation", label: "Saturation", min: -100, max: 100 },
  { key: "vibrance", label: "Vibrance", min: -100, max: 100 },
];

const detailControls: { key: keyof Adjustments; label: string; min: number; max: number }[] = [
  { key: "texture", label: "Texture", min: -100, max: 100 },
  { key: "clarity", label: "Clarity", min: -100, max: 100 },
  { key: "sharpness", label: "Sharpness", min: 0, max: 100 },
  { key: "noiseReduction", label: "Noise Reduction", min: 0, max: 100 },
];

const effectControls: { key: keyof Adjustments; label: string; min: number; max: number }[] = [
  { key: "fade", label: "Fade", min: 0, max: 100 },
  { key: "vignette", label: "Vignette", min: 0, max: 100 },
  { key: "grain", label: "Grain", min: 0, max: 100 },
];

export default function AdjustmentPanel() {
  const { adjustments, setAdjustment, resetAdjustments, pushHistory } = useEditorStore();

  const renderGroup = (
    title: string,
    controls: { key: keyof Adjustments; label: string; min: number; max: number }[]
  ) => (
    <div className="mb-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">{title}</h4>
      </div>
      <div className="space-y-3">
        {controls.map((c) => (
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

  return (
    <div className="space-y-1">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold">Adjustments</h3>
        <button
          onClick={resetAdjustments}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-white/40 transition hover:bg-white/5 hover:text-white/70"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
      {renderGroup("Light", basicControls)}
      {renderGroup("Color", colorControls)}
      {renderGroup("Detail", detailControls)}
      {renderGroup("Effects", effectControls)}
    </div>
  );
}
