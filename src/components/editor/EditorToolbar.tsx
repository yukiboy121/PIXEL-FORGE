"use client";

import { useEditorStore, type CompareMode, type ZoomLevel } from "@/lib/store";
import {
  Sparkles, Undo2, Redo2, Download, ArrowLeft,
  SplitSquareHorizontal, Columns2, ToggleLeft,
  ZoomIn, ZoomOut, Eye,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect } from "react";

export default function EditorToolbar() {
  const {
    projectName,
    originalImageUrl,
    history,
    historyIndex,
    undo,
    redo,
    compareMode,
    setCompareMode,
    zoom,
    setZoom,
    setShowExportDialog,
    setIsComparing,
    isComparing,
  } = useEditorStore();

  const hasImage = !!originalImageUrl;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        setShowExportDialog(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, setShowExportDialog]);

  const zoomIn = useCallback(() => {
    const levels: ZoomLevel[] = [0.25, 0.5, 1, 2, 4];
    const currentIdx = zoom === "fit" ? 2 : levels.indexOf(zoom as Exclude<ZoomLevel, "fit">);
    if (currentIdx < levels.length - 1) setZoom(levels[currentIdx + 1]);
  }, [zoom, setZoom]);

  const zoomOut = useCallback(() => {
    const levels: ZoomLevel[] = [0.25, 0.5, 1, 2, 4];
    const currentIdx = zoom === "fit" ? 2 : levels.indexOf(zoom as Exclude<ZoomLevel, "fit">);
    if (currentIdx > 0) setZoom(levels[currentIdx - 1]);
  }, [zoom, setZoom]);

  return (
    <div className="flex h-12 items-center justify-between border-b border-editor-border bg-editor-surface px-3">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-white/40 transition hover:text-white"
          title="Back to dashboard"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent">
            <Sparkles className="h-3 w-3 text-black" />
          </div>
        </Link>
        <div className="h-4 w-px bg-editor-border" />
        <span className="text-xs text-white/40 truncate max-w-48">{projectName}</span>
      </div>

      {/* Center */}
      {hasImage && (
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="rounded p-1.5 text-white/30 transition hover:bg-editor-hover hover:text-white disabled:opacity-20"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="rounded p-1.5 text-white/30 transition hover:bg-editor-hover hover:text-white disabled:opacity-20"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <div className="mx-2 h-4 w-px bg-editor-border" />

          {/* Compare modes */}
          <button
            onClick={() => setCompareMode("slider")}
            className={`rounded p-1.5 transition ${
              compareMode === "slider" ? "bg-editor-active text-white" : "text-white/30 hover:bg-editor-hover hover:text-white"
            }`}
            title="Split slider"
          >
            <SplitSquareHorizontal className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCompareMode("side-by-side")}
            className={`rounded p-1.5 transition ${
              compareMode === "side-by-side" ? "bg-editor-active text-white" : "text-white/30 hover:bg-editor-hover hover:text-white"
            }`}
            title="Side by side"
          >
            <Columns2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCompareMode("toggle")}
            className={`rounded p-1.5 transition ${
              compareMode === "toggle" ? "bg-editor-active text-white" : "text-white/30 hover:bg-editor-hover hover:text-white"
            }`}
            title="Toggle"
          >
            <ToggleLeft className="h-4 w-4" />
          </button>
          <div className="mx-2 h-4 w-px bg-editor-border" />

          {/* Hold to compare */}
          <button
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onMouseLeave={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] transition ${
              isComparing
                ? "bg-accent/10 text-accent"
                : "text-white/30 hover:bg-editor-hover hover:text-white"
            }`}
            title="Hold to compare with original"
          >
            <Eye className="h-3.5 w-3.5" />
            Hold to Compare
          </button>
          <div className="mx-2 h-4 w-px bg-editor-border" />

          {/* Zoom */}
          <button
            onClick={zoomOut}
            className="rounded p-1.5 text-white/30 transition hover:bg-editor-hover hover:text-white"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom("fit")}
            className="rounded px-2 py-1 text-[11px] font-mono text-white/40 transition hover:bg-editor-hover hover:text-white"
          >
            {zoom === "fit" ? "Fit" : `${Math.round((zoom as number) * 100)}%`}
          </button>
          <button
            onClick={zoomIn}
            className="rounded p-1.5 text-white/30 transition hover:bg-editor-hover hover:text-white"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Right */}
      <div className="flex items-center gap-2">
        {hasImage && (
          <button
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-accent-hover"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        )}
      </div>
    </div>
  );
}
