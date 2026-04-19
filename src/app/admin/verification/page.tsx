"use client";

import { useState } from "react";
import {
  useAdminApproveVerification,
  useAdminRejectVerification,
  useAllVerifications,
  usePendingVerifications,
} from "@/features/admin/hooks/use-admin";
import type { VerificationRequest } from "@/features/verification/types";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-brand-100 text-brand-700",
  rejected: "bg-red-100 text-red-700",
};

function RequestRow({ req }: { req: VerificationRequest }) {
  const approve = useAdminApproveVerification();
  const reject = useAdminRejectVerification();
  const pending = approve.isPending || reject.isPending;

  return (
    <div className="flex items-start gap-4 p-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-900">@{req.handle}</span>
          <span className="text-xs text-zinc-500">{req.displayName}</span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 capitalize">
            {req.role}
          </span>
        </div>
        <p className="text-sm text-zinc-600">{req.reason}</p>
        <p className="text-xs text-zinc-400">
          {req.createdAt
            ? req.createdAt.toDate().toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </p>
      </div>

      <span
        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[req.status] ?? ""}`}
      >
        {req.status}
      </span>

      {req.status === "pending" && (
        <div className="flex flex-shrink-0 gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              approve.mutate({ requestId: req.id, userId: req.userId })
            }
            className="btn-primary py-1 px-3 text-xs"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              reject.mutate({ requestId: req.id, userId: req.userId })
            }
            className="btn-secondary py-1 px-3 text-xs text-red-700"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminVerificationPage() {
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const { data: pending, isLoading: pendingLoading } = usePendingVerifications();
  const { data: all, isLoading: allLoading } = useAllVerifications();

  const items = tab === "pending" ? pending : all;
  const isLoading = tab === "pending" ? pendingLoading : allLoading;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900">
        Verification Requests
      </h2>

      <div className="flex gap-0 border-b border-surface-border">
        {(["pending", "all"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? "border-b-2 border-brand-600 text-brand-600"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t === "pending"
              ? `Pending (${pending?.length ?? 0})`
              : `All requests (${all?.length ?? 0})`}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-surface-border overflow-hidden text-sm">
        {isLoading && <p className="p-6 text-zinc-500">Loading…</p>}

        {!isLoading && items?.length === 0 && (
          <p className="p-8 text-center text-zinc-500">
            No {tab === "pending" ? "pending " : ""}requests.
          </p>
        )}

        {items?.map((req) => <RequestRow key={req.id} req={req} />)}
      </div>
    </div>
  );
}
