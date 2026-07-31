"use client";

import { useEditorStore } from "@/lib/store";
import {
  Sliders, Wand2, Palette, Download, Eye, Upload, Sparkles,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import EditorCanvas from "./EditorCanvas";
import AdjustmentPanel from "./AdjustmentPanel";
import AIAutoPanel from "./AIAutoPanel";
import ColorPanel from "./ColorPanel";
import ExportDialog from "./ExportDialog";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type MobileTab = "tools" | "ai" | "color" | "compare" | "export";

export default function MobileEditor() {
  const {
    originalImageUrl,
    setOriginalImage,
    setShowExportDialog,
    setIsComparing,
    isComparing,
  } = useEditorStore();
  const hasImage = !!originalImageUrl;
  const [activeTab, setActiveTab] = useState<MobileTab>("tools");
  const [showPanel, setShowPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => setOriginalImage(url, file, img.naturalWidth, img.naturalHeight);
      img.src = url;
    },
    [setOriginalImage]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex h-12 items-center justify-between border-b border-editor-border bg-editor-surface px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent">
            <Sparkles className="h-3 w-3 text-black" />
          </div>
          <span className="text-xs font-bold">PIXELFORGE</span>
        </div>
        {hasImage && (
          <button
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-[11px] font-semibold text-black"
          >
            <Download className="h-3 w-3" />
            Export
          </button>
        )}
      </div>

      {/* Canvas area */}
      <div className="flex-1 relative overflow-hidden">
        {hasImage ? (
          <EditorCanvas />
        ) : (
          <div className="flex h-full items-center justify-center px-6">
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) processFile(f);
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-white/10 p-8"
              >
                <Upload className="h-8 w-8 text-white/30" />
                <span className="text-sm text-white/50">Tap to upload image</span>
                <span className="text-xs text-white/20">JPEG, PNG, WebP</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tool panel overlay */}
      {showPanel && hasImage && (
        <div className="max-h-[50vh] overflow-y-auto border-t border-editor-border bg-editor-surface p-4">
          {activeTab === "tools" && <AdjustmentPanel />}
          {activeTab === "ai" && <AIAutoPanel />}
          {activeTab === "color" && <ColorPanel />}
        </div>
      )}

      {/* Bottom nav */}
      {hasImage && (
        <div className="flex border-t border-editor-border bg-editor-surface">
          {(
            [
              { id: "tools" as MobileTab, icon: Sliders, label: "Adjust" },
              { id: "ai" as MobileTab, icon: Wand2, label: "AI" },
              { id: "color" as MobileTab, icon: Palette, label: "Color" },
              { id: "compare" as MobileTab, icon: Eye, label: "Compare" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "compare") {
                  setIsComparing(!isComparing);
                } else {
                  setActiveTab(tab.id);
                  setShowPanel(activeTab === tab.id ? !showPanel : true);
                }
              }}
              className={`flex flex-1 flex-col items-center gap-1 py-3 transition ${
                (tab.id === "compare" && isComparing) || (activeTab === tab.id && showPanel && tab.id !== "compare")
                  ? "text-accent"
                  : "text-white/30"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      <ExportDialog />
    </div>
  );
}
