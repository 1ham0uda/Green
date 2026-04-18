"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/marketplace/${product.id}`}
      className="card block overflow-hidden transition hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-brand-50">
        {product.imageURL ? (
          <Image
            src={product.imageURL}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            🛒
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-zinc-900/80 px-2 py-0.5 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="space-y-1 p-4">
        <h3 className="font-semibold text-zinc-900">{product.name}</h3>
        <p className="text-sm text-zinc-600">
          {formatPrice(product.price, product.currency)}
        </p>
        <p className="text-xs text-zinc-500">by {product.vendorDisplayName}</p>
      </div>
    </Link>
  );
}
