"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  cancelOrder,
  fetchBuyerOrders,
  fetchVendorOrders,
  placeCodOrder,
  updateOrderStatus,
} from "../services/order-service";
import type { PlaceOrderInput, OrderStatus } from "../types";

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

export function usePlaceCodOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ items, shippingAddress }: PlaceOrderInput) => {
      if (!user) throw new Error("Must be signed in");
      return placeCodOrder(user.uid, items, shippingAddress);
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

export function useCancelOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => {
      if (!user) throw new Error("Must be signed in");
      return cancelOrder(orderId, user.uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
