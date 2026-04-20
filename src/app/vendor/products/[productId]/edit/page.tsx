"use client";

import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { ProductForm } from "@/features/marketplace/components/product-form";
import {
  useProduct,
  useUpdateProduct,
} from "@/features/marketplace/hooks/use-products";

interface PageProps {
  params: { productId: string };
}

export default function EditProductPage({ params }: PageProps) {
  const { productId } = params;

  return (
    <main className="container max-w-2xl pb-24 md:pb-0">
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

  if (isLoading) return <div className="skeleton mt-8 h-8 w-40 rounded-full" />;
  if (!product) return <p className="mt-8 font-sans text-[13px] text-ink-muted">Product not found.</p>;

  return (
    <div>
      <div className="py-5">
        <p className="eyebrow">Vendor</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">Edit Product</h1>
      </div>
      <div className="rounded-2xl border border-surface-border bg-surface p-6">
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
    </div>
  );
}
