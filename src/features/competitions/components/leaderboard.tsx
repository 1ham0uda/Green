"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/utils/cn";
import {
  useLeaderboard,
  useVoteMutations,
  useVoteStatus,
} from "../hooks/use-competitions";
import type { CompetitionEntry } from "../types";

interface VoteButtonProps {
  competitionId: string;
  entry: CompetitionEntry;
}

function VoteButton({ competitionId, entry }: VoteButtonProps) {
  const { user } = useAuth();
  const { data: voted } = useVoteStatus(competitionId, entry.id);
  const { vote, unvote } = useVoteMutations(competitionId, entry.id);

  const pending = vote.isPending || unvote.isPending;

  function handleClick() {
    if (!user || pending) return;
    if (voted) unvote.mutate();
    else vote.mutate();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!user || pending}
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm font-medium transition",
        voted
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-surface-border bg-white text-zinc-800 hover:border-brand-400",
        (!user || pending) && "cursor-not-allowed opacity-60"
      )}
      aria-pressed={Boolean(voted)}
    >
      {voted ? "Voted" : "Vote"}
    </button>
  );
}

export function Leaderboard({ competitionId }: { competitionId: string }) {
  const { data, isLoading, error } = useLeaderboard(competitionId);

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading leaderboard…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">Failed to load leaderboard.</p>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-zinc-500">
        No entries yet. Be the first to submit!
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {data.map(({ entry, rank }) => (
        <li key={entry.id} className="card flex items-center gap-4 p-4">
          <span className="w-6 text-center text-sm font-semibold text-zinc-500">
            #{rank}
          </span>

          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-brand-50">
            <Image
              src={entry.postImageURL}
              alt={entry.postCaption}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <Link
              href={`/u/${entry.userHandle}`}
              className="text-sm font-semibold text-zinc-900 hover:text-brand-700"
            >
              {entry.userDisplayName}
            </Link>
            {entry.postCaption && (
              <p className="line-clamp-1 text-xs text-zinc-500">
                {entry.postCaption}
              </p>
            )}
            <p className="mt-1 text-xs text-zinc-500">
              {entry.voteCount} votes
            </p>
          </div>

          <VoteButton competitionId={competitionId} entry={entry} />
        </li>
      ))}
    </ol>
  );
}
