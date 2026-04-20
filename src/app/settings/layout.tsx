"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/settings/profile", label: "Profile", icon: Icon.User },
  { href: "/settings/account", label: "Account", icon: Icon.Shield },
  { href: "/settings/verification", label: "Verification", icon: Icon.Check },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="container max-w-5xl pb-24 md:pb-0">
      <div className="py-5">
        <p className="eyebrow">Account</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="h-fit rounded-2xl border border-surface-border bg-surface p-1.5">
          {NAV.map((item) => {
            const Ico = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 font-sans text-[13px] font-medium transition-colors",
                  active
                    ? "bg-surface-subtle text-ink"
                    : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                )}
              >
                <Ico size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
