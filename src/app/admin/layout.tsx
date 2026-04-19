"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/admin", label: "Overview", icon: Icon.TrendingUp },
  { href: "/admin/users", label: "Users", icon: Icon.Users },
  { href: "/admin/posts", label: "Posts", icon: Icon.Leaf },
  { href: "/admin/verification", label: "Verification", icon: Icon.Check },
  { href: "/admin/competitions", label: "Competitions", icon: Icon.Trophy },
  { href: "/admin/marketplace", label: "Marketplace", icon: Icon.ShoppingBag },
  { href: "/admin/moderation", label: "Moderation", icon: Icon.Shield },
  { href: "/admin/logs", label: "Logs", icon: Icon.Eye },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGate>
      <div className="container py-6 sm:py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-soft">
            <Icon.Shield size={18} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-ink">Control Panel</h1>
              <Badge variant="red" dot>
                Admin
              </Badge>
            </div>
            <p className="text-xs text-ink-muted">
              Manage your platform with care.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          <nav className="card sticky top-20 h-fit overflow-hidden p-2">
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
      </div>
    </AdminGate>
  );
}
