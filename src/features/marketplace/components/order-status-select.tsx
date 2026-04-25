"use client";

import { getValidVendorTransitions } from "../services/order-service";
import type { OrderStatus } from "../types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    "Pending",
  accepted:   "Accepted",
  processing: "Processing",
  confirmed:  "Confirmed",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

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
  const validNext = getValidVendorTransitions(value);
  const isTerminal = validNext.length === 0;

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-600">
      <span className="sr-only">Order status</span>
      {isTerminal ? (
        // Terminal state — show a read-only badge instead of a select so
        // vendors cannot accidentally move a delivered/cancelled order.
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
          {STATUS_LABELS[value]}
        </span>
      ) : (
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as OrderStatus)}
          className="input w-auto"
        >
          {/* Current status is always shown */}
          <option value={value}>{STATUS_LABELS[value]}</option>
          {validNext.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      )}
    </label>
  );
}
