"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  useMyVerificationRequest,
  useRequestVerification,
} from "../hooks/use-verification";

const STATUS_LABEL: Record<string, string> = {
  none: "Not requested",
  pending: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_COLOR: Record<string, string> = {
  none: "bg-zinc-100 text-zinc-600",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-brand-100 text-brand-700",
  rejected: "bg-red-100 text-red-700",
};

export function RequestVerificationForm() {
  const { user } = useAuth();
  const { data: request, isLoading } = useMyVerificationRequest();
  const requestVerification = useRequestVerification();
  const [reason, setReason] = useState("");

  if (!user) return null;

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  const status = request?.status ?? user.verificationStatus ?? "none";
  const canRequest = status !== "pending" && status !== "approved";

  const isEligible = user.role === "business" || user.postCount >= 5;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[status] ?? STATUS_COLOR.none}`}
        >
          {STATUS_LABEL[status] ?? status}
        </span>
        {user.isVerified && (
          <span className="text-xs text-brand-600 font-medium">
            Your account is verified ✓
          </span>
        )}
      </div>

      {!isEligible && (
        <p className="text-sm text-zinc-500">
          Verification is available for business accounts or users with at least 5 posts.
          You currently have {user.postCount} post{user.postCount !== 1 ? "s" : ""}.
        </p>
      )}

      {status === "rejected" && (
        <p className="text-sm text-red-600">
          Your previous request was rejected. You can submit a new one.
        </p>
      )}

      {canRequest && isEligible && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestVerification.mutate(reason);
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label
              htmlFor="ver-reason"
              className="text-sm font-medium text-zinc-800"
            >
              Why do you want to be verified?
            </label>
            <textarea
              id="ver-reason"
              rows={3}
              required
              minLength={20}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your account and why verification would help…"
              className="input"
            />
          </div>

          {requestVerification.isError && (
            <p className="text-sm text-red-600">
              {requestVerification.error?.message}
            </p>
          )}

          {requestVerification.isSuccess && (
            <p className="text-sm text-brand-600">
              Verification request submitted. We&apos;ll review it shortly.
            </p>
          )}

          <button
            type="submit"
            disabled={requestVerification.isPending}
            className="btn-primary"
          >
            {requestVerification.isPending ? "Submitting…" : "Request verification"}
          </button>
        </form>
      )}

      {status === "pending" && (
        <p className="text-sm text-zinc-600">
          Your request is under review. We&apos;ll notify you once it&apos;s processed.
        </p>
      )}
    </div>
  );
}
