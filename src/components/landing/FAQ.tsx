"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What types of images does PixelForge support?",
    a: "PixelForge supports JPEG, PNG, and WebP formats. You can upload images up to 50MB in size.",
  },
  {
    q: "Is the AI processing done on my device or in the cloud?",
    a: "Basic adjustments and AI analysis are performed locally in your browser for speed and privacy. Advanced features like HD upscaling use our secure server-side pipeline.",
  },
  {
    q: "Will my original image be modified?",
    a: "Never. PixelForge uses a non-destructive editing pipeline. Your original image is always preserved, and every edit can be undone.",
  },
  {
    q: "How does the AI Auto Edit work?",
    a: "Our AI analyzes your image's exposure, color balance, sharpness, noise, and dynamic range, then intelligently applies corrections to produce a natural, professional result.",
  },
  {
    q: "What's the difference between standard upscale and AI upscale?",
    a: "Standard upscale uses Lanczos interpolation for clean resizing. AI upscale uses neural network models to reconstruct detail and texture that standard algorithms can't recover.",
  },
  {
    q: "Can I use PixelForge for commercial work?",
    a: "Yes. All images processed through PixelForge remain yours. There are no licensing restrictions on your enhanced images.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">FAQ</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
        </motion.div>

        <div className="mt-12 space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/5 bg-white/[0.02]"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="pr-4 text-sm font-medium">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-white/30 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm leading-relaxed text-white/40">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
