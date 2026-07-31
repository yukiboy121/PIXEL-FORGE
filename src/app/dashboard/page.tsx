"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, Image as ImageIcon, Clock, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { getSession, signOut, type LocalUser } from "@/lib/local-auth";
import { listLocalProjects, type LocalProject } from "@/lib/local-projects";

function relativeDate(timestamp: number) {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [projects, setProjects] = useState<LocalProject[]>([]);

  useEffect(() => {
    const currentUser = getSession();
    if (!currentUser) { router.replace("/auth"); return; }
    setUser(currentUser);
    listLocalProjects().then(setProjects).catch(() => setProjects([]));
  }, [router]);

  if (!user) return null;
  const lastActivity = projects[0] ? relativeDate(projects[0].updatedAt) : "No activity";

  return (
    <div className="min-h-screen bg-editor-bg">
      <header className="border-b border-editor-border bg-editor-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent"><Sparkles className="h-4 w-4 text-black" /></span><span className="text-lg font-bold tracking-tight text-white">PIXEL<span className="text-accent">FORGE</span></span></Link>
          <div className="flex items-center gap-3"><span className="hidden text-xs text-white/40 sm:block">{user.name}</span><button onClick={() => { signOut(); router.replace("/auth"); }} className="rounded-md p-2 text-white/40 hover:bg-white/5 hover:text-white" title="Log out"><LogOut className="h-4 w-4" /></button><Link href="/editor" className="flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-black transition hover:bg-accent-hover"><Plus className="h-4 w-4" />New Project</Link></div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><h1 className="text-2xl font-bold text-white">Dashboard</h1><p className="mt-1 text-sm text-white/40">Your projects are stored only in this browser.</p></motion.div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link href="/editor" className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-white/10 hover:bg-white/[0.04]"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10"><Plus className="h-6 w-6 text-accent" /></span><span><span className="block text-sm font-semibold text-white">New Project</span><span className="text-xs text-white/40">Upload and enhance an image</span></span></Link>
          <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5"><ImageIcon className="h-6 w-6 text-white/30" /></span><span><span className="block text-sm font-semibold text-white">{projects.length}</span><span className="text-xs text-white/40">Total Projects</span></span></div>
          <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5"><Clock className="h-6 w-6 text-white/30" /></span><span><span className="block text-sm font-semibold text-white">{lastActivity}</span><span className="text-xs text-white/40">Last Activity</span></span></div>
        </div>
        <section className="mt-10"><h2 className="mb-4 text-sm font-semibold text-white/60">Recent Projects</h2>{projects.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-white/35">No projects yet. <Link className="text-accent hover:underline" href="/editor">Create your first project</Link>.</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{projects.map((project, index) => <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}><Link href={`/editor?project=${project.id}`} className="group block overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] transition hover:border-white/10"><img className="aspect-[4/3] w-full object-cover" src={project.thumbnail} alt="" /><div className="p-4"><h3 className="truncate text-sm font-medium text-white/70 group-hover:text-white">{project.name}</h3><div className="mt-1 flex justify-between"><span className="text-[11px] text-white/30">{relativeDate(project.updatedAt)}</span><span className="text-[10px] font-mono text-white/20">{project.originalWidth} × {project.originalHeight}</span></div></div></Link></motion.div>)}</div>}</section>
      </main>
    </div>
  );
}
