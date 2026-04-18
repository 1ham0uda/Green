"use client";

import Image from "next/image";
import { use } from "react";
import { Leaderboard } from "@/features/competitions/components/leaderboard";
import { SubmitEntryButton } from "@/features/competitions/components/submit-entry-button";
import { useCompetition } from "@/features/competitions/hooks/use-competitions";

interface PageProps {
  params: Promise<{ competitionId: string }>;
}

export default function CompetitionDetailPage({ params }: PageProps) {
  const { competitionId } = use(params);
  const { data: competition, isLoading, error } = useCompetition(competitionId);

  return (
    <main className="container max-w-3xl py-8">
      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">Failed to load.</p>}
      {!isLoading && !competition && (
        <p className="text-sm text-zinc-500">Competition not found.</p>
      )}

      {competition && (
        <div className="space-y-6">
          <section className="card overflow-hidden">
            {competition.coverImageURL && (
              <div className="relative aspect-video w-full bg-brand-50">
                <Image
                  src={competition.coverImageURL}
                  alt={competition.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="space-y-2 p-6">
              <span className="inline-block rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium capitalize text-brand-800">
                {competition.status}
              </span>
              <h1 className="text-2xl font-semibold text-zinc-900">
                {competition.title}
              </h1>
              {competition.description && (
                <p className="text-sm text-zinc-700">{competition.description}</p>
              )}
            </div>
          </section>

          {competition.status === "active" && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-zinc-900">
                Enter the competition
              </h2>
              <SubmitEntryButton competitionId={competition.id} />
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Leaderboard</h2>
            <Leaderboard competitionId={competition.id} />
          </section>
        </div>
      )}
    </main>
  );
}
