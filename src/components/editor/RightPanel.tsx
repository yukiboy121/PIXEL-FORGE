"use client";

import { useEditorStore } from "@/lib/store";
import AdjustmentPanel from "./AdjustmentPanel";
import AIAutoPanel from "./AIAutoPanel";
import ColorPanel from "./ColorPanel";
import LightPanel from "./LightPanel";
import DetailPanel from "./DetailPanel";
import PresetsPanel from "./PresetsPanel";
import UpscalePanel from "./UpscalePanel";
import AnalysisPanel from "./AnalysisPanel";
import HistoryPanel from "./HistoryPanel";

export default function RightPanel() {
  const { activeTool, originalImageUrl } = useEditorStore();
  const hasImage = !!originalImageUrl;

  if (!hasImage) return null;

  return (
    <div className="flex w-72 flex-col border-l border-editor-border bg-editor-surface">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTool === "adjust" && <AdjustmentPanel />}
        {activeTool === "ai-auto" && <AIAutoPanel />}
        {activeTool === "color" && <ColorPanel />}
        {activeTool === "light" && <LightPanel />}
        {activeTool === "detail" && <DetailPanel />}
        {activeTool === "presets" && <PresetsPanel />}
        {activeTool === "upscale" && <UpscalePanel />}

        <AnalysisPanel />
        <HistoryPanel />
      </div>
    </div>
  );
}
