"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
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
    <main className="flex min-h-screen items-center justify-center bg-editor-bg px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-editor-surface p-7 shadow-2xl">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent"><Sparkles className="h-4 w-4 text-black" /></span>
          <span className="font-bold tracking-tight text-white">PIXEL<span className="text-accent">FORGE</span></span>
        </Link>
        <h1 className="text-xl font-bold text-white">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-white/40">Your projects stay privately on this device.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50" />}
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50" />
          <input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50" />
          {error && <p className="text-sm text-error">{error}</p>}
          <button disabled={isSubmitting} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black disabled:opacity-50">{isSubmitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}</button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-white/20"><span className="h-px flex-1 bg-white/10" />OR<span className="h-px flex-1 bg-white/10" /></div>
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
          <div ref={googleButtonRef} className="flex min-h-10 justify-center" aria-label="Continue with Google" />
        ) : (
          <p className="rounded-lg border border-white/10 px-3 py-2.5 text-center text-xs text-white/35">Google sign-in will be available after the Client ID is configured and deployed.</p>
        )}
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && !googleReady && <p className="mt-2 text-center text-xs text-white/35">Loading Google sign-in…</p>}
        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="mt-5 w-full text-sm text-white/50 hover:text-white">
          {mode === "login" ? "Need an account? Register" : "Already have an account? Log in"}
        </button>
        <p className="mt-6 border-t border-white/5 pt-4 text-center text-xs text-white/25">Accounts and projects stay on this browser. Google sign-in can be enabled free with a Client ID.</p>
      </div>
    </main>
  );
}
