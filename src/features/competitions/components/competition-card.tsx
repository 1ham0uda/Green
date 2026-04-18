"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { Competition } from "../types";

const STATUS_STYLES: Record<Competition["status"], string> = {
  upcoming: "bg-amber-100 text-amber-800",
  active: "bg-brand-100 text-brand-800",
  closed: "bg-zinc-100 text-zinc-700",
};

function formatRange(comp: Competition): string {
  const start = comp.startsAt?.toDate();
  const end = comp.endsAt?.toDate();
  const fmt = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });
  if (start && end) return `${fmt.format(start)} – ${fmt.format(end)}`;
  if (start) return `Starts ${fmt.format(start)}`;
  return "TBD";
}

export function CompetitionCard({ competition }: { competition: Competition }) {
  return (
    <Link
      href={`/competitions/${competition.id}`}
      className="card block overflow-hidden transition hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full bg-brand-50">
        {competition.coverImageURL ? (
          <Image
            src={competition.coverImageURL}
            alt={competition.title}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            🏆
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
              STATUS_STYLES[competition.status]
            )}
          >
            {competition.status}
          </span>
          <span className="text-xs text-zinc-500">{formatRange(competition)}</span>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900">
          {competition.title}
        </h3>
        {competition.description && (
          <p className="line-clamp-2 text-sm text-zinc-600">
            {competition.description}
          </p>
        )}
        <p className="text-xs text-zinc-500">
          {competition.entryCount} entries
        </p>
      </div>
    </Link>
  );
}
