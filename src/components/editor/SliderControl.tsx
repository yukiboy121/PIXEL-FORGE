"use client";

import { useCallback, useRef } from "react";

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  onChangeEnd?: () => void;
}

export default function SliderControl({
  label,
  value,
  min = -100,
  max = 100,
  onChange,
  onChangeEnd,
}: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      onChange(v);
      if (onChangeEnd) {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(onChangeEnd, 300);
      }
    },
    [onChange, onChangeEnd]
  );

  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium text-white/50 group-hover:text-white/70 transition">
          {label}
        </span>
        <span className="text-[11px] font-mono text-white/30 tabular-nums">
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={handleChange}
          className="w-full"
        />
        {/* Center mark for bipolar sliders */}
        {min < 0 && (
          <div
            className="pointer-events-none absolute top-1/2 h-2 w-px bg-white/20 -translate-y-1/2"
            style={{ left: "50%" }}
          />
        )}
      </div>
    </div>
  );
}
