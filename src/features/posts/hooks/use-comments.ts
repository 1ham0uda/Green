"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { addComment, fetchComments } from "../services/post-service";

export function useComments(postId: string | null | undefined) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId as string),
    enabled: Boolean(postId),
  });
}

export function useAddComment(postId: string, postAuthorId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => {
      if (!user) throw new Error("Must be signed in");
      return addComment(postId, user, body, postAuthorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function usePostById(postId: string | null | undefined) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { fetchPostById } = await import("../services/post-service");
      return fetchPostById(postId as string);
    },
    enabled: Boolean(postId),
  });
}
