"use client";

import { useRef, useState, useCallback } from "react";

export default function BeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setPosition(pct);
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      handleMove(e.clientX);
    },
    [handleMove]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging) handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-col-resize select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* "After" - enhanced image (full background) */}
      <div className="absolute inset-0">
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(135deg, #1a1f2e 0%, #1e2636 30%, #1a2432 60%, #171e2a 100%)",
          }}
        >
          <div className="flex h-full items-center justify-center">
            <div className="relative">
              <div className="h-48 w-72 rounded-xl bg-gradient-to-br from-amber-900/40 via-emerald-900/30 to-sky-900/40 sm:h-64 sm:w-96" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-medium tracking-widest text-white/30">ENHANCED</div>
                  <div className="mt-1 text-xs text-emerald-400/60">AI Corrected</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Before" - original image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <div
          className="h-full"
          style={{
            width: containerRef.current
              ? `${containerRef.current.offsetWidth}px`
              : "100vw",
            background:
              "linear-gradient(135deg, #14171f 0%, #181b24 30%, #141a22 60%, #111620 100%)",
          }}
        >
          <div className="flex h-full items-center justify-center">
            <div className="relative">
              <div className="h-48 w-72 rounded-xl bg-gradient-to-br from-amber-950/40 via-stone-900/30 to-slate-900/40 sm:h-64 sm:w-96" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-medium tracking-widest text-white/20">ORIGINAL</div>
                  <div className="mt-1 text-xs text-white/15">Before AI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-white/80"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-black/80 p-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3L2 8L5 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 3L14 8L11 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-10 rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-medium tracking-wider text-white/50 backdrop-blur-sm">
        BEFORE
      </div>
      <div className="absolute top-4 right-4 z-10 rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-medium tracking-wider text-white/50 backdrop-blur-sm">
        AFTER
      </div>
    </div>
  );
}
