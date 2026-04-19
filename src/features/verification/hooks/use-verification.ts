"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  getUserVerificationRequest,
  requestVerification,
} from "../services/verification-service";
import type { VerificationRequest } from "../types";

export function useMyVerificationRequest() {
  const { user } = useAuth();
  return useQuery<VerificationRequest | null, Error>({
    queryKey: ["verification", "my", user?.uid],
    queryFn: () => getUserVerificationRequest(user!.uid),
    enabled: Boolean(user?.uid),
  });
}

export function useRequestVerification() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => {
      if (!user) throw new Error("Not authenticated");
      return requestVerification(user, reason);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["verification", "my"] });
    },
  });
}
