"use client";

import Link from "next/link";
import { ProductGrid } from "@/features/marketplace/components/product-grid";
import { useActiveProducts } from "@/features/marketplace/hooks/use-products";
import { useAuth } from "@/features/auth/hooks/use-auth";

export default function MarketplacePage() {
  const { data, isLoading, error } = useActiveProducts();
  const { user } = useAuth();

  return (
    <main className="container py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Marketplace</h1>
          <p className="text-sm text-zinc-500">
            Seeds, tools, and gear from local vendors.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/cart" className="btn-secondary">
            View cart
          </Link>
          {user?.role === "vendor" && (
            <Link href="/vendor/products" className="btn-primary">
              Vendor dashboard
            </Link>
          )}
        </div>
      </header>

      {isLoading && <p className="text-sm text-zinc-500">Loading products…</p>}
      {error && <p className="text-sm text-red-600">Failed to load products.</p>}
      {data && (
        <ProductGrid
          products={data}
          emptyMessage="No products available yet."
        />
      )}
    </main>
  );
}
