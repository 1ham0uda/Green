"use client";

import { useState } from "react";
import { useAllAds, useApproveAd, usePendingAds, useRejectAd } from "@/features/ads/hooks/use-ads";
import { Icon } from "@/components/ui/icon";
import type { Ad } from "@/features/ads/types";

type Tab = "pending" | "all";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  paused: "bg-zinc-100 text-zinc-600",
  exhausted: "bg-zinc-100 text-zinc-600",
};

function AdRow({
  ad,
  onApprove,
  onReject,
}: {
  ad: Ad;
  onApprove: (adId: string, reach: number) => void;
  onReject: (adId: string, reason: string) => void;
}) {
  const [reachInput, setReachInput] = useState(ad.reach);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-semibold text-zinc-900">{ad.headline}</p>
          {ad.body && <p className="text-sm text-zinc-600 line-clamp-2">{ad.body}</p>}
          <div className="flex flex-wrap gap-3 pt-1 text-xs text-zinc-400">
            <span>by {ad.vendorDisplayName}</span>
            <span>Requested reach: {ad.reach.toLocaleString()}</span>
            {ad.linkURL && <span>Link: {ad.linkURL}</span>}
            {ad.targetGovernorates.length > 0 ? (
              <span>Targets: {ad.targetGovernorates.join(", ")}</span>
            ) : (
              <span>Nationwide</span>
            )}
          </div>
        </div>
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[ad.status] ?? ""}`}>
          {ad.status}
        </span>
      </div>

      {ad.status === "pending" && !rejectMode && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">Confirmed reach:</label>
            <input
              type="number"
              min={100}
              step={100}
              value={reachInput}
              onChange={(e) => setReachInput(Number(e.target.value))}
              className="input w-32 text-sm"
            />
          </div>
          <button
            onClick={() => onApprove(ad.id, reachInput)}
            className="btn-secondary text-xs text-green-700"
          >
            <Icon.Check size={13} className="mr-1 inline" />
            Approve
          </button>
          <button
            onClick={() => setRejectMode(true)}
            className="btn-secondary text-xs text-red-700"
          >
            <Icon.X size={13} className="mr-1 inline" />
            Reject
          </button>
        </div>
      )}

      {rejectMode && (
        <div className="space-y-2 rounded-xl border border-red-100 bg-red-50 p-3">
          <p className="text-xs font-medium text-red-700">Rejection reason</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why this ad is rejected…"
            rows={2}
            className="w-full resize-none rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (rejectReason.trim()) onReject(ad.id, rejectReason.trim());
              }}
              disabled={!rejectReason.trim()}
              className="btn-secondary text-xs text-red-700 disabled:opacity-50"
            >
              Confirm Reject
            </button>
            <button onClick={() => setRejectMode(false)} className="btn-secondary text-xs">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAdsPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const { data: pendingAds, isLoading: pendingLoading } = usePendingAds();
  const { data: allAds, isLoading: allLoading } = useAllAds();
  const approveAd = useApproveAd();
  const rejectAd = useRejectAd();

  const pending = pendingAds ?? [];
  const all = allAds ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Ad Moderation</h2>
        <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
          <button
            onClick={() => setTab("pending")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "pending" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Pending
            {pending.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                {pending.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("all")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "all" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            All Ads
          </button>
        </div>
      </div>

      {tab === "pending" && (
        <div className="space-y-3">
          {pendingLoading && <p className="text-sm text-zinc-500">Loading…</p>}
          {!pendingLoading && pending.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-200 py-12 text-center">
              <Icon.Check size={28} className="text-green-500" />
              <p className="text-sm font-medium text-zinc-600">No pending ads.</p>
            </div>
          )}
          {pending.map((ad) => (
            <AdRow
              key={ad.id}
              ad={ad}
              onApprove={(adId, reach) => approveAd.mutate({ adId, reach })}
              onReject={(adId, reason) => rejectAd.mutate({ adId, reason })}
            />
          ))}
        </div>
      )}

      {tab === "all" && (
        <div className="space-y-2">
          {allLoading && <p className="text-sm text-zinc-500">Loading…</p>}
          {all.map((ad) => (
            <div key={ad.id} className="card flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900">{ad.headline}</p>
                <p className="text-xs text-zinc-500">
                  {ad.vendorDisplayName} · {ad.impressionsDelivered.toLocaleString()} / {ad.reach.toLocaleString()} impressions
                </p>
              </div>
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[ad.status] ?? ""}`}>
                {ad.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
