"use client";

import { useEditorStore, type EditorTool } from "@/lib/store";
import {
  Sliders, Wand2, Palette, Sun, Focus, Layers, ZoomIn,
} from "lucide-react";

const tools: { id: EditorTool; icon: typeof Sliders; label: string }[] = [
  { id: "adjust", icon: Sliders, label: "Adjust" },
  { id: "ai-auto", icon: Wand2, label: "AI Auto" },
  { id: "color", icon: Palette, label: "Color" },
  { id: "light", icon: Sun, label: "Light" },
  { id: "detail", icon: Focus, label: "Detail" },
  { id: "presets", icon: Layers, label: "Presets" },
  { id: "upscale", icon: ZoomIn, label: "Upscale" },
];

export default function ToolSidebar() {
  const { activeTool, setActiveTool, originalImageUrl } = useEditorStore();
  const hasImage = !!originalImageUrl;

  return (
    <div className="flex w-16 flex-col items-center border-r border-editor-border bg-editor-surface py-3">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => hasImage && setActiveTool(tool.id)}
          disabled={!hasImage}
          className={`mb-1 flex w-12 flex-col items-center gap-1 rounded-lg py-2 transition ${
            activeTool === tool.id && hasImage
              ? "bg-editor-active text-accent"
              : hasImage
              ? "text-white/30 hover:bg-editor-hover hover:text-white/60"
              : "text-white/10 cursor-not-allowed"
          }`}
        >
          <tool.icon className="h-4 w-4" />
          <span className="text-[9px] font-medium">{tool.label}</span>
        </button>
      ))}
    </div>
  );
}
