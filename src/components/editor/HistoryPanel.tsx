"use client";

import { useEditorStore } from "@/lib/store";
import { History, Undo2, Redo2 } from "lucide-react";

export default function HistoryPanel() {
  const { history, historyIndex, undo, redo } = useEditorStore();

  if (history.length <= 1) return null;

  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold">History</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="rounded p-1 text-white/30 transition hover:bg-white/5 hover:text-white disabled:opacity-20"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="rounded p-1 text-white/30 transition hover:bg-white/5 hover:text-white disabled:opacity-20"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="max-h-40 overflow-y-auto border-t border-white/5">
        {history.map((entry, i) => (
          <div
            key={entry.id}
            className={`flex items-center gap-2 px-4 py-2 text-[11px] transition ${
              i === historyIndex
                ? "bg-accent/5 text-accent"
                : i > historyIndex
                ? "text-white/20"
                : "text-white/40"
            }`}
          >
            <div
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                i === historyIndex ? "bg-accent" : i > historyIndex ? "bg-white/10" : "bg-white/20"
              }`}
            />
            {entry.label}
          </div>
        ))}
      </div>
    </div>
  );
}
