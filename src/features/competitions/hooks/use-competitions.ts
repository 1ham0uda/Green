"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  castVote,
  fetchCompetitionById,
  fetchCompetitions,
  fetchLeaderboard,
  hasVoted,
  removeVote,
  submitEntry,
} from "../services/competition-service";

export function useCompetitions() {
  return useQuery({
    queryKey: ["competitions"],
    queryFn: fetchCompetitions,
  });
}

export function useCompetition(competitionId: string | null | undefined) {
  return useQuery({
    queryKey: ["competition", competitionId],
    queryFn: () => fetchCompetitionById(competitionId as string),
    enabled: Boolean(competitionId),
  });
}

export function useLeaderboard(competitionId: string | null | undefined) {
  return useQuery({
    queryKey: ["competition-leaderboard", competitionId],
    queryFn: () => fetchLeaderboard(competitionId as string),
    enabled: Boolean(competitionId),
  });
}

export function useSubmitEntry(competitionId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => {
      if (!user) throw new Error("Must be signed in");
      return submitEntry(competitionId, user, postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["competition-leaderboard", competitionId],
      });
      queryClient.invalidateQueries({ queryKey: ["competition", competitionId] });
    },
  });
}

export function useVoteStatus(competitionId: string, entryId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["vote-status", competitionId, entryId, user?.uid],
    queryFn: () => hasVoted(competitionId, entryId, user!.uid),
    enabled: Boolean(user?.uid),
  });
}

export function useVoteMutations(competitionId: string, entryId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  function invalidate() {
    queryClient.invalidateQueries({
      queryKey: ["vote-status", competitionId, entryId, user?.uid],
    });
    queryClient.invalidateQueries({
      queryKey: ["competition-leaderboard", competitionId],
    });
  }

  const vote = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Must be signed in");
      return castVote(competitionId, entryId, user.uid);
    },
    onSuccess: invalidate,
  });

  const unvote = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Must be signed in");
      return removeVote(competitionId, entryId, user.uid);
    },
    onSuccess: invalidate,
  });

  return { vote, unvote };
}
