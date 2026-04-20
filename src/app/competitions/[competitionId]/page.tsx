"use client";

import Image from "next/image";
import { Leaderboard } from "@/features/competitions/components/leaderboard";
import { SubmitEntryButton } from "@/features/competitions/components/submit-entry-button";
import { useCompetition } from "@/features/competitions/hooks/use-competitions";

interface PageProps {
  params: { competitionId: string };
}

export default function CompetitionDetailPage({ params }: PageProps) {
  const { competitionId } = params;
  const { data: competition, isLoading, error } = useCompetition(competitionId);

  return (
    <main className="container max-w-3xl pb-24 md:pb-0">
      {isLoading && <div className="skeleton mt-8 h-64 w-full rounded-2xl" />}
      {error && <p className="mt-8 font-sans text-[13px] text-red-600">Failed to load.</p>}
      {!isLoading && !competition && (
        <p className="mt-8 font-sans text-[13px] text-ink-muted">Competition not found.</p>
      )}

      {competition && (
        <div className="space-y-6 pt-6">
          <section className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
            {competition.coverImageURL && (
              <div className="relative aspect-video w-full bg-surface-subtle">
                <Image
                  src={competition.coverImageURL}
                  alt={competition.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <span className="badge badge-brand mb-3 capitalize">{competition.status}</span>
              <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
                {competition.title}
              </h1>
              {competition.description && (
                <p className="mt-2 font-sans text-[14px] leading-relaxed text-ink-soft">
                  {competition.description}
                </p>
              )}
            </div>
          </section>

          {competition.status === "active" && (
            <section className="space-y-3">
              <p className="eyebrow">Enter</p>
              <SubmitEntryButton competitionId={competition.id} />
            </section>
          )}

          <section className="space-y-4">
            <p className="eyebrow">Leaderboard</p>
            <Leaderboard competitionId={competition.id} />
          </section>
        </div>
      )}
    </main>
  );
}
