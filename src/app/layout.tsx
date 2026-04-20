import type { Metadata } from "next";
import { Newsreader, DM_Sans, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { NavBar } from "@/components/layout/nav-bar";
import { PageTransition } from "@/components/layout/page-transition";
import { AnnouncementBanner } from "@/features/announcements/components/announcement-banner";
import { Providers } from "./providers";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Green — Urban Gardening Community",
    template: "%s · Green",
  },
  description:
    "A quiet, premium social platform for urban gardeners. Grow plants in small spaces and share your journey.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans">
        <Providers>
          <div className="relative min-h-screen">
            <AnnouncementBanner />
            <NavBar />
            <PageTransition>{children}</PageTransition>
          </div>
        </Providers>
      </body>
    </html>
  );
}
