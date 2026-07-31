"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            PIXEL<span className="text-accent">FORGE</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-white/60 transition hover:text-white">Features</a>
          <a href="#how-it-works" className="text-sm text-white/60 transition hover:text-white">How It Works</a>
          <a href="#pricing" className="text-sm text-white/60 transition hover:text-white">Pricing</a>
          <a href="#faq" className="text-sm text-white/60 transition hover:text-white">FAQ</a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/dashboard"
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-black transition hover:bg-accent-hover"
          >
            Start Editing
          </Link>
        </div>

        <button
          className="md:hidden text-white/60"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/5 bg-black/95 px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-4">
            <a href="#features" className="text-sm text-white/60" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-sm text-white/60" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#pricing" className="text-sm text-white/60" onClick={() => setMenuOpen(false)}>Pricing</a>
            <Link
              href="/dashboard"
              className="mt-2 rounded-lg bg-accent px-5 py-2.5 text-center text-sm font-semibold text-black"
              onClick={() => setMenuOpen(false)}
            >
              Start Editing
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
