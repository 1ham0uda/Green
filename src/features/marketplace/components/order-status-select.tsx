"use client";

import type { OrderStatus } from "../types";

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

interface OrderStatusSelectProps {
  value: OrderStatus;
  onChange: (next: OrderStatus) => void;
  disabled?: boolean;
}

export function OrderStatusSelect({
  value,
  onChange,
  disabled,
}: OrderStatusSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-600">
      <span className="sr-only">Order status</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as OrderStatus)}
        className="input w-auto"
      >
        {STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </label>
  );
}
