"use client";

import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ProductForm } from "@/features/marketplace/components/product-form";
import { useCreateProduct } from "@/features/marketplace/hooks/use-products";

export default function NewProductPage() {
  return (
    <main className="container max-w-2xl pb-24 md:pb-0">
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
      <div className="mt-8 rounded-2xl border border-surface-border bg-surface p-8 text-center">
        <p className="font-sans text-[14px] font-medium text-ink">Business account required</p>
        <p className="mt-1 font-sans text-[13px] text-ink-muted">
          Only business accounts can create products.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="py-5">
        <p className="eyebrow">Vendor</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
          New Product
        </h1>
      </div>
      <div className="rounded-2xl border border-surface-border bg-surface p-6">
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
    </div>
  );
}
