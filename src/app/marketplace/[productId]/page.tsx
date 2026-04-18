"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { AddToCartButton } from "@/features/marketplace/components/add-to-cart-button";
import { useProduct } from "@/features/marketplace/hooks/use-products";
import { formatPrice } from "@/lib/utils/format";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { productId } = use(params);
  const { data: product, isLoading, error } = useProduct(productId);

  return (
    <main className="container max-w-4xl py-8">
      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">Failed to load product.</p>}
      {!isLoading && !product && (
        <p className="text-sm text-zinc-500">Product not found.</p>
      )}

      {product && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-brand-50">
            {product.imageURL ? (
              <Image
                src={product.imageURL}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl">
                🛒
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">
                {product.name}
              </h1>
              <Link
                href={`/u/${product.vendorId}`}
                className="text-sm text-zinc-500 hover:text-brand-700"
              >
                by {product.vendorDisplayName}
              </Link>
            </div>

            <p className="text-2xl font-semibold text-brand-700">
              {formatPrice(product.price, product.currency)}
            </p>

            {product.description && (
              <p className="text-sm text-zinc-700">{product.description}</p>
            )}

            <p className="text-sm text-zinc-600">
              Stock: <strong>{product.stock}</strong>
            </p>

            <AddToCartButton product={product} />
          </div>
        </div>
      )}
    </main>
  );
}
