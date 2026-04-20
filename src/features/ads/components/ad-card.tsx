"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRecordImpression } from "../hooks/use-ads";
import type { Ad } from "../types";

interface AdCardProps {
  ad: Ad;
}

export function AdCard({ ad }: AdCardProps) {
  const record = useRecordImpression();
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    record.mutate(ad.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad.id]);

  const content = (
    <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white shadow-sm">
      {ad.imageURL && (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={ad.imageURL}
            alt={ad.headline}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
            Sponsored
          </span>
          <span className="text-xs text-zinc-400">{ad.vendorDisplayName}</span>
        </div>
        <p className="font-semibold text-zinc-900">{ad.headline}</p>
        {ad.body && <p className="mt-1 text-sm text-zinc-600">{ad.body}</p>}
        {ad.linkURL && (
          <span className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">
            Learn more →
          </span>
        )}
      </div>
    </div>
  );

  if (ad.linkURL) {
    return (
      <a href={ad.linkURL} target="_blank" rel="noopener noreferrer sponsored">
        {content}
      </a>
    );
  }

  return content;
}
