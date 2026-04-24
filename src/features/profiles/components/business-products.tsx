"use client";

import Link from "next/link";
import { useVendorProducts } from "@/features/marketplace/hooks/use-products";
import { ProductCard } from "@/features/marketplace/components/product-card";
import { Icon } from "@/components/ui/icon";

interface BusinessProductsProps {
  vendorId: string;
}

export function BusinessProducts({ vendorId }: BusinessProductsProps) {
  const { data: products, isLoading } = useVendorProducts(vendorId);

  const visible = products?.filter((p) => p.status === "approved" && p.isActive) ?? [];

  if (isLoading) {
    return (
      <section className="border-b border-surface-border px-5 py-5 sm:px-6">
        <div className="mb-4 h-4 w-24 rounded skeleton" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl skeleton" style={{ aspectRatio: "1/1" }} />
          ))}
        </div>
      </section>
    );
  }

  if (!visible.length) return null;

  return (
    <section className="border-b border-surface-border px-5 py-5 sm:px-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon.Store size={14} className="text-ink-muted" />
          <h2 className="font-sans text-[13px] font-semibold uppercase tracking-eyebrow text-ink-muted">
            Products
          </h2>
        </div>
        <Link
          href={`/marketplace?vendor=${vendorId}`}
          className="font-sans text-[12px] text-brand-600 hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visible.slice(0, 6).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
