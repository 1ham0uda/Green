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
    <main className="container max-w-6xl pb-24 md:pb-0">
      <header className="flex items-center justify-between gap-4 py-5">
        <div>
          <p className="eyebrow">Shop</p>
          <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
            Marketplace
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/cart" className="btn-secondary btn-sm flex items-center gap-1.5">
            <Icon.Cart size={15} />
            Cart
          </Link>
          {isBusiness && (
            <Link href="/vendor/products" className="btn-primary btn-sm flex items-center gap-1.5">
              <Icon.ShoppingBag size={15} />
              My shop
            </Link>
          )}
        </div>
      </header>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
