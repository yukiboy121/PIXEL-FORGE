import { create } from "zustand";
import { Adjustments, defaultAdjustments, HistoryEntry, ImageAnalysis, ExportOptions } from "./ai/types";
import { v4 as uuid } from "uuid";

export type EditorTool = "adjust" | "ai-auto" | "color" | "light" | "detail" | "presets" | "upscale";
export type CompareMode = "slider" | "side-by-side" | "toggle";
export type ZoomLevel = 0.25 | 0.5 | 1 | 2 | 4 | "fit";

interface EditorState {
  // Image state
  originalImageUrl: string | null;
  originalFile: File | null;
  originalWidth: number;
  originalHeight: number;
  processedImageUrl: string | null;
  isLoading: boolean;
  loadingSteps: { label: string; done: boolean }[];
  loadingTitle: string;

  // Editor state
  activeTool: EditorTool;
  adjustments: Adjustments;
  analysis: ImageAnalysis | null;
  isAnalyzing: boolean;

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // Compare
  compareMode: CompareMode;
  sliderPosition: number;
  isComparing: boolean;

  // Zoom
  zoom: ZoomLevel;

  // Export
  showExportDialog: boolean;
  exportOptions: ExportOptions;

  // Project
  projectName: string;

  // Panels
  showAnalysisPanel: boolean;
  showRecommendations: boolean;

  // Actions
  setOriginalImage: (url: string, file: File, width: number, height: number) => void;
  setProcessedImage: (url: string) => void;
  setActiveTool: (tool: EditorTool) => void;
  setAdjustment: (key: keyof Adjustments, value: number) => void;
  setAdjustments: (adj: Adjustments, label: string) => void;
  resetAdjustments: () => void;
  setAnalysis: (analysis: ImageAnalysis) => void;
  setIsAnalyzing: (v: boolean) => void;
  setLoading: (loading: boolean, title?: string) => void;
  setLoadingSteps: (steps: { label: string; done: boolean }[]) => void;
  completeLoadingStep: (index: number) => void;
  pushHistory: (label: string) => void;
  undo: () => void;
  redo: () => void;
  setCompareMode: (mode: CompareMode) => void;
  setSliderPosition: (pos: number) => void;
  setIsComparing: (v: boolean) => void;
  setZoom: (z: ZoomLevel) => void;
  setShowExportDialog: (v: boolean) => void;
  setExportOptions: (opts: Partial<ExportOptions>) => void;
  setProjectName: (name: string) => void;
  setShowAnalysisPanel: (v: boolean) => void;
  setShowRecommendations: (v: boolean) => void;
  reset: () => void;
}

const initialState = {
  originalImageUrl: null,
  originalFile: null,
  originalWidth: 0,
  originalHeight: 0,
  processedImageUrl: null,
  isLoading: false,
  loadingSteps: [],
  loadingTitle: "",
  activeTool: "adjust" as EditorTool,
  adjustments: { ...defaultAdjustments },
  analysis: null,
  isAnalyzing: false,
  history: [],
  historyIndex: -1,
  compareMode: "slider" as CompareMode,
  sliderPosition: 50,
  isComparing: false,
  zoom: "fit" as ZoomLevel,
  showExportDialog: false,
  exportOptions: {
    // WebP at 80% keeps exports visually sharp while being much smaller than
    // high-quality JPEG or lossless PNG files.
    format: "webp" as const,
    quality: 80,
    scale: 1,
    filename: "image-enhanced",
  },
  projectName: "Untitled Project",
  showAnalysisPanel: true,
  showRecommendations: true,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  setOriginalImage: (url, file, width, height) => {
    const prev = get().originalImageUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({
      originalImageUrl: url,
      originalFile: file,
      originalWidth: width,
      originalHeight: height,
      adjustments: { ...defaultAdjustments },
      history: [{ id: uuid(), label: "Original", adjustments: { ...defaultAdjustments }, timestamp: Date.now() }],
      historyIndex: 0,
      processedImageUrl: null,
      analysis: null,
      projectName: file.name.replace(/\.[^/.]+$/, ""),
    });
  },

  setProcessedImage: (url) => {
    const prev = get().processedImageUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ processedImageUrl: url });
  },

  setActiveTool: (tool) => set({ activeTool: tool }),

  setAdjustment: (key, value) => {
    set((s) => ({
      adjustments: { ...s.adjustments, [key]: value },
    }));
  },

  setAdjustments: (adj, label) => {
    const state = get();
    const newEntry: HistoryEntry = { id: uuid(), label, adjustments: { ...adj }, timestamp: Date.now() };
    const newHistory = [...state.history.slice(0, state.historyIndex + 1), newEntry];
    set({
      adjustments: { ...adj },
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  resetAdjustments: () => {
    const state = get();
    const newEntry: HistoryEntry = { id: uuid(), label: "Reset", adjustments: { ...defaultAdjustments }, timestamp: Date.now() };
    const newHistory = [...state.history.slice(0, state.historyIndex + 1), newEntry];
    set({
      adjustments: { ...defaultAdjustments },
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  setAnalysis: (analysis) => set({ analysis }),
  setIsAnalyzing: (v) => set({ isAnalyzing: v }),

  setLoading: (loading, title) => set({ isLoading: loading, loadingTitle: title || "" }),
  setLoadingSteps: (steps) => set({ loadingSteps: steps }),
  completeLoadingStep: (index) => set((s) => ({
    loadingSteps: s.loadingSteps.map((step, i) => i === index ? { ...step, done: true } : step),
  })),

  pushHistory: (label) => {
    const state = get();
    const newEntry: HistoryEntry = { id: uuid(), label, adjustments: { ...state.adjustments }, timestamp: Date.now() };
    const newHistory = [...state.history.slice(0, state.historyIndex + 1), newEntry];
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        historyIndex: newIndex,
        adjustments: { ...state.history[newIndex].adjustments },
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        historyIndex: newIndex,
        adjustments: { ...state.history[newIndex].adjustments },
      });
    }
  },

  setCompareMode: (mode) => set({ compareMode: mode }),
  setSliderPosition: (pos) => set({ sliderPosition: pos }),
  setIsComparing: (v) => set({ isComparing: v }),
  setZoom: (z) => set({ zoom: z }),
  setShowExportDialog: (v) => set({ showExportDialog: v }),
  setExportOptions: (opts) => set((s) => ({ exportOptions: { ...s.exportOptions, ...opts } })),
  setProjectName: (name) => set({ projectName: name }),
  setShowAnalysisPanel: (v) => set({ showAnalysisPanel: v }),
  setShowRecommendations: (v) => set({ showRecommendations: v }),

  reset: () => {
    const state = get();
    if (state.originalImageUrl) URL.revokeObjectURL(state.originalImageUrl);
    if (state.processedImageUrl) URL.revokeObjectURL(state.processedImageUrl);
    set({ ...initialState });
  },
}));
