import { ImageAnalysis } from "./types";

function getLabel(value: number, thresholds: [string, string, string, string, string]): string {
  if (value < 20) return thresholds[0];
  if (value < 40) return thresholds[1];
  if (value < 60) return thresholds[2];
  if (value < 80) return thresholds[3];
  return thresholds[4];
}

export function analyzeImageData(imageData: ImageData): ImageAnalysis {
  const { data, width, height } = imageData;
  const pixelCount = width * height;
  let totalR = 0, totalG = 0, totalB = 0;
  let totalBrightness = 0;
  let brightPixels = 0, darkPixels = 0;
  let highContrastCount = 0;
  const histogram = new Uint32Array(256);
  const colorBuckets: Record<string, number> = {};
  let prevBrightness = 0;
  let noiseSum = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    totalR += r;
    totalG += g;
    totalB += b;
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    totalBrightness += brightness;
    histogram[Math.floor(brightness)]++;
    if (brightness > 220) brightPixels++;
    if (brightness < 35) darkPixels++;
    if (i > 0) {
      const diff = Math.abs(brightness - prevBrightness);
      if (diff > 50) highContrastCount++;
      noiseSum += Math.min(diff, 30);
    }
    prevBrightness = brightness;
    const bucketR = Math.floor(r / 64);
    const bucketG = Math.floor(g / 64);
    const bucketB = Math.floor(b / 64);
    const key = `${bucketR},${bucketG},${bucketB}`;
    colorBuckets[key] = (colorBuckets[key] || 0) + 1;
  }

  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;
  const avgBrightness = totalBrightness / pixelCount;
  const brightRatio = brightPixels / pixelCount;
  const darkRatio = darkPixels / pixelCount;
  const contrastRatio = highContrastCount / pixelCount;
  const noiseLevel = noiseSum / pixelCount;

  // Exposure analysis
  const exposureValue = Math.min(100, Math.max(0, avgBrightness / 2.55));
  const exposureLabel = exposureValue < 30 ? "Underexposed" :
    exposureValue < 40 ? "Slightly Dark" :
    exposureValue > 75 ? "Overexposed" :
    exposureValue > 65 ? "Slightly Bright" : "Good";

  // White balance
  const rDiff = avgR - avgG;
  const bDiff = avgB - avgG;
  const warmth = rDiff - bDiff;
  const wbValue = Math.min(100, Math.max(0, 50 + warmth / 2));
  const wbLabel = warmth > 20 ? "Too Warm" :
    warmth > 8 ? "Slightly Warm" :
    warmth < -20 ? "Too Cool" :
    warmth < -8 ? "Slightly Cool" : "Balanced";

  // Contrast
  const contrastValue = Math.min(100, contrastRatio * 800);
  const contrastLabel = getLabel(contrastValue, ["Very Low", "Low", "Moderate", "Good", "High"]);

  // Sharpness estimate (edge density)
  const sharpnessValue = Math.min(100, contrastRatio * 600);
  const sharpnessLabel = getLabel(sharpnessValue, ["Blurry", "Soft", "Moderate", "Sharp", "Very Sharp"]);

  // Noise
  const noiseValue = Math.min(100, noiseLevel * 8);
  const noiseLabel = noiseValue < 20 ? "Very Low" :
    noiseValue < 40 ? "Low" :
    noiseValue < 60 ? "Moderate" :
    noiseValue < 80 ? "High" : "Very High";

  // Dynamic range
  let usedRange = 0;
  for (let i = 0; i < 256; i++) {
    if (histogram[i] > 0) usedRange++;
  }
  const drValue = (usedRange / 256) * 100;
  const drLabel = getLabel(drValue, ["Very Narrow", "Narrow", "Moderate", "Good", "Excellent"]);

  // Saturation
  let totalSat = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    totalSat += max === 0 ? 0 : (max - min) / max;
  }
  const avgSat = totalSat / pixelCount;
  const satValue = avgSat * 100;
  const satLabel = getLabel(satValue, ["Desaturated", "Low", "Moderate", "Vibrant", "Highly Saturated"]);

  // Dominant colors
  const sortedBuckets = Object.entries(colorBuckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const dominantColors = sortedBuckets.map(([key]) => {
    const [r, g, b] = key.split(",").map(Number);
    return `rgb(${r * 64 + 32},${g * 64 + 32},${b * 64 + 32})`;
  });

  // Quality score
  const resolutionScore = Math.min(100, (width * height) / (1920 * 1080) * 80);
  const lightingScore = Math.max(0, 100 - Math.abs(exposureValue - 50) * 2);
  const colorScore = Math.max(0, 100 - Math.abs(satValue - 45) * 1.5 - Math.abs(warmth) * 0.5);
  const sharpScore = sharpnessValue;
  const noiseScore = Math.max(0, 100 - noiseValue);
  const overallQuality = Math.round(
    resolutionScore * 0.15 + lightingScore * 0.25 + colorScore * 0.2 + sharpScore * 0.2 + noiseScore * 0.2
  );

  // Recommendations
  const recommendations: string[] = [];
  const fixActions: { label: string; action: string }[] = [];

  if (exposureValue < 35) {
    recommendations.push("Your image is underexposed. Increasing brightness would improve visibility.");
    fixActions.push({ label: "Fix Exposure", action: "fix-exposure" });
  } else if (exposureValue > 70) {
    recommendations.push("Your image is slightly overexposed. Reducing highlights would help.");
    fixActions.push({ label: "Fix Exposure", action: "fix-exposure" });
  }
  if (brightRatio > 0.15) {
    recommendations.push("Highlights are clipping. Consider recovering highlight detail.");
    fixActions.push({ label: "Recover Highlights", action: "recover-highlights" });
  }
  if (darkRatio > 0.2) {
    recommendations.push("Shadow areas lack detail. Lifting shadows would reveal more information.");
    fixActions.push({ label: "Lift Shadows", action: "lift-shadows" });
  }
  if (Math.abs(warmth) > 12) {
    recommendations.push(`White balance is ${warmth > 0 ? "too warm" : "too cool"}. Color correction recommended.`);
    fixActions.push({ label: "Balance Colors", action: "balance-colors" });
  }
  if (noiseValue > 40) {
    recommendations.push("Noise is visible. Noise reduction would improve quality.");
    fixActions.push({ label: "Reduce Noise", action: "reduce-noise" });
  }
  if (sharpnessValue < 35) {
    recommendations.push("Image appears soft. Sharpening would improve detail.");
    fixActions.push({ label: "Sharpen", action: "sharpen" });
  }
  if (drValue < 50) {
    recommendations.push("Dynamic range is limited. Expanding tonal range would improve depth.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Image quality is good. Minor AI enhancements can still improve it.");
  }

  return {
    exposure: { value: exposureValue, label: exposureLabel },
    brightness: { value: avgBrightness / 2.55, label: getLabel(avgBrightness / 2.55, ["Very Dark", "Dark", "Moderate", "Bright", "Very Bright"]) },
    contrast: { value: contrastValue, label: contrastLabel },
    highlights: { value: brightRatio * 100, label: brightRatio > 0.15 ? "Clipping" : brightRatio > 0.05 ? "Slightly High" : "Good" },
    shadows: { value: darkRatio * 100, label: darkRatio > 0.2 ? "Crushed" : darkRatio > 0.1 ? "Slightly Dark" : "Good" },
    whiteBalance: { value: wbValue, label: wbLabel },
    colorTemperature: { value: wbValue, label: wbLabel },
    saturation: { value: satValue, label: satLabel },
    vibrance: { value: satValue * 0.8, label: satLabel },
    sharpness: { value: sharpnessValue, label: sharpnessLabel },
    noise: { value: noiseValue, label: noiseLabel },
    dynamicRange: { value: drValue, label: drLabel },
    dominantColors,
    overallQuality,
    qualityBreakdown: {
      resolution: Math.round(resolutionScore),
      lighting: Math.round(lightingScore),
      color: Math.round(colorScore),
      sharpness: Math.round(sharpScore),
      noise: Math.round(noiseScore),
    },
    recommendations,
    fixActions,
  };
}

