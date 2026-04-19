import type { ReactNode } from "react";
import Link from "next/link";
import { AdminGate } from "@/features/admin/components/admin-gate";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/competitions", label: "Competitions" },
  { href: "/admin/marketplace", label: "Marketplace" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/logs", label: "Logs" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGate>
      <div className="container py-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-red-700">
            Admin
          </span>
          <h1 className="text-xl font-bold text-zinc-900">Control Panel</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          <nav className="card h-fit divide-y divide-surface-border overflow-hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 text-sm text-zinc-700 transition hover:bg-surface-muted hover:text-brand-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div>{children}</div>
        </div>
      </div>
    </AdminGate>
  );
}
