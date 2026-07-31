"use client";

import { motion } from "framer-motion";
import { Upload, ScanSearch, Download } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload",
    desc: "Drop any image — JPEG, PNG, or WebP. Your original is always preserved.",
  },
  {
    num: "02",
    icon: ScanSearch,
    title: "Let AI Analyze",
    desc: "AI examines exposure, color, sharpness, noise, and composition to determine optimal corrections.",
  },
  {
    num: "03",
    icon: Download,
    title: "Enhance & Export",
    desc: "Apply AI corrections, fine-tune manually, compare before/after, and export in your preferred format.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-black py-24 sm:py-32">
      <div className="absolute inset-0 border-t border-b border-white/[0.03]" />
      <div className="relative mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Process</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                <step.icon className="h-7 w-7 text-accent" />
              </div>
              <div className="mt-2 text-[10px] font-bold tracking-[0.3em] text-white/20">{step.num}</div>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/40">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="absolute top-8 -right-4 hidden h-px w-8 bg-white/10 md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
