export interface ImageAnalysis {
  exposure: { value: number; label: string };
  brightness: { value: number; label: string };
  contrast: { value: number; label: string };
  highlights: { value: number; label: string };
  shadows: { value: number; label: string };
  whiteBalance: { value: number; label: string };
  colorTemperature: { value: number; label: string };
  saturation: { value: number; label: string };
  vibrance: { value: number; label: string };
  sharpness: { value: number; label: string };
  noise: { value: number; label: string };
  dynamicRange: { value: number; label: string };
  dominantColors: string[];
  overallQuality: number;
  qualityBreakdown: {
    resolution: number;
    lighting: number;
    color: number;
    sharpness: number;
    noise: number;
  };
  recommendations: string[];
  fixActions: { label: string; action: string }[];
}

export interface Adjustments {
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  temperature: number;
  tint: number;
  saturation: number;
  vibrance: number;
  clarity: number;
  sharpness: number;
  noiseReduction: number;
  texture: number;
  fade: number;
  vignette: number;
  grain: number;
  redBalance: number;
  greenBalance: number;
  blueBalance: number;
}

export const defaultAdjustments: Adjustments = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  saturation: 0,
  vibrance: 0,
  clarity: 0,
  sharpness: 0,
  noiseReduction: 0,
  texture: 0,
  fade: 0,
  vignette: 0,
  grain: 0,
  redBalance: 0,
  greenBalance: 0,
  blueBalance: 0,
};

export interface HistoryEntry {
  id: string;
  label: string;
  adjustments: Adjustments;
  timestamp: number;
}

export type PresetName =
  | "ai-auto"
  | "natural"
  | "cinematic"
  | "clean"
  | "portrait"
  | "landscape"
  | "product"
  | "social"
  | "night"
  | "lowlight"
  | "oldphoto";

export interface ExportOptions {
  format: "jpeg" | "png" | "webp";
  quality: number;
  scale: number;
  filename: string;
}
