"use client";

import { useQuery } from "@tanstack/react-query";
import { getProfileByHandle, getProfileById } from "../services/profile-service";

export function useProfileByHandle(handle: string | null | undefined) {
  return useQuery({
    queryKey: ["profile", "handle", handle],
    queryFn: () => getProfileByHandle(handle as string),
    enabled: Boolean(handle),
  });
}

export function useProfileById(uid: string | null | undefined) {
  return useQuery({
    queryKey: ["profile", "id", uid],
    queryFn: () => getProfileById(uid as string),
    enabled: Boolean(uid),
  });
}
