"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  createGroup,
  createGroupPost,
  fetchGroupById,
  fetchGroupMembers,
  fetchGroupPosts,
  fetchPublicGroups,
  fetchUserGroups,
  isMember,
  joinGroup,
  leaveGroup,
} from "../services/group-service";
import type { CreateGroupInput } from "../types";

export function usePublicGroups() {
  return useQuery({
    queryKey: ["groups", "public"],
    queryFn: fetchPublicGroups,
    staleTime: 60_000,
  });
}

export function useUserGroups() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["groups", "user", user?.uid],
    queryFn: () => fetchUserGroups(user!.uid),
    enabled: Boolean(user?.uid),
  });
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId],
    queryFn: () => fetchGroupById(groupId),
    enabled: Boolean(groupId),
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "members"],
    queryFn: () => fetchGroupMembers(groupId),
    enabled: Boolean(groupId),
  });
}

export function useGroupPosts(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "posts"],
    queryFn: () => fetchGroupPosts(groupId),
    enabled: Boolean(groupId),
  });
}

export function useMemberStatus(groupId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["groups", groupId, "member", user?.uid],
    queryFn: () => isMember(groupId, user!.uid),
    enabled: Boolean(user?.uid && groupId),
  });
}

export function useCreateGroup() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGroupInput) => {
      if (!user) throw new Error("Must be signed in");
      return createGroup(user, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useJoinGroup(groupId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Must be signed in");
      return joinGroup(groupId, user);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", groupId] });
      qc.invalidateQueries({ queryKey: ["groups", "user"] });
    },
  });
}

export function useLeaveGroup(groupId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Must be signed in");
      return leaveGroup(groupId, user.uid);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", groupId] });
      qc.invalidateQueries({ queryKey: ["groups", "user"] });
    },
  });
}

export function useCreateGroupPost(groupId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      imageFiles,
      caption,
    }: {
      imageFiles: File[];
      caption: string;
    }) => {
      if (!user) throw new Error("Must be signed in");
      return createGroupPost(groupId, user, imageFiles, caption);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", groupId, "posts"] });
      qc.invalidateQueries({ queryKey: ["groups", groupId] });
    },
  });
}
