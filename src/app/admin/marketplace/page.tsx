"use client";

import Image from "next/image";
import { useState } from "react";
import {
  useApproveProduct,
  usePendingProducts,
  useRejectProduct,
} from "@/features/admin/hooks/use-admin";
import { formatPrice } from "@/lib/utils/format";

export default function AdminMarketplacePage() {
  const { data: products, isLoading } = usePendingProducts();
  const approve = useApproveProduct();
  const reject = useRejectProduct();
  const [reasons, setReasons] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900">
        Pending products ({products?.length ?? 0})
      </h2>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      {!isLoading && products?.length === 0 && (
        <div className="card p-8 text-center text-sm text-zinc-500">
          No pending products. All caught up!
        </div>
      )}

      <div className="space-y-4">
        {products?.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="flex gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-brand-50">
                {p.imageURL ? (
                  <Image
                    src={p.imageURL}
                    alt={p.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">
                    🛒
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-zinc-900">{p.name}</p>
                <p className="text-sm text-zinc-500">
                  by {p.vendorDisplayName} ·{" "}
                  {formatPrice(p.price, p.currency)}
                </p>
                {p.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-600">
                    {p.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void approve.mutateAsync(p.id)}
                disabled={approve.isPending}
                className="btn-primary text-sm"
              >
                Approve
              </button>

              <input
                type="text"
                placeholder="Rejection reason…"
                value={reasons[p.id] ?? ""}
                onChange={(e) =>
                  setReasons((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                className="input w-56 text-sm"
              />

              <button
                type="button"
                onClick={() =>
                  void reject.mutateAsync({
                    productId: p.id,
                    reason: reasons[p.id] ?? "Does not meet guidelines",
                  })
                }
                disabled={reject.isPending}
                className="btn-secondary text-sm text-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
