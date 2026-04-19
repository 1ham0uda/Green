"use client";

import { useQuery } from "@tanstack/react-query";
import {
  searchPosts,
  searchProducts,
  searchUsersByUsername,
} from "../services/search-service";

export function useUserSearch(term: string) {
  return useQuery({
    queryKey: ["search", "users", term],
    queryFn: () => searchUsersByUsername(term),
    enabled: term.length >= 2,
    staleTime: 30_000,
  });
}

export function usePostSearch(term: string) {
  return useQuery({
    queryKey: ["search", "posts", term],
    queryFn: () => searchPosts(term),
    enabled: term.length >= 2,
    staleTime: 30_000,
  });
}

export function useProductSearch(term: string) {
  return useQuery({
    queryKey: ["search", "products", term],
    queryFn: () => searchProducts(term),
    enabled: term.length >= 2,
    staleTime: 30_000,
  });
}
