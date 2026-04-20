"use client";

import { useState } from "react";
import Image from "next/image";
import {
  useAllAdminProducts,
  useApproveProduct,
  usePendingProducts,
  useRejectProduct,
} from "@/features/admin/hooks/use-admin";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/utils/format";

type Tab = "pending" | "all";

type AdminProduct = {
  id: string;
  vendorDisplayName: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageURL: string | null;
  stock: number;
  status: string;
  rejectionReason?: string | null;
};

export default function AdminMarketplacePage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: pendingProducts, isLoading: pendingLoading } = usePendingProducts();
  const { data: allProducts, isLoading: allLoading } = useAllAdminProducts();
  const approve = useApproveProduct();
  const reject = useRejectProduct();

  const pending = (pendingProducts ?? []) as AdminProduct[];
  const all = (allProducts ?? []) as AdminProduct[];

  function handleReject(productId: string) {
    if (!rejectReason.trim()) return;
    reject.mutate(
      { productId, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          setRejectingId(null);
          setRejectReason("");
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Product Moderation</h2>
        <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
          <button
            onClick={() => setTab("pending")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "pending"
                ? "bg-white shadow-sm text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700"
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
              tab === "all"
                ? "bg-white shadow-sm text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            All Products
          </button>
        </div>
      </div>

      {tab === "pending" && (
        <div className="space-y-3">
          {pendingLoading && <p className="text-sm text-zinc-500">Loading…</p>}
          {!pendingLoading && pending.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-200 py-12 text-center">
              <Icon.Check size={28} className="text-green-500" />
              <p className="text-sm font-medium text-zinc-600">All caught up!</p>
              <p className="text-xs text-zinc-400">No products awaiting review.</p>
            </div>
          )}
          {pending.map((p) => (
            <div key={p.id} className="card p-4 space-y-3">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-brand-50">
                  {p.imageURL ? (
                    <Image src={p.imageURL} alt={p.name} fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-zinc-300">
                      <Icon.ShoppingBag size={28} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900">{p.name}</p>
                  <p className="text-sm text-zinc-500">
                    by {p.vendorDisplayName} · {formatPrice(p.price, p.currency)}
                  </p>
                  <p className="text-xs text-zinc-400">{p.stock} in stock</p>
                  {p.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-600">{p.description}</p>
                  )}
                </div>
              </div>

              {rejectingId === p.id ? (
                <div className="space-y-2 rounded-xl border border-red-100 bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-700">Rejection reason</p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this product is rejected…"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(p.id)}
                      disabled={!rejectReason.trim() || reject.isPending}
                      className="btn-secondary text-xs text-red-700 disabled:opacity-50"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason("");
                      }}
                      className="btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => approve.mutate(p.id)}
                    disabled={approve.isPending}
                    className="btn-secondary text-xs text-green-700 disabled:opacity-50"
                  >
                    <Icon.Check size={13} className="mr-1 inline" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setRejectingId(p.id);
                      setRejectReason("");
                    }}
                    className="btn-secondary text-xs text-red-700"
                  >
                    <Icon.X size={13} className="mr-1 inline" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "all" && (
        <div className="space-y-2">
          {allLoading && <p className="text-sm text-zinc-500">Loading…</p>}
          {all.map((p) => (
            <div key={p.id} className="card flex items-center gap-4 p-4">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-brand-50">
                {p.imageURL ? (
                  <Image src={p.imageURL} alt={p.name} fill sizes="56px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-300">
                    <Icon.ShoppingBag size={20} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900">{p.name}</p>
                <p className="text-xs text-zinc-500">
                  {p.vendorDisplayName} · {formatPrice(p.price, p.currency)} · {p.stock} in stock
                </p>
                {p.rejectionReason && (
                  <p className="mt-0.5 text-xs text-red-500">Reason: {p.rejectionReason}</p>
                )}
              </div>
              <span
                className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  p.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : p.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
