"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMutedUserIds, muteUser, unmuteUser } from "../services/mute-service";

export function useMutedUserIds(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["muted-users", userId],
    queryFn: () => fetchMutedUserIds(userId as string),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}

export function useMuteUser(muterId: string | null | undefined, mutedId: string) {
  const qc = useQueryClient();

  const mute = useMutation({
    mutationFn: () => muteUser(muterId as string, mutedId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["muted-users", muterId] });
    },
  });

  const unmute = useMutation({
    mutationFn: () => unmuteUser(muterId as string, mutedId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["muted-users", muterId] });
    },
  });

  return { mute, unmute };
}
