"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  adminApproveVerification,
  adminCreateCompetition,
  adminDeleteCompetition,
  adminDeletePost,
  adminRejectVerification,
  adminUpdateCompetitionStatus,
  approveProduct,
  banUser,
  fetchAllUsers,
  fetchAllVerifications,
  fetchDashboardStats,
  fetchLogs,
  fetchModerationLogs,
  fetchOpenReports,
  fetchPendingProducts,
  fetchPendingVerifications,
  rejectProduct,
  resolveReport,
  searchUsers,
  unbanUser,
  updateUserRole,
} from "../services/admin-service";
import type { UserProfile } from "@/features/auth/types";
import type {
  AdminUser,
  DashboardStats,
  ModerationLog,
} from "../types";
import type {
  SystemLog,
  Report,
} from "../services/admin-service";
import type { VerificationRequest } from "@/features/verification/types";

export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === "admin";
}

export function useDashboardStats() {
  const isAdmin = useIsAdmin();
  return useQuery<DashboardStats, Error>({
    queryKey: ["admin", "stats"],
    queryFn: fetchDashboardStats,
    enabled: isAdmin,
    refetchInterval: 30_000,
  });
}

export function useAllUsers() {
  const isAdmin = useIsAdmin();
  return useQuery<AdminUser[], Error>({
    queryKey: ["admin", "users"],
    queryFn: () => fetchAllUsers(),
    enabled: isAdmin,
  });
}

export function usePendingProducts() {
  const isAdmin = useIsAdmin();
  return useQuery({
    queryKey: ["admin", "pending-products"],
    queryFn: fetchPendingProducts,
    enabled: isAdmin,
  });
}

export function useBanUser() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ targetId, reason }: { targetId: string; reason: string }) => {
      if (!user) throw new Error("Not authenticated");
      return banUser(user.uid, user.handle, targetId, reason);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUnbanUser() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => {
      if (!user) throw new Error("Not authenticated");
      return unbanUser(user.uid, user.handle, targetId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      targetId,
      role,
    }: {
      targetId: string;
      role: UserProfile["role"];
    }) => updateUserRole(targetId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminDeletePost() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => {
      if (!user) throw new Error("Not authenticated");
      return adminDeletePost(user.uid, user.handle, postId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useApproveProduct() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => {
      if (!user) throw new Error("Not authenticated");
      return approveProduct(user.uid, user.handle, productId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
}

export function useRejectProduct() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      reason,
    }: {
      productId: string;
      reason: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      return rejectProduct(user.uid, user.handle, productId, reason);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
}

export function useAdminCreateCompetition() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      title: string;
      description: string;
      rules: string;
      rewards: string;
      startsAt: Date;
      endsAt: Date;
    }) => {
      if (!user) throw new Error("Not authenticated");
      return adminCreateCompetition({
        ...payload,
        createdByAdminId: user.uid,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competitions"] }),
  });
}

export function useAdminUpdateCompetitionStatus() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      competitionId,
      status,
    }: {
      competitionId: string;
      status: "upcoming" | "active" | "closed";
    }) => {
      if (!user) throw new Error("Not authenticated");
      return adminUpdateCompetitionStatus(competitionId, status, user.uid);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competitions"] }),
  });
}

export function useAdminDeleteCompetition() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (competitionId: string) => {
      if (!user) throw new Error("Not authenticated");
      return adminDeleteCompetition(competitionId, user.uid);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competitions"] }),
  });
}

export function useAdminLogs() {
  const isAdmin = useIsAdmin();
  return useQuery<SystemLog[], Error>({
    queryKey: ["admin", "logs"],
    queryFn: () => fetchLogs(),
    enabled: isAdmin,
  });
}

export function useModerationLogs() {
  const isAdmin = useIsAdmin();
  return useQuery<ModerationLog[], Error>({
    queryKey: ["admin", "moderation-logs"],
    queryFn: () => fetchModerationLogs(),
    enabled: isAdmin,
  });
}

export function useOpenReports() {
  const isAdmin = useIsAdmin();
  return useQuery<Report[], Error>({
    queryKey: ["admin", "reports"],
    queryFn: () => fetchOpenReports(),
    enabled: isAdmin,
  });
}

export function useResolveReport() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      action,
    }: {
      reportId: string;
      action: "resolved" | "dismissed";
    }) => {
      if (!user) throw new Error("Not authenticated");
      return resolveReport(user.uid, user.handle, reportId, action);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "reports"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// ─── SEARCH ──────────────────────────────────────────────────────────────────

export function useSearchUsers(term: string) {
  const isAdmin = useIsAdmin();
  return useQuery<AdminUser[], Error>({
    queryKey: ["admin", "users", "search", term],
    queryFn: () => searchUsers(term),
    enabled: isAdmin && term.length >= 2,
  });
}

// ─── VERIFICATION ─────────────────────────────────────────────────────────────

export function usePendingVerifications() {
  const isAdmin = useIsAdmin();
  return useQuery<VerificationRequest[], Error>({
    queryKey: ["admin", "verifications", "pending"],
    queryFn: () => fetchPendingVerifications(),
    enabled: isAdmin,
  });
}

export function useAllVerifications() {
  const isAdmin = useIsAdmin();
  return useQuery<VerificationRequest[], Error>({
    queryKey: ["admin", "verifications", "all"],
    queryFn: () => fetchAllVerifications(),
    enabled: isAdmin,
  });
}

export function useAdminApproveVerification() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      userId,
    }: {
      requestId: string;
      userId: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      return adminApproveVerification(user.uid, user.handle, requestId, userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "verifications"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminRejectVerification() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      userId,
    }: {
      requestId: string;
      userId: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      return adminRejectVerification(user.uid, user.handle, requestId, userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "verifications"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
