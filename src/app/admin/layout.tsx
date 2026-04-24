"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/admin", label: "Overview", icon: Icon.TrendingUp },
  { href: "/admin/users", label: "Users", icon: Icon.Users },
  { href: "/admin/posts", label: "Posts", icon: Icon.Leaf },
  { href: "/admin/verification", label: "Verification", icon: Icon.Check },
  { href: "/admin/competitions", label: "Competitions", icon: Icon.Trophy },
  { href: "/admin/marketplace", label: "Marketplace", icon: Icon.ShoppingBag },
  { href: "/admin/returns", label: "Returns", icon: Icon.RotateCcw },
  { href: "/admin/ads", label: "Ads", icon: Icon.Megaphone },
  { href: "/admin/moderation", label: "Moderation", icon: Icon.Shield },
  { href: "/admin/logs", label: "Logs", icon: Icon.Eye },
  { href: "/admin/announcements", label: "Announcements", icon: Icon.Bell },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGate>
      <div className="container py-6 sm:py-10">
        <div className="mb-6 flex items-center gap-3 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
            <Icon.Shield size={16} />
          </span>
          <div>
            <h1 className="font-serif text-[22px] font-normal leading-tight tracking-[-0.02em] text-ink">
              Control Panel
            </h1>
            <p className="font-sans text-[11px] uppercase tracking-eyebrow text-ink-muted">
              Admin
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          <nav className="sticky top-20 h-fit rounded-2xl border border-surface-border bg-surface p-1.5">
            {NAV.map((item) => {
              const Ico = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname?.startsWith(item.href));
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
      </div>
    </AdminGate>
  );
}
