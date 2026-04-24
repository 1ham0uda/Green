"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  createReturnRequest,
  fetchAllReturns,
  fetchBuyerReturns,
  hasReturnRequest,
  updateReturnStatus,
} from "../services/return-service";
import type { CreateReturnInput, ReturnStatus } from "../types";

export function useBuyerReturns() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["returns", "buyer", user?.uid],
    queryFn: () => fetchBuyerReturns(user!.uid),
    enabled: Boolean(user?.uid),
  });
}

export function useHasReturnRequest(orderId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["returns", "exists", orderId, user?.uid],
    queryFn: () => hasReturnRequest(orderId, user!.uid),
    enabled: Boolean(user?.uid) && Boolean(orderId),
  });
}

export function useAllReturns() {
  return useQuery({
    queryKey: ["returns", "all"],
    queryFn: fetchAllReturns,
  });
}

export function useCreateReturn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReturnInput) => {
      if (!user) throw new Error("Must be signed in");
      return createReturnRequest(user.uid, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
    },
  });
}

export function useUpdateReturnStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      returnId,
      status,
      adminNote,
    }: {
      returnId: string;
      status: ReturnStatus;
      adminNote?: string;
    }) => updateReturnStatus(returnId, status, adminNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
    },
  });
}
