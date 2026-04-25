"use client";

import Image from "next/image";
import { useState } from "react";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useVendorReturns, useUpdateReturnStatus } from "@/features/marketplace/hooks/use-returns";
import type { ReturnRequest, ReturnStatus } from "@/features/marketplace/types";

const STATUS_META: Record<ReturnStatus, { label: string; class: string }> = {
  pending:  { label: "Pending",  class: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", class: "bg-brand-100 text-brand-700" },
  rejected: { label: "Rejected", class: "bg-red-100   text-red-700"  },
};

export default function VendorReturnsPage() {
  return (
    <main className="container max-w-3xl pb-24 md:pb-10">
      <AuthGate>
        <VendorReturnsContent />
      </AuthGate>
    </main>
  );
}

function VendorReturnsContent() {
  const { data: returns = [], isLoading } = useVendorReturns();
  const updateStatus = useUpdateReturnStatus();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<ReturnStatus | "all">("all");

  const filtered = filter === "all" ? returns : returns.filter((r) => r.status === filter);

  const counts = {
    all:      returns.length,
    pending:  returns.filter((r) => r.status === "pending").length,
    approved: returns.filter((r) => r.status === "approved").length,
    rejected: returns.filter((r) => r.status === "rejected").length,
  };

  async function handleDecision(req: ReturnRequest, status: ReturnStatus) {
    await updateStatus.mutateAsync({
      returnId: req.id,
      status,
      adminNote: noteMap[req.id]?.trim() || undefined,
    });
    setExpandedId(null);
  }

  return (
    <div className="space-y-6">
      <div className="py-5">
        <p className="eyebrow">Vendor</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Return Requests
        </h1>
        <p className="mt-1 font-sans text-[13px] text-ink-muted">
          Review and respond to buyer return requests for your products.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "bg-ink text-white"
                : "bg-surface-subtle text-ink-muted hover:bg-surface-border hover:text-ink"
            }`}
          >
            {f}
            {counts[f] > 0 && (
              <span className={`ml-1.5 ${filter === f ? "opacity-70" : "opacity-50"}`}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={<Icon.RotateCcw size={22} />}
          title={filter === "all" ? "No return requests" : `No ${filter} requests`}
          description={
            filter === "all"
              ? "When buyers request a return, it will appear here."
              : ""
          }
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((req) => {
            const meta = STATUS_META[req.status];
            const expanded = expandedId === req.id;
            const date = req.createdAt
              ? new Date(req.createdAt.toMillis()).toLocaleDateString("en-EG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—";

            return (
              <div
                key={req.id}
                className="rounded-2xl border border-surface-border bg-surface overflow-hidden"
              >
                {/* Summary row */}
                <button
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-surface-subtle transition-colors"
                  onClick={() => setExpandedId(expanded ? null : req.id)}
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-sans text-[11px] uppercase tracking-wider text-ink-muted">
                      Order #{req.orderId.slice(0, 8).toUpperCase()} · {date}
                    </p>
                    <p className="text-sm font-medium text-ink truncate">{req.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.class}`}>
                      {meta.label}
                    </span>
                    <Icon.ChevronDown
                      size={16}
                      className={`text-ink-muted transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {/* Expanded detail */}
                {expanded && (
                  <div className="border-t border-surface-border px-5 py-4 space-y-4">
                    {/* Return photos */}
                    {req.imageURLs.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {req.imageURLs.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative h-20 w-20 overflow-hidden rounded-xl bg-surface-subtle flex-shrink-0"
                          >
                            <Image
                              src={url}
                              alt={`Return photo ${i + 1}`}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Buyer reason */}
                    <div className="rounded-xl bg-surface-subtle p-3 text-sm text-ink">
                      <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                        Buyer&apos;s reason
                      </p>
                      {req.reason}
                    </div>

                    {/* Existing vendor note (resolved requests) */}
                    {req.adminNote && (
                      <div className="rounded-xl bg-surface-subtle p-3 text-sm">
                        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                          Your response
                        </p>
                        {req.adminNote}
                      </div>
                    )}

                    {/* Decision form — only for pending */}
                    {req.status === "pending" && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-ink-muted">
                            Message to buyer (optional)
                          </label>
                          <textarea
                            rows={2}
                            className="input resize-none text-sm"
                            placeholder="Explain your decision…"
                            value={noteMap[req.id] ?? ""}
                            onChange={(e) =>
                              setNoteMap((prev) => ({ ...prev, [req.id]: e.target.value }))
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecision(req, "approved")}
                            disabled={updateStatus.isPending}
                            className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                          >
                            Approve return
                          </button>
                          <button
                            onClick={() => handleDecision(req, "rejected")}
                            disabled={updateStatus.isPending}
                            className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
