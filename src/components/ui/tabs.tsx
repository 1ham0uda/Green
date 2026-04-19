"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface Tab {
  id: string;
  label: string;
  count?: number | null;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "underline" | "pill";
}

export function Tabs({
  tabs,
  active,
  onChange,
  className,
  variant = "underline",
}: TabsProps) {
  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-2xl border border-surface-border bg-surface p-1 shadow-soft",
          className
        )}
      >
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                "relative rounded-xl px-4 py-1.5 text-sm font-medium transition-colors",
                isActive ? "text-ink" : "text-ink-muted hover:text-ink"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="pill-active"
                  className="absolute inset-0 rounded-xl bg-brand-50"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {t.icon}
                {t.label}
                {t.count != null && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0 text-[10px]",
                      isActive
                        ? "bg-brand-100 text-brand-700"
                        : "bg-surface-subtle text-ink-muted"
                    )}
                  >
                    {t.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={cn(
        "relative flex items-center gap-0 border-b border-surface-border",
        className
      )}
    >
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium capitalize transition-colors",
              isActive
                ? "text-brand-600"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {t.icon}
            {t.label}
            {t.count != null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0 text-[10px]",
                  isActive
                    ? "bg-brand-100 text-brand-700"
                    : "bg-surface-subtle text-ink-muted"
                )}
              >
                {t.count}
              </span>
            )}
            {isActive && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-brand"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
