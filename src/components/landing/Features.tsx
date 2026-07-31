"use client";

import { motion } from "framer-motion";
import {
  Wand2, Sun, Palette, ZoomIn, ScanEye, Sparkles,
  Layers, Sliders, ImageUp, Focus, Contrast, Eye,
} from "lucide-react";

const features = [
  { icon: Wand2, title: "AI Auto Edit", desc: "Intelligent one-click enhancement that analyzes and corrects exposure, color, and detail automatically." },
  { icon: ZoomIn, title: "HD Upscale", desc: "Increase resolution up to 4× while preserving detail and sharpness using advanced algorithms." },
  { icon: Palette, title: "Color Balance", desc: "AI-assisted white balance, color temperature, and saturation correction for natural results." },
  { icon: Sun, title: "Lighting Correction", desc: "Fix underexposure, recover highlights, lift shadows, and balance harsh lighting." },
  { icon: Focus, title: "Detail Enhancement", desc: "Sharpen, reduce noise, recover texture, and improve micro-contrast without artifacts." },
  { icon: ScanEye, title: "AI Analysis", desc: "Comprehensive image quality assessment with actionable recommendations." },
  { icon: Contrast, title: "Dynamic Range", desc: "Expand tonal range to reveal detail in highlights and shadows simultaneously." },
  { icon: Sliders, title: "Manual Controls", desc: "Full professional adjustment panel with exposure, contrast, HSL, and more." },
  { icon: Sparkles, title: "Smart Presets", desc: "Curated AI presets for portraits, landscapes, products, and creative styles." },
  { icon: Layers, title: "Non-Destructive", desc: "Full edit history with undo/redo. Your original image is always preserved." },
  { icon: ImageUp, title: "Export Options", desc: "Export in JPEG, PNG, or WebP with quality and resolution controls." },
  { icon: Eye, title: "Before / After", desc: "Interactive split slider, side-by-side, and toggle comparison modes." },
];

export default function Features() {
  return (
    <section id="features" className="relative bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Capabilities</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your images need
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/40">
            A complete suite of AI-powered tools designed for professional image correction and enhancement.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group rounded-xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 transition group-hover:bg-accent/10">
                <f.icon className="h-5 w-5 text-white/40 transition group-hover:text-accent" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/35">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
