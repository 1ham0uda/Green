import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: "brand" | "amber" | "red" | "zinc" | "blue" | "violet";
  icon?: ReactNode;
  trend?: { value: string; positive?: boolean };
}

const ACCENTS = {
  brand: {
    bg: "from-brand-500/10 to-brand-500/0",
    text: "text-brand-700",
    iconBg: "bg-brand-100 text-brand-700",
  },
  amber: {
    bg: "from-amber-500/10 to-amber-500/0",
    text: "text-amber-700",
    iconBg: "bg-amber-100 text-amber-700",
  },
  red: {
    bg: "from-red-500/10 to-red-500/0",
    text: "text-red-700",
    iconBg: "bg-red-100 text-red-700",
  },
  zinc: {
    bg: "from-zinc-500/5 to-zinc-500/0",
    text: "text-zinc-700",
    iconBg: "bg-zinc-100 text-zinc-700",
  },
  blue: {
    bg: "from-blue-500/10 to-blue-500/0",
    text: "text-blue-700",
    iconBg: "bg-blue-100 text-blue-700",
  },
  violet: {
    bg: "from-violet-500/10 to-violet-500/0",
    text: "text-violet-700",
    iconBg: "bg-violet-100 text-violet-700",
  },
};

export function StatCard({
  label,
  value,
  accent = "zinc",
  icon,
  trend,
}: StatCardProps) {
  const a = ACCENTS[accent];
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-surface-border bg-surface p-5 shadow-card transition-all hover:shadow-elevated"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          a.bg
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight text-ink tabular-nums">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.positive !== false ? "text-emerald-600" : "text-red-600"
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              a.iconBg
            )}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
