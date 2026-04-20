"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  approveAd,
  createAd,
  fetchAllAds,
  fetchAdsForUser,
  fetchMyAds,
  fetchPendingAds,
  recordImpression,
  rejectAd,
} from "../services/ad-service";
import type { CreateAdInput } from "../types";

export function useAdsForFeed() {
  const { user } = useAuth();
  const governorate = user?.governorate ?? "";
  const city = user?.city ?? "";
  return useQuery({
    queryKey: ["ads", "feed", governorate, city],
    queryFn: () => fetchAdsForUser(governorate, city),
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyAds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ads", "mine", user?.uid],
    queryFn: () => fetchMyAds(user!.uid),
    enabled: Boolean(user),
  });
}

export function useCreateAd() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdInput) => {
      if (!user) throw new Error("Not authenticated");
      return createAd(user, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ads", "mine"] }),
  });
}

export function useRecordImpression() {
  return useMutation({
    mutationFn: (adId: string) => recordImpression(adId),
  });
}

// ─── Admin hooks ─────────────────────────────────────────────────────────────

export function usePendingAds() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  return useQuery({
    queryKey: ["ads", "pending"],
    queryFn: fetchPendingAds,
    enabled: isAdmin,
  });
}

export function useAllAds() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  return useQuery({
    queryKey: ["ads", "all"],
    queryFn: fetchAllAds,
    enabled: isAdmin,
  });
}

export function useApproveAd() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ adId, reach }: { adId: string; reach: number }) => {
      if (!user) throw new Error("Not authenticated");
      return approveAd(user.uid, adId, reach);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useRejectAd() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ adId, reason }: { adId: string; reason: string }) => {
      if (!user) throw new Error("Not authenticated");
      return rejectAd(user.uid, adId, reason);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}
