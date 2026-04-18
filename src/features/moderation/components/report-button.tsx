"use client";

import { useState } from "react";
import { useSubmitReport } from "../hooks/use-moderation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { ReportTargetType } from "../types";

interface ReportButtonProps {
  targetId: string;
  targetType: ReportTargetType;
}

const REASONS = [
  "Spam or misleading",
  "Hate speech or harassment",
  "Inappropriate content",
  "Scam or fraud",
  "Violence",
  "Other",
];

export function ReportButton({ targetId, targetType }: ReportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const report = useSubmitReport();

  if (!user) return null;

  function handleSubmit() {
    if (!user) return;
    report.mutate(
      { reporterId: user.uid, targetId, targetType, reason },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
        title="Report"
      >
        Report
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="card w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-zinc-900">Report {targetType}</h3>

            <div className="space-y-2">
              {REASONS.map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-brand-600"
                  />
                  <span className="text-sm text-zinc-700">{r}</span>
                </label>
              ))}
            </div>

            {report.isSuccess && (
              <p className="text-sm text-brand-600">Report submitted. Thank you.</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={report.isPending || report.isSuccess}
                className="btn-primary text-sm"
              >
                {report.isPending ? "Submitting…" : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
