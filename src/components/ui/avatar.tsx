"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  ring?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { className: "h-6 w-6 text-[10px]", px: 24 },
  sm: { className: "h-8 w-8 text-xs", px: 32 },
  md: { className: "h-10 w-10 text-sm", px: 40 },
  lg: { className: "h-14 w-14 text-base", px: 56 },
  xl: { className: "h-20 w-20 text-xl", px: 80 },
  "2xl": { className: "h-28 w-28 text-3xl", px: 112 },
};

export function Avatar({
  src,
  name,
  size = "md",
  ring = false,
  className,
}: AvatarProps) {
  const spec = SIZE_MAP[size];
  const initial = (name?.[0] ?? "?").toUpperCase();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-gradient-brand-soft",
        spec.className,
        ring &&
          "ring-2 ring-surface ring-offset-2 ring-offset-brand-500/30",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={spec.px}
          height={spec.px}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-semibold text-brand-800">
          {initial}
        </div>
      )}
    </div>
  );
}
