"use client";

import dynamic from "next/dynamic";

const Header = dynamic(() => import("@/components/landing/Header"), { ssr: false });
const Hero = dynamic(() => import("@/components/landing/Hero"), { ssr: false });
const Features = dynamic(() => import("@/components/landing/Features"), { ssr: false });
const HowItWorks = dynamic(() => import("@/components/landing/HowItWorks"), { ssr: false });
const Pricing = dynamic(() => import("@/components/landing/Pricing"), { ssr: false });
const FAQ = dynamic(() => import("@/components/landing/FAQ"), { ssr: false });
const Footer = dynamic(() => import("@/components/landing/Footer"), { ssr: false });

export default function LandingPage() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
