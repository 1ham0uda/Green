"use client";

import { useMutation } from "@tanstack/react-query";
import { submitReport } from "../services/moderation-service";
import type { ReportTargetType } from "../types";

export function useSubmitReport() {
  return useMutation({
    mutationFn: ({
      reporterId,
      targetId,
      targetType,
      reason,
    }: {
      reporterId: string;
      targetId: string;
      targetType: ReportTargetType;
      reason: string;
    }) => submitReport({ reporterId, targetId, targetType, reason }),
  });
}
