import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { NavBar } from "@/components/layout/nav-bar";
import { PageTransition } from "@/components/layout/page-transition";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Green — Urban Gardening Community",
    template: "%s · Green",
  },
  description:
    "A niche social platform for urban gardeners. Grow plants in small spaces and share your journey.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <Providers>
          <div className="relative min-h-screen pb-20 md:pb-0">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-mesh opacity-40" />
            <NavBar />
            <PageTransition>{children}</PageTransition>
          </div>
        </Providers>
      </body>
    </html>
  );
}
