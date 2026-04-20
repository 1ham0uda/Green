"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/utils/format";
import { Icon } from "@/components/ui/icon";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={`/marketplace/${product.id}`}
      className="group block overflow-hidden rounded-2xl border border-surface-border bg-surface transition-all duration-200 hover:border-brand-200 hover:shadow-elevated"
    >
      <div className="relative w-full overflow-hidden bg-surface-subtle" style={{ aspectRatio: "1/1" }}>
        {product.imageURL ? (
          <>
            {!loaded && <div className="absolute inset-0 skeleton" />}
            <Image
              src={product.imageURL}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 280px"
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-subtle">
            <Icon.ShoppingBag size={36} />
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[2px]">
            <span className="badge badge-zinc bg-white/90">Sold out</span>
          </div>
        )}
        {!outOfStock && product.stock <= 5 && (
          <span className="badge badge-amber absolute left-2.5 top-2.5 bg-amber-50/90 backdrop-blur-sm">
            {product.stock} left
          </span>
        )}
      </div>

      <div className="p-3.5">
        <p className="eyebrow mb-1 truncate">{product.vendorDisplayName}</p>
        <h3 className="font-serif text-[16px] font-normal leading-snug tracking-[-0.01em] text-ink line-clamp-2 group-hover:text-brand-700 transition-colors">
          {product.name}
        </h3>
        <p className="tabular-nums mt-2 font-sans text-[15px] font-medium text-ink">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  );
}
