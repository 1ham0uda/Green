"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        href={`/marketplace/${product.id}`}
        className="group block overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-elevated"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-brand-soft">
          {product.imageURL ? (
            <>
              {!loaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-brand-100 to-brand-200/60" />
              )}
              <Image
                src={product.imageURL}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 280px"
                className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                  loaded ? "scale-100 blur-0" : "scale-105 blur-lg"
                }`}
                onLoad={() => setLoaded(true)}
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-brand-400">
              <Icon.ShoppingBag size={48} />
            </div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <Badge variant="zinc" className="bg-white/90 backdrop-blur">
                Sold out
              </Badge>
            </div>
          )}
          {!outOfStock && product.stock <= 5 && (
            <Badge
              variant="amber"
              className="absolute left-3 top-3 bg-amber-50/90 backdrop-blur"
            >
              Only {product.stock} left
            </Badge>
          )}
        </div>

        <div className="space-y-2 p-4">
          <h3 className="line-clamp-1 font-semibold text-ink transition-colors group-hover:text-brand-700">
            {product.name}
          </h3>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-lg font-bold text-ink">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>
          <p className="line-clamp-1 text-xs text-ink-muted">
            by {product.vendorDisplayName}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
