"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  fetchBuyerOrders,
  fetchVendorOrders,
  placeMockOrder,
  updateOrderStatus,
} from "../services/order-service";
import type { CartItem, OrderStatus } from "../types";

export function useBuyerOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["orders", "buyer", user?.uid],
    queryFn: () => fetchBuyerOrders(user!.uid),
    enabled: Boolean(user?.uid),
  });
}

export function useVendorOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["orders", "vendor", user?.uid],
    queryFn: () => fetchVendorOrders(user!.uid),
    enabled: Boolean(user?.uid),
  });
}

export function usePlaceMockOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: CartItem[]) => {
      if (!user) throw new Error("Must be signed in");
      return placeMockOrder(user.uid, items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
