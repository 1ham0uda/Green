import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { NavBar } from "@/components/layout/nav-bar";
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
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
