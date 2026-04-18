"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  createProduct,
  deleteProduct,
  fetchActiveProducts,
  fetchProductById,
  fetchProductsByVendor,
  updateProduct,
} from "../services/product-service";
import type { CreateProductInput, UpdateProductInput } from "../types";

export function useActiveProducts() {
  return useQuery({
    queryKey: ["products", "active"],
    queryFn: fetchActiveProducts,
  });
}

export function useVendorProducts(vendorId: string | null | undefined) {
  return useQuery({
    queryKey: ["products", "vendor", vendorId],
    queryFn: () => fetchProductsByVendor(vendorId as string),
    enabled: Boolean(vendorId),
  });
}

export function useProduct(productId: string | null | undefined) {
  return useQuery({
    queryKey: ["products", "detail", productId],
    queryFn: () => fetchProductById(productId as string),
    enabled: Boolean(productId),
  });
}

export function useCreateProduct() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => {
      if (!user) throw new Error("Must be signed in");
      return createProduct(user, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct(productId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProductInput) => {
      if (!user) throw new Error("Must be signed in");
      return updateProduct(productId, user.uid, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
