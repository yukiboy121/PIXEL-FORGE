"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useEditorStore } from "@/lib/store";
import { applyAdjustmentsToCanvas } from "@/lib/ai/processor";
import { defaultAdjustments } from "@/lib/ai/types";

function isDefaultAdjustments(adj: typeof defaultAdjustments): boolean {
  return Object.keys(defaultAdjustments).every(
    (key) => adj[key as keyof typeof defaultAdjustments] === defaultAdjustments[key as keyof typeof defaultAdjustments]
  );
}

export default function EditorCanvas() {
  const {
    originalImageUrl,
    adjustments,
    zoom,
    compareMode,
    sliderPosition,
    isComparing,
    setProcessedImage,
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load original image into hidden canvas
  useEffect(() => {
    if (!originalImageUrl) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      originalCanvasRef.current = canvas;
      // Trigger initial render with current adjustments
      const origCanvas = originalCanvasRef.current;
      const currentAdj = useEditorStore.getState().adjustments;
      if (isDefaultAdjustments(currentAdj)) {
        processedCanvasRef.current = origCanvas;
      } else {
        processedCanvasRef.current = applyAdjustmentsToCanvas(origCanvas, currentAdj);
      }
      renderToDisplay();
    };
    img.src = originalImageUrl;
    return () => {
      img.onload = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalImageUrl]);

  // Debounced processing when adjustments change
  const processAndRender = useCallback(() => {
    if (!originalCanvasRef.current) return;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const origCanvas = originalCanvasRef.current!;
      if (isDefaultAdjustments(adjustments)) {
        processedCanvasRef.current = origCanvas;
      } else {
        processedCanvasRef.current = applyAdjustmentsToCanvas(origCanvas, adjustments);
      }
      renderToDisplay();
      // Generate processed image URL
      if (processedCanvasRef.current && !isDefaultAdjustments(adjustments)) {
        processedCanvasRef.current.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setProcessedImage(url);
          }
        }, "image/jpeg", 0.92);
      }
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustments, setProcessedImage]);

  useEffect(() => {
    processAndRender();
    return () => clearTimeout(debounceTimer.current);
  }, [processAndRender]);

  const renderToDisplay = useCallback(() => {
    const displayCanvas = displayCanvasRef.current;
    const container = containerRef.current;
    if (!displayCanvas || !container || !processedCanvasRef.current) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const srcW = processedCanvasRef.current!.width;
      const srcH = processedCanvasRef.current!.height;
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;

      let scale: number;
      if (zoom === "fit") {
        scale = Math.min(containerW / srcW, containerH / srcH, 1);
      } else {
        scale = zoom;
      }

      const dispW = Math.floor(srcW * scale);
      const dispH = Math.floor(srcH * scale);
      displayCanvas.width = dispW;
      displayCanvas.height = dispH;
      displayCanvas.style.width = `${dispW}px`;
      displayCanvas.style.height = `${dispH}px`;

      const ctx = displayCanvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (isComparing && originalCanvasRef.current) {
        // Show original
        ctx.drawImage(originalCanvasRef.current, 0, 0, dispW, dispH);
      } else if (compareMode === "slider" && originalCanvasRef.current) {
        // Draw processed full
        ctx.drawImage(processedCanvasRef.current!, 0, 0, dispW, dispH);
        // Draw original on left portion
        const splitX = Math.floor(dispW * (sliderPosition / 100));
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, dispH);
        ctx.clip();
        ctx.drawImage(originalCanvasRef.current, 0, 0, dispW, dispH);
        ctx.restore();
        // Draw slider line
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, dispH);
        ctx.stroke();
      } else {
        ctx.drawImage(processedCanvasRef.current!, 0, 0, dispW, dispH);
      }
    });
  }, [zoom, compareMode, sliderPosition, isComparing]);

  useEffect(() => {
    renderToDisplay();
  }, [renderToDisplay, sliderPosition, isComparing, zoom]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => renderToDisplay());
    ro.observe(container);
    return () => ro.disconnect();
  }, [renderToDisplay]);

  // Slider drag handlers
  const handleSliderDrag = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      const canvas = displayCanvasRef.current;
      if (!container || !canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const x = clientX - canvasRect.left;
      const pct = Math.max(0, Math.min(100, (x / canvasRect.width) * 100));
      useEditorStore.getState().setSliderPosition(pct);
    },
    []
  );

  if (!originalImageUrl) return null;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-auto bg-editor-bg"
      onMouseMove={(e) => {
        if (isDraggingSlider) handleSliderDrag(e.clientX);
      }}
      onMouseUp={() => setIsDraggingSlider(false)}
      onMouseLeave={() => setIsDraggingSlider(false)}
    >
      {/* Checkerboard for transparency */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      />
      <canvas
        ref={displayCanvasRef}
        className="relative cursor-crosshair"
        onMouseDown={(e) => {
          if (compareMode === "slider") {
            setIsDraggingSlider(true);
            handleSliderDrag(e.clientX);
          }
        }}
        onTouchStart={(e) => {
          if (compareMode === "slider") {
            setIsDraggingSlider(true);
            handleSliderDrag(e.touches[0].clientX);
          }
        }}
        onTouchMove={(e) => {
          if (isDraggingSlider) handleSliderDrag(e.touches[0].clientX);
        }}
        onTouchEnd={() => setIsDraggingSlider(false)}
      />

      {/* Labels for slider mode */}
      {compareMode === "slider" && !isComparing && (
        <>
          <div className="pointer-events-none absolute top-4 left-4 rounded bg-black/60 px-2 py-1 text-[10px] font-medium tracking-wider text-white/50">
            BEFORE
          </div>
          <div className="pointer-events-none absolute top-4 right-4 rounded bg-black/60 px-2 py-1 text-[10px] font-medium tracking-wider text-white/50">
            AFTER
          </div>
        </>
      )}
      {isComparing && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded bg-black/80 px-3 py-1.5 text-xs font-medium text-white/60">
          Viewing Original
        </div>
      )}
    </div>
  );
}
