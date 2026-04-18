"use client";

import { CompetitionCard } from "@/features/competitions/components/competition-card";
import { useCompetitions } from "@/features/competitions/hooks/use-competitions";

export default function CompetitionsPage() {
  const { data, isLoading, error } = useCompetitions();

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Competitions</h1>
        <p className="text-sm text-zinc-500">
          Weekly contests for the community. Submit a post, votes are based on
          likes from other gardeners.
        </p>
      </header>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      {error && <p className="text-sm text-red-600">Failed to load competitions.</p>}

      {data && data.length === 0 && (
        <div className="card p-8 text-center text-sm text-zinc-500">
          No competitions yet. Check back soon.
        </div>
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
