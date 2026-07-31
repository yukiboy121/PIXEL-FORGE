import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelForge AI — Turn Every Image Into Its Best Version",
  description:
    "AI-powered image enhancement, color correction, upscaling, and intelligent photo editing. Professional results in seconds.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
