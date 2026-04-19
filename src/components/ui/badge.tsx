import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant =
  | "brand"
  | "amber"
  | "red"
  | "zinc"
  | "blue"
  | "violet"
  | "success";

const VARIANTS: Record<Variant, string> = {
  brand: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200/60",
  amber: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/60",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200/60",
  zinc: "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-200/60",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200/60",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200/60",
  success:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/60",
};

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = "zinc",
  className,
  dot,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
