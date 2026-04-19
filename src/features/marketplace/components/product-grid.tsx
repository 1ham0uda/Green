"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import type { Product } from "../types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "No products yet.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Icon.ShoppingBag size={22} />}
        title="Nothing here yet"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
