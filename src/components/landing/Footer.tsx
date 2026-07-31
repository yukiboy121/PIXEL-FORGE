"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* CTA */}
        <div className="mb-16 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to enhance your images?</h2>
          <p className="mt-3 text-white/40">Start editing for free. No account required.</p>
          <Link
            href="/editor"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-accent-hover"
          >
            Open Editor
          </Link>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
              <Sparkles className="h-3.5 w-3.5 text-black" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              PIXEL<span className="text-accent">FORGE</span>
            </span>
          </div>
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} PixelForge | Dev By Mr.YuKi
          </p>
        </div>
      </div>
    </footer>
  );
}
