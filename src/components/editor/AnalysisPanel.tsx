"use client";

import { useEditorStore } from "@/lib/store";
import { ScanEye, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";


function QualityMeter({ value, label }: { value: number; label: string }) {
  const color =
    value >= 80 ? "bg-success" : value >= 60 ? "bg-accent" : value >= 40 ? "bg-warning" : "bg-error";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-white/40 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-mono text-white/30 w-6 text-right">{Math.round(value)}</span>
    </div>
  );
}

function MetricRow({ label, value, valueLabel }: { label: string; value: number; valueLabel: string }) {
  const color =
    valueLabel === "Good" || valueLabel === "Balanced" || valueLabel === "Very Low"
      ? "text-success/70"
      : valueLabel.includes("Slightly") || valueLabel === "Moderate" || valueLabel === "Low"
      ? "text-amber-400/70"
      : "text-error/70";
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px] text-white/40">{label}</span>
      <span className={`text-[11px] font-medium ${color}`}>{valueLabel}</span>
    </div>
  );
}

export default function AnalysisPanel() {
  const { analysis, showAnalysisPanel, setShowAnalysisPanel } = useEditorStore();
  const [expanded, setExpanded] = useState(false);

  if (!analysis) return null;

  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <ScanEye className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold">AI Image Analysis</span>
        </div>
        {showAnalysisPanel ? (
          <ChevronUp className="h-3.5 w-3.5 text-white/30" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-white/30" />
        )}
      </button>

      {showAnalysisPanel && (
        <div className="border-t border-white/5 px-4 py-3 space-y-4">
          {/* Quality Score */}
          <div className="text-center py-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-2">
              Image Quality
            </div>
            <div className="relative inline-flex items-center justify-center">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke={analysis.overallQuality >= 70 ? "#22c55e" : analysis.overallQuality >= 50 ? "#e5793a" : "#ef4444"}
                  strokeWidth="2.5"
                  strokeDasharray={`${analysis.overallQuality} ${100 - analysis.overallQuality}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-lg font-bold">{analysis.overallQuality}</span>
            </div>
          </div>

          {/* Quality Breakdown */}
          <div className="space-y-2">
            <QualityMeter value={analysis.qualityBreakdown.resolution} label="Resolution" />
            <QualityMeter value={analysis.qualityBreakdown.lighting} label="Lighting" />
            <QualityMeter value={analysis.qualityBreakdown.color} label="Color" />
            <QualityMeter value={analysis.qualityBreakdown.sharpness} label="Sharpness" />
            <QualityMeter value={analysis.qualityBreakdown.noise} label="Noise" />
          </div>

          {/* Metrics */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 pt-2"
          >
            Detailed Metrics
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {expanded && (
            <div className="divide-y divide-white/[0.03]">
              <MetricRow label="Exposure" value={analysis.exposure.value} valueLabel={analysis.exposure.label} />
              <MetricRow label="White Balance" value={analysis.whiteBalance.value} valueLabel={analysis.whiteBalance.label} />
              <MetricRow label="Contrast" value={analysis.contrast.value} valueLabel={analysis.contrast.label} />
              <MetricRow label="Saturation" value={analysis.saturation.value} valueLabel={analysis.saturation.label} />
              <MetricRow label="Sharpness" value={analysis.sharpness.value} valueLabel={analysis.sharpness.label} />
              <MetricRow label="Noise" value={analysis.noise.value} valueLabel={analysis.noise.label} />
              <MetricRow label="Dynamic Range" value={analysis.dynamicRange.value} valueLabel={analysis.dynamicRange.label} />
            </div>
          )}

          {/* Dominant Colors */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-2">
              Dominant Colors
            </div>
            <div className="flex gap-1.5">
              {analysis.dominantColors.slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-md border border-white/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="border-t border-white/5 pt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3 w-3 text-accent" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
                  AI Recommendations
                </span>
              </div>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <p key={i} className="text-[11px] leading-relaxed text-white/40">
                    {rec}
                  </p>
                ))}
              </div>
              {analysis.fixActions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.fixActions.map((action) => (
                    <button
                      key={action.action}
                      className="rounded-md border border-accent/20 bg-accent/5 px-2.5 py-1 text-[10px] font-medium text-accent transition hover:bg-accent/10"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
