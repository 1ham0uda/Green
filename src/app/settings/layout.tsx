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
    <main className="container max-w-5xl py-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-display-sm font-bold tracking-tight text-ink">
          Settings
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Manage your profile, account, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="card h-fit overflow-hidden p-2">
          {NAV.map((item) => {
            const Ico = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                )}
              >
                <Ico size={16} />
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
