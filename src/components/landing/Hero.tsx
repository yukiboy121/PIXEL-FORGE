"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import BeforeAfterSlider from "./BeforeAfterSlider";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black pt-16">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 sm:pt-28 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            AI-Powered Image Enhancement
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            Your photos.
            <br />
            <span className="text-white/40">Their best version.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/40 sm:text-lg">
            Enhance resolution, restore details, balance colors and intelligently
            correct your photos with AI. Professional results in seconds.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/editor"
              className="group flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-accent-hover"
            >
              Start Editing
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:text-white"
            >
              <Play className="h-3.5 w-3.5" />
              See How It Works
            </a>
          </div>
        </motion.div>

        {/* Editor Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-editor-surface shadow-2xl shadow-black/50">
            {/* Mock toolbar */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-white/10" />
                <div className="h-3 w-3 rounded-full bg-white/10" />
                <div className="h-3 w-3 rounded-full bg-white/10" />
              </div>
              <span className="text-xs text-white/30">PixelForge AI Editor</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-12 rounded bg-white/5" />
                <div className="h-2 w-8 rounded bg-accent/30" />
              </div>
            </div>
            {/* Before/After Slider */}
            <div className="relative aspect-[16/9] bg-editor-bg">
              <BeforeAfterSlider />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
