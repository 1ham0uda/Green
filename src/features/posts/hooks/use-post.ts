"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  createPost,
  deletePost,
  fetchPostsByAuthor,
  hasLiked,
  likePost,
  tagPostPlant,
  unlikePost,
} from "../services/post-service";
import type { CreatePostInput } from "../types";

export function useAuthorPosts(
  authorId: string | null | undefined,
  { approvedOnly = false }: { approvedOnly?: boolean } = {}
) {
  return useQuery({
    queryKey: ["posts", "author", authorId, { approvedOnly }],
    queryFn: () => fetchPostsByAuthor(authorId as string, { approvedOnly }),
    enabled: Boolean(authorId),
  });
}

export function useCreatePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => {
      if (!user) throw new Error("Must be signed in to post");
      return createPost(user, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      if (user) {
        queryClient.invalidateQueries({
          queryKey: ["posts", "author", user.uid],
        });
      }
    },
  });
}

export function useLikeStatus(postId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["like", postId, user?.uid],
    queryFn: () => hasLiked(postId, user!.uid),
    enabled: Boolean(user?.uid),
  });
}

export function useLikeMutations(postId: string, postAuthorId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["like", postId, user?.uid] });
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  }

  const like = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Must be signed in");
      return likePost(
        postId,
        user.uid,
        { handle: user.handle, displayName: user.displayName },
        postAuthorId
      );
    },
    onSuccess: invalidate,
  });

  const unlike = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Must be signed in");
      return unlikePost(postId, user.uid);
    },
    onSuccess: invalidate,
  });

  return { like, unlike };
}

export function useDeletePost(postId: string, authorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deletePost(postId, authorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "author", authorId] });
    },
  });
}

export function useTagPostPlant(postId: string, authorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plantId: string | null) => tagPostPlant(postId, plantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "author", authorId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}
