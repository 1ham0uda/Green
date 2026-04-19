"use client";

import Link from "next/link";
import { ProductGrid } from "@/features/marketplace/components/product-grid";
import { useActiveProducts } from "@/features/marketplace/hooks/use-products";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { SkeletonProductCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";

export default function MarketplacePage() {
  const { data, isLoading, error } = useActiveProducts();
  const { user } = useAuth();

  const isBusiness = user?.role === "business" || user?.role === "admin";

  return (
    <main className="container py-6 sm:py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-100">
            <Icon.Sparkle size={12} />
            Curated by gardeners
          </div>
          <h1 className="text-display-md font-bold tracking-tight text-ink">
            Marketplace
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Seeds, tools, and gear from local vendors and growers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/cart"
            className="btn-secondary inline-flex items-center gap-1.5"
          >
            <Icon.Cart size={16} />
            View cart
          </Link>
          {isBusiness && (
            <Link
              href="/vendor/products"
              className="btn-primary inline-flex items-center gap-1.5"
            >
              <Icon.ShoppingBag size={16} />
              Vendor dashboard
            </Link>
          )}
        </div>
      </header>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      )}

      {error && (
        <EmptyState
          icon={<Icon.Flag size={22} />}
          title="Failed to load marketplace"
          description={error.message}
        />
      )}

      {data && (
        <ProductGrid
          products={data}
          emptyMessage="No products available yet. Check back soon!"
        />
      )}
    </main>
  );
}
