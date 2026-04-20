"use client";

import { CompetitionCard } from "@/features/competitions/components/competition-card";
import { useCompetitions } from "@/features/competitions/hooks/use-competitions";

export default function CompetitionsPage() {
  const { data, isLoading, error } = useCompetitions();

  return (
    <main className="container max-w-5xl pb-24 md:pb-0">
      <header className="py-5">
        <p className="eyebrow">Community</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Competitions
        </h1>
        <p className="mt-1 font-sans text-[13px] text-ink-muted">
          Weekly contests. Submit a post — votes are based on likes.
        </p>
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      )}

      {error && <p className="font-sans text-[13px] text-red-600">Failed to load competitions.</p>}

      {data && data.length === 0 && (
        <p className="font-sans text-[13px] text-ink-muted">No competitions yet. Check back soon.</p>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((competition) => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))}
        </div>
      )}
    </main>
  );
}
