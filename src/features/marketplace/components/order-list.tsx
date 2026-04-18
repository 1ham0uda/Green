"use client";

import { formatPrice } from "@/lib/utils/format";
import type { Order, OrderStatus } from "../types";
import { OrderStatusSelect } from "./order-status-select";

interface OrderListProps {
  orders: Order[];
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  statusUpdating?: string | null;
}

export function OrderList({
  orders,
  onStatusChange,
  statusUpdating,
}: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-zinc-500">
        No orders yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <article key={order.id} className="card p-4">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Order · {order.id.slice(0, 8)}
              </p>
              {onStatusChange ? (
                <OrderStatusSelect
                  value={order.status}
                  disabled={statusUpdating === order.id}
                  onChange={(next) => onStatusChange(order.id, next)}
                />
              ) : (
                <p className="text-sm text-zinc-700">
                  Status:{" "}
                  <span className="font-medium capitalize text-zinc-900">
                    {order.status}
                  </span>
                </p>
              )}
            </div>
            <p className="text-lg font-semibold text-zinc-900">
              {formatPrice(order.subtotal, order.currency)}
            </p>
          </header>

          <ul className="mt-3 space-y-2">
            {order.lines.map((line) => (
              <li
                key={line.productId}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-700">
                  {line.name} × {line.quantity}
                </span>
                <span className="text-zinc-600">
                  {formatPrice(line.unitPrice * line.quantity, order.currency)}
                </span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
