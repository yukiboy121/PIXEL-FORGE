import { Adjustments } from "./types";

export function applyAdjustmentsToCanvas(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  adjustments: Adjustments
): HTMLCanvasElement {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = w;
  outputCanvas.height = h;
  const ctx = outputCanvas.getContext("2d")!;

  // Draw source
  ctx.drawImage(sourceCanvas as HTMLCanvasElement, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  const {
    exposure, contrast, highlights, shadows, whites, blacks,
    temperature, tint, saturation, vibrance, clarity,
    sharpness, noiseReduction, fade, vignette,
    redBalance, greenBalance, blueBalance,
  } = adjustments;

  // Pre-compute lookup tables for performance
  const expFactor = Math.pow(2, exposure / 50);
  const contrastFactor = (100 + contrast * 1.2) / 100;
  const satFactor = 1 + saturation / 100;
  const vibFactor = vibrance / 100;
  const fadeFactor = fade / 100;
  const tempShift = temperature * 0.6;
  const tintShift = tint * 0.4;
  const rBal = 1 + redBalance / 100;
  const gBal = 1 + greenBalance / 100;
  const bBal = 1 + blueBalance / 100;

  // Build tone curve for highlights/shadows/whites/blacks
  const toneLut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let v = i / 255;
    // Exposure
    v = v * expFactor;
    // Contrast (pivot at 0.5)
    v = (v - 0.5) * contrastFactor + 0.5;
    // Highlights (affect upper range)
    if (v > 0.5) {
      const t = (v - 0.5) / 0.5;
      v = v + (highlights / 200) * t * (1 - t) * -2;
    }
    // Shadows (affect lower range)
    if (v < 0.5) {
      const t = v / 0.5;
      v = v + (shadows / 200) * t * (1 - t) * 2;
    }
    // Whites
    if (v > 0.7) {
      v = v + (whites / 400) * ((v - 0.7) / 0.3);
    }
    // Blacks
    if (v < 0.3) {
      v = v + (blacks / 400) * ((0.3 - v) / 0.3);
    }
    // Fade
    if (fadeFactor > 0) {
      v = v * (1 - fadeFactor) + fadeFactor * 0.15;
    }
    toneLut[i] = Math.max(0, Math.min(255, Math.round(v * 255)));
  }

  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      let r = d[idx];
      let g = d[idx + 1];
      let b = d[idx + 2];

      // Apply tone curve
      r = toneLut[r];
      g = toneLut[g];
      b = toneLut[b];

      // Temperature (warm = +R -B, cool = -R +B)
      r = Math.max(0, Math.min(255, r + tempShift));
      b = Math.max(0, Math.min(255, b - tempShift));

      // Tint (+ = magenta, - = green)
      g = Math.max(0, Math.min(255, g - tintShift));

      // Color balance
      r = Math.max(0, Math.min(255, r * rBal));
      g = Math.max(0, Math.min(255, g * gBal));
      b = Math.max(0, Math.min(255, b * bBal));

      // Saturation & Vibrance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      let sFactor = satFactor;
      if (vibFactor !== 0) {
        const currentSat = Math.max(Math.abs(r - lum), Math.abs(g - lum), Math.abs(b - lum)) / 255;
        sFactor += vibFactor * (1 - currentSat);
      }
      r = Math.max(0, Math.min(255, lum + (r - lum) * sFactor));
      g = Math.max(0, Math.min(255, lum + (g - lum) * sFactor));
      b = Math.max(0, Math.min(255, lum + (b - lum) * sFactor));

      // Vignette
      if (vignette > 0) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
        const vFactor = 1 - (vignette / 100) * dist * dist;
        r *= vFactor;
        g *= vFactor;
        b *= vFactor;
      }

      d[idx] = Math.max(0, Math.min(255, Math.round(r)));
      d[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      d[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Clarity (local contrast via unsharp mask with large radius)
  if (clarity !== 0) {
    applyClarity(ctx, w, h, clarity);
  }

  // Sharpness
  if (sharpness > 0) {
    applySharpen(ctx, w, h, sharpness);
  }

  // Noise reduction (simple blur on dark areas)
  if (noiseReduction > 0) {
    applyNoiseReduction(ctx, w, h, noiseReduction);
  }

  return outputCanvas;
}

function applyClarity(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const factor = amount / 100;
  const blurCanvas = document.createElement("canvas");
  blurCanvas.width = w;
  blurCanvas.height = h;
  const bCtx = blurCanvas.getContext("2d")!;
  bCtx.filter = `blur(${Math.max(2, Math.abs(amount) / 5)}px)`;
  bCtx.drawImage(ctx.canvas, 0, 0);
  const orig = ctx.getImageData(0, 0, w, h);
  const blurred = bCtx.getImageData(0, 0, w, h);
  for (let i = 0; i < orig.data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const diff = orig.data[i + c] - blurred.data[i + c];
      orig.data[i + c] = Math.max(0, Math.min(255, orig.data[i + c] + diff * factor));
    }
  }
  ctx.putImageData(orig, 0, 0);
}

function applySharpen(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const factor = amount / 200;
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const copy = new Uint8ClampedArray(d);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const center = copy[idx + c] * 5;
        const top = copy[((y - 1) * w + x) * 4 + c];
        const bottom = copy[((y + 1) * w + x) * 4 + c];
        const left = copy[(y * w + x - 1) * 4 + c];
        const right = copy[(y * w + x + 1) * 4 + c];
        const sharp = center - top - bottom - left - right;
        d[idx + c] = Math.max(0, Math.min(255, copy[idx + c] + sharp * factor));
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyNoiseReduction(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const radius = Math.ceil(amount / 30);
  if (radius < 1) return;
  const blurCanvas = document.createElement("canvas");
  blurCanvas.width = w;
  blurCanvas.height = h;
  const bCtx = blurCanvas.getContext("2d")!;
  bCtx.filter = `blur(${radius}px)`;
  bCtx.drawImage(ctx.canvas, 0, 0);
  const origData = ctx.getImageData(0, 0, w, h);
  const blurData = bCtx.getImageData(0, 0, w, h);
  const strength = Math.min(1, amount / 100);
  for (let i = 0; i < origData.data.length; i += 4) {
    const lum = 0.299 * origData.data[i] + 0.587 * origData.data[i + 1] + 0.114 * origData.data[i + 2];
    const darkFactor = Math.max(0, 1 - lum / 180) * strength;
    for (let c = 0; c < 3; c++) {
      origData.data[i + c] = Math.round(
        origData.data[i + c] * (1 - darkFactor) + blurData.data[i + c] * darkFactor
      );
    }
  }
  ctx.putImageData(origData, 0, 0);
}

export function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      `image/${format}`,
      quality / 100
    );
  });
}
