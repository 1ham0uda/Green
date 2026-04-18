"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  followUser,
  isFollowing,
  unfollowUser,
} from "../services/profile-service";

export function useFollowStatus(
  followerId: string | null | undefined,
  followingId: string | null | undefined
) {
  return useQuery({
    queryKey: ["follow-status", followerId, followingId],
    queryFn: () => isFollowing(followerId as string, followingId as string),
    enabled: Boolean(followerId && followingId && followerId !== followingId),
  });
}

export function useFollowMutations(
  followerId: string | null | undefined,
  followingId: string | null | undefined
) {
  const queryClient = useQueryClient();

  function invalidate() {
    queryClient.invalidateQueries({
      queryKey: ["follow-status", followerId, followingId],
    });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  const follow = useMutation({
    mutationFn: () => followUser(followerId as string, followingId as string),
    onSuccess: invalidate,
  });

  const unfollow = useMutation({
    mutationFn: () => unfollowUser(followerId as string, followingId as string),
    onSuccess: invalidate,
  });

  return { follow, unfollow };
}
