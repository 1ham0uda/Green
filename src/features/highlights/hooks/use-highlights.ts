"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  createHighlight,
  deleteHighlight,
  fetchHighlightsByUser,
} from "../services/highlight-service";
import type { CreateHighlightInput } from "../types";

export function useHighlights(uid: string | null | undefined) {
  return useQuery({
    queryKey: ["highlights", uid],
    queryFn: () => fetchHighlightsByUser(uid as string),
    enabled: Boolean(uid),
  });
}

export function useCreateHighlight() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHighlightInput) => {
      if (!user) throw new Error("Must be signed in");
      return createHighlight(user.uid, input);
    },
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: ["highlights", user.uid] });
    },
  });
}

export function useDeleteHighlight(ownerUid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (highlightId: string) => deleteHighlight(highlightId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["highlights", ownerUid] });
    },
  });
}
