"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    desc: "Try PixelForge with essential features",
    features: [
      "AI Auto Edit",
      "Basic adjustments",
      "Standard export (JPEG)",
      "Before/After comparison",
      "3 images per session",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    desc: "Full access for professionals",
    features: [
      "Everything in Free",
      "HD Upscale (up to 4×)",
      "AI Color Balance",
      "AI Lighting Correction",
      "Smart Presets",
      "PNG & WebP export",
      "Unlimited images",
      "Priority processing",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Studio",
    price: "$49",
    period: "/mo",
    desc: "For teams and high-volume workflows",
    features: [
      "Everything in Pro",
      "8× upscaling",
      "Batch processing",
      "API access",
      "Custom presets",
      "Cloud project storage",
      "Team collaboration",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Pricing</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/40">
            Start free. Upgrade when you need more power.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-accent/30 bg-accent/[0.04]"
                  : "border-white/5 bg-white/[0.02]"
              }`}
            >
              {plan.highlighted && (
                <div className="mb-4 inline-block rounded-full bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-sm text-white/40">{plan.period}</span>}
              </div>
              <p className="mt-2 text-sm text-white/40">{plan.desc}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/editor"
                className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-accent text-black hover:bg-accent-hover"
                    : "border border-white/10 text-white hover:border-white/20"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
