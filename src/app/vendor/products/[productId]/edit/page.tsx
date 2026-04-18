"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { ProductForm } from "@/features/marketplace/components/product-form";
import {
  useProduct,
  useUpdateProduct,
} from "@/features/marketplace/hooks/use-products";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const { productId } = use(params);

  return (
    <main className="container max-w-2xl py-8">
      <AuthGate>
        <EditProductContent productId={productId} />
      </AuthGate>
    </main>
  );
}

function EditProductContent({ productId }: { productId: string }) {
  const router = useRouter();
  const { data: product, isLoading } = useProduct(productId);
  const updateProduct = useUpdateProduct(productId);

  if (isLoading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!product) return <p className="text-sm text-zinc-500">Product not found.</p>;

  return (
    <div className="card p-6">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">Edit product</h1>
      <ProductForm
        initial={product}
        submitLabel="Save changes"
        pending={updateProduct.isPending}
        onSubmit={async (input) => {
          await updateProduct.mutateAsync(input);
          router.push("/vendor/products");
          router.refresh();
        }}
      />
    </div>
  );
}
