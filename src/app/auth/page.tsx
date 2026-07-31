"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LockKeyhole, Sparkles } from "lucide-react";
import { register, signIn, signInWithGoogle } from "@/lib/local-auth";

type GoogleIdentity = {
  accounts: { id: {
    initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
    renderButton: (parent: HTMLElement, options: { theme: "outline"; size: "large"; width: number; text: "continue_with" }) => void;
  } };
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const configureGoogle = () => {
      const google = (window as Window & { google?: GoogleIdentity }).google;
      if (!google || !googleButtonRef.current) return;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          try {
            const payload = credential.split(".")[1];
            if (!payload) throw new Error("Missing Google profile");
            const decodedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
            const profile = JSON.parse(decodeURIComponent(Array.from(atob(decodedPayload), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""))) as { email: string; name: string };
            signInWithGoogle(profile.name, profile.email);
            router.replace("/dashboard");
          } catch { setError("Google returned an invalid sign-in response. Please try again."); }
        },
      });
      googleButtonRef.current.replaceChildren();
      google.accounts.id.renderButton(googleButtonRef.current, { theme: "outline", size: "large", width: 372, text: "continue_with" });
      setGoogleReady(true);
    };

    if ((window as Window & { google?: GoogleIdentity }).google) {
      configureGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = configureGoogle;
      script.onerror = () => setError("Google sign-in could not load. Check your internet connection or ad blocker.");
      document.head.appendChild(script);
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (mode === "register") await register(name, email, password);
      else await signIn(email, password);
      router.replace("/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-5 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(244, 124, 48, 0.18), transparent 35%), radial-gradient(circle at 0% 100%, rgba(244, 124, 48, 0.07), transparent 30%)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#131313]/95 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-9">
        <Link href="/" className="mb-9 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shadow-[0_8px_24px_rgba(244,124,48,0.3)]"><Sparkles className="h-4 w-4 text-black" /></span>
          <span className="font-bold tracking-tight text-white">PIXEL<span className="text-accent">FORGE</span></span>
        </Link>
        <div className="mb-7">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">PixelForge workspace</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/45">{mode === "login" ? "Continue enhancing your images." : "Start editing your images privately."}</p>
        </div>
        <form className="space-y-3.5" onSubmit={handleSubmit}>
          {mode === "register" && <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-accent/60 focus:bg-black/30" />}
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-accent/60 focus:bg-black/30" />
          <input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-accent/60 focus:bg-black/30" />
          {error && <p className="text-sm text-error">{error}</p>}
          <button disabled={isSubmitting} className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-black shadow-[0_8px_22px_rgba(244,124,48,0.2)] transition hover:bg-accent-hover hover:shadow-[0_8px_28px_rgba(244,124,48,0.32)] disabled:opacity-50">{isSubmitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}</button>
        </form>
        <div className="my-6 flex items-center gap-3 text-[10px] font-medium tracking-[0.16em] text-white/25"><span className="h-px flex-1 bg-white/10" />OR CONTINUE WITH<span className="h-px flex-1 bg-white/10" /></div>
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
          <div ref={googleButtonRef} className="flex min-h-10 justify-center" aria-label="Continue with Google" />
        ) : (
          <p className="rounded-lg border border-white/10 px-3 py-2.5 text-center text-xs text-white/35">Google sign-in will be available after the Client ID is configured and deployed.</p>
        )}
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && !googleReady && <p className="mt-2 text-center text-xs text-white/35">Loading Google sign-in…</p>}
        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="mt-6 w-full text-sm text-white/45 transition hover:text-white">
          {mode === "login" ? "Need an account? Register" : "Already have an account? Log in"}
        </button>
        <div className="mt-7 flex items-start gap-2.5 border-t border-white/5 pt-5 text-xs leading-relaxed text-white/30"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/80" /><p><span className="font-medium text-white/45">Private by design.</span> Your account and image projects stay on this browser.</p></div>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-white/20"><Check className="h-3 w-3 text-accent/70" />No cloud photo uploads</div>
      </div>
    </main>
  );
}
