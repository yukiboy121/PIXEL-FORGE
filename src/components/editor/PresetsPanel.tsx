"use client";

import { useEditorStore } from "@/lib/store";
import { Layers } from "lucide-react";
import { applyPreset } from "@/lib/ai/presets";
import type { PresetName } from "@/lib/ai/types";

const presetList: { id: PresetName; label: string; desc: string }[] = [
  { id: "natural", label: "Natural", desc: "Balanced and true-to-life" },
  { id: "cinematic", label: "Cinematic", desc: "Film-like contrast and mood" },
  { id: "clean", label: "Clean", desc: "Bright and noise-free" },
  { id: "portrait", label: "Portrait", desc: "Optimized for skin tones" },
  { id: "landscape", label: "Landscape", desc: "Vivid nature enhancement" },
  { id: "product", label: "Product", desc: "Sharp and commercial" },
  { id: "social", label: "Social Media", desc: "Eye-catching for feeds" },
  { id: "night", label: "Night", desc: "Low-light recovery" },
  { id: "lowlight", label: "Low Light", desc: "Shadow and noise fix" },
  { id: "oldphoto", label: "Old Photo", desc: "Restore vintage images" },
];

export default function PresetsPanel() {
  const { setAdjustments } = useEditorStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-accent" />
        <h3 className="text-xs font-semibold">Smart Presets</h3>
      </div>

      <p className="text-[11px] leading-relaxed text-white/40">
        Each preset applies a curated processing pipeline optimized for different scenarios.
      </p>

      <div className="space-y-2">
        {presetList.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              const adj = applyPreset(preset.id);
              setAdjustments(adj, `Preset: ${preset.label}`);
            }}
            className="group flex w-full items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left transition hover:border-white/10 hover:bg-white/[0.05]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[10px] font-bold text-white/20 group-hover:bg-accent/10 group-hover:text-accent">
              {preset.label.charAt(0)}
            </div>
            <div>
              <div className="text-[11px] font-medium text-white/70 group-hover:text-white">
                {preset.label}
              </div>
              <div className="text-[10px] text-white/30">{preset.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
