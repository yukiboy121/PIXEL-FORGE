"use client";

import Link from "next/link";
import { Sparkles, Plus, Image as ImageIcon, Clock } from "lucide-react";
import { motion } from "framer-motion";

const recentProjects = [
  { id: 1, name: "Portrait Enhancement", date: "2 hours ago", resolution: "4032 × 3024" },
  { id: 2, name: "Product Photo", date: "Yesterday", resolution: "3840 × 2160" },
  { id: 3, name: "Night Photography", date: "3 days ago", resolution: "6000 × 4000" },
  { id: 4, name: "Instagram Edit", date: "1 week ago", resolution: "1080 × 1080" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-editor-bg">
      {/* Header */}
      <header className="border-b border-editor-border bg-editor-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Sparkles className="h-4 w-4 text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              PIXEL<span className="text-accent">FORGE</span>
            </span>
          </Link>
          <Link
            href="/editor"
            className="flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-black transition hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-white/40">Your recent image projects</p>
        </motion.div>

        {/* Quick actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/editor"
            className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-white/10 hover:bg-white/[0.04]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Plus className="h-6 w-6 text-accent" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">New Project</div>
              <div className="text-xs text-white/40">Upload and enhance an image</div>
            </div>
          </Link>
          <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
              <ImageIcon className="h-6 w-6 text-white/30" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">4</div>
              <div className="text-xs text-white/40">Total Projects</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
              <Clock className="h-6 w-6 text-white/30" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">2h ago</div>
              <div className="text-xs text-white/40">Last Activity</div>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-semibold text-white/60">Recent Projects</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href="/editor"
                  className="group block overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] transition hover:border-white/10"
                >
                  <div className="flex aspect-[4/3] items-center justify-center bg-editor-bg">
                    <ImageIcon className="h-8 w-8 text-white/10" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white/70 group-hover:text-white">
                      {project.name}
                    </h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[11px] text-white/30">{project.date}</span>
                      <span className="text-[10px] font-mono text-white/20">{project.resolution}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
