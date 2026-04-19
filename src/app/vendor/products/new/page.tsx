"use client";

import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ProductForm } from "@/features/marketplace/components/product-form";
import { useCreateProduct } from "@/features/marketplace/hooks/use-products";

export default function NewProductPage() {
  return (
    <main className="container max-w-2xl py-8">
      <AuthGate>
        <NewProductContent />
      </AuthGate>
    </main>
  );
}

function NewProductContent() {
  const { user } = useAuth();
  const router = useRouter();
  const createProduct = useCreateProduct();

  if (user && user.role !== "business" && user.role !== "admin") {
    return (
      <div className="card p-8 text-center space-y-2">
        <p className="font-medium text-zinc-900">Business account required</p>
        <p className="text-sm text-zinc-600">
          Only business accounts can create products.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">
        Create product
      </h1>
      <ProductForm
        submitLabel="Create product"
        pending={createProduct.isPending}
        onSubmit={async (input) => {
          const product = await createProduct.mutateAsync(input);
          router.push(`/vendor/products/${product.id}/edit`);
          router.refresh();
        }}
      />
    </div>
  );
}
