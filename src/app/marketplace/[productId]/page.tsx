"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/features/marketplace/components/add-to-cart-button";
import { useProduct } from "@/features/marketplace/hooks/use-products";
import { formatPrice } from "@/lib/utils/format";

interface PageProps {
  params: { productId: string };
}

export default function ProductDetailPage({ params }: PageProps) {
  const { productId } = params;
  const { data: product, isLoading, error } = useProduct(productId);

  return (
    <main className="container max-w-4xl py-8 pb-24 md:pb-8">
      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">Failed to load product.</p>}
      {!isLoading && !product && (
        <p className="text-sm text-zinc-500">Product not found.</p>
      )}

      {product && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="relative w-full overflow-hidden rounded-2xl bg-surface-subtle" style={{ aspectRatio: "1/1" }}>
            {product.imageURL ? (
              <Image
                src={product.imageURL}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-subtle">
                <span className="font-serif text-5xl italic text-ink-subtle">?</span>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <p className="eyebrow mb-2">
                <Link href={`/u/${product.vendorId}`} className="hover:text-ink transition-colors">
                  {product.vendorDisplayName}
                </Link>
              </p>
              <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
                {product.name}
              </h1>
            </div>

            <p className="tabular-nums font-sans text-[24px] font-medium text-ink">
              {formatPrice(product.price, product.currency)}
            </p>

            {product.description && (
              <p className="font-sans text-[14px] leading-relaxed text-ink-soft">
                {product.description}
              </p>
            )}

            <p className="eyebrow">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>

            <AddToCartButton product={product} />
          </div>
        </div>
      )}
    </main>
  );
}
