"use client";

import Link from "next/link";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  useDeleteProduct,
  useVendorProducts,
} from "@/features/marketplace/hooks/use-products";
import { ProductCard } from "@/features/marketplace/components/product-card";

export default function VendorProductsPage() {
  return (
    <main className="container max-w-6xl pb-24 md:pb-0">
      <AuthGate>
        <VendorProductsContent />
      </AuthGate>
    </main>
  );
}

function VendorProductsContent() {
  const { user } = useAuth();
  const { data, isLoading } = useVendorProducts(user?.uid);
  const deleteProduct = useDeleteProduct();

  if (user && user.role !== "business" && user.role !== "admin") {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface p-8 text-center">
        <p className="font-sans text-[14px] font-medium text-ink">Business account required</p>
        <p className="mt-1 font-sans text-[13px] text-ink-muted">
          Only business accounts can manage products.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between py-5">
        <div>
          <p className="eyebrow">Vendor</p>
          <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
            Your Products
          </h1>
        </div>
        <Link href="/vendor/products/new" className="btn-primary btn-sm flex items-center gap-1.5">
          New product
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      )}

      {data && data.length === 0 && (
        <p className="font-sans text-[13px] text-ink-muted">No products yet. Add your first listing.</p>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((product) => (
            <div key={product.id} className="space-y-2">
              <ProductCard product={product} />
              <div className="flex gap-2">
                <Link
                  href={`/vendor/products/${product.id}/edit`}
                  className="btn-secondary btn-sm flex-1 text-center"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${product.name}"?`)) {
                      void deleteProduct.mutateAsync(product.id);
                    }
                  }}
                  className="btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