export function generateAutoAdjustments(analysis: ImageAnalysis) {
  const adj = {
    exposure: 0, contrast: 0, highlights: 0, shadows: 0, whites: 0, blacks: 0,
    temperature: 0, tint: 0, saturation: 0, vibrance: 0, clarity: 0,
    sharpness: 0, noiseReduction: 0, texture: 0, fade: 0, vignette: 0, grain: 0,
    redBalance: 0, greenBalance: 0, blueBalance: 0,
  };

  // Exposure correction
  if (analysis.exposure.value < 35) adj.exposure = Math.min(30, (50 - analysis.exposure.value) * 0.6);
  else if (analysis.exposure.value > 70) adj.exposure = Math.max(-25, (50 - analysis.exposure.value) * 0.5);

  // Contrast
  if (analysis.contrast.value < 30) adj.contrast = 15;
  else if (analysis.contrast.value > 80) adj.contrast = -10;

  // Highlights/Shadows
  if (analysis.highlights.value > 5) adj.highlights = -Math.min(30, analysis.highlights.value * 2);
  if (analysis.shadows.value > 10) adj.shadows = Math.min(30, analysis.shadows.value * 1.5);

  // White balance
  if (analysis.whiteBalance.value > 60) {
    adj.temperature = -Math.min(20, (analysis.whiteBalance.value - 50) * 0.8);
  } else if (analysis.whiteBalance.value < 40) {
    adj.temperature = Math.min(20, (50 - analysis.whiteBalance.value) * 0.8);
  }

  // Saturation
  if (analysis.saturation.value < 25) adj.vibrance = 15;
  else if (analysis.saturation.value > 70) adj.saturation = -10;
  else adj.vibrance = 5;

  // Sharpness
  if (analysis.sharpness.value < 40) adj.sharpness = Math.min(25, (50 - analysis.sharpness.value) * 0.5);
  else adj.sharpness = 5;

  // Noise
  if (analysis.noise.value > 30) adj.noiseReduction = Math.min(30, analysis.noise.value * 0.5);

  // Clarity
  adj.clarity = 8;

  return adj;
}
