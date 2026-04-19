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
    <main className="container py-8">
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
      <div className="card p-8 text-center space-y-2">
        <p className="font-medium text-zinc-900">Business account required</p>
        <p className="text-sm text-zinc-600">
          Only business accounts can manage products. You currently have a{" "}
          <strong>{user.role}</strong> account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Your products
          </h1>
          <p className="text-sm text-zinc-500">
            Manage inventory and listings.
          </p>
        </div>
        <Link href="/vendor/products/new" className="btn-primary">
          New product
        </Link>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      {data && data.length === 0 && (
        <div className="card p-8 text-center text-sm text-zinc-500">
          No products yet. Add your first listing.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((product) => (
            <div key={product.id} className="space-y-2">
              <ProductCard product={product} />
              <div className="flex gap-2">
                <Link
                  href={`/vendor/products/${product.id}/edit`}
                  className="btn-secondary flex-1 text-center"
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
                  className="btn-secondary text-red-700"
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
