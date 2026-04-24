"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/utils/format";
import type { Order, OrderStatus } from "../types";
import { OrderStatusSelect } from "./order-status-select";
import { ReturnRequestModal } from "./return-request-modal";
import { OrderInvoiceModal } from "./order-invoice-modal";

const STATUS_STEPS: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "text-amber-700",  bg: "bg-amber-100"  },
  confirmed: { label: "Confirmed", color: "text-blue-700",   bg: "bg-blue-100"   },
  shipped:   { label: "Shipped",   color: "text-violet-700", bg: "bg-violet-100" },
  delivered: { label: "Delivered", color: "text-brand-700",  bg: "bg-brand-100"  },
  cancelled: { label: "Cancelled", color: "text-red-700",    bg: "bg-red-100"    },
};

const STEP_ICONS: Record<OrderStatus, typeof Icon.Clock> = {
  pending:   Icon.Clock,
  confirmed: Icon.Check,
  shipped:   Icon.Package,
  delivered: Icon.ShoppingBag,
  cancelled: Icon.X,
};

interface OrderCardProps {
  order: Order;
  /** Vendor mode: show status select instead of tracking */
  vendorMode?: boolean;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  statusUpdating?: boolean;
  /** Buyer mode: show return request + invoice */
  buyerMode?: boolean;
}

export function OrderCard({
  order,
  vendorMode = false,
  onStatusChange,
  statusUpdating = false,
  buyerMode = false,
}: OrderCardProps) {
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReturn, setShowReturn] = useState(false);

  const meta = STATUS_META[order.status];
  const total = order.subtotal + order.shippingFee;
  const date = order.createdAt
    ? new Date(order.createdAt.toMillis()).toLocaleDateString("en-EG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <>
      <article className="rounded-2xl border border-surface-border bg-surface overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-surface-border">
          <div className="space-y-0.5">
            <p className="font-sans text-[11px] uppercase tracking-wider text-ink-muted">
              Order · {order.id.slice(0, 8).toUpperCase()}
              {date && <span className="ml-2 normal-case">· {date}</span>}
            </p>
            {vendorMode && onStatusChange ? (
              <OrderStatusSelect
                value={order.status}
                disabled={statusUpdating}
                onChange={(next) => onStatusChange(order.id, next)}
              />
            ) : (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.bg} ${meta.color}`}>
                {meta.label}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-muted">Total</p>
            <p className="text-lg font-bold text-ink">{formatPrice(total, order.currency)}</p>
          </div>
        </div>

        {/* Tracking timeline — buyer only, not cancelled */}
        {buyerMode && order.status !== "cancelled" && (
          <div className="px-5 py-4 border-b border-surface-border">
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => {
                const stepIndex = STATUS_STEPS.indexOf(order.status);
                const done = i <= stepIndex;
                const Ico = STEP_ICONS[step];
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                        done ? "bg-brand-600 text-white" : "bg-surface-subtle text-ink-muted"
                      }`}>
                        <Ico size={14} />
                      </div>
                      <span className={`text-[10px] font-medium whitespace-nowrap ${done ? "text-brand-700" : "text-ink-muted"}`}>
                        {STATUS_META[step].label}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 rounded ${
                        i < STATUS_STEPS.indexOf(order.status) ? "bg-brand-500" : "bg-surface-border"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lines */}
        <ul className="divide-y divide-surface-border px-5">
          {order.lines.map((line) => (
            <li key={line.productId} className="flex items-center gap-3 py-3">
              <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-surface-subtle">
                {line.imageURL && (
                  <Image src={line.imageURL} alt={line.name} fill sizes="44px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{line.name}</p>
                <p className="text-xs text-ink-muted">{line.quantity} × {formatPrice(line.unitPrice, order.currency)}</p>
              </div>
              <p className="text-sm font-semibold text-ink tabular-nums">
                {formatPrice(line.unitPrice * line.quantity, order.currency)}
              </p>
            </li>
          ))}
        </ul>

        {/* Totals */}
        <div className="px-5 py-3 border-t border-surface-border space-y-1.5">
          <div className="flex justify-between text-sm text-ink-muted">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-muted">
            <span>Shipping</span>
            <span>{formatPrice(order.shippingFee, order.currency)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-ink border-t border-surface-border pt-1.5">
            <span>Total</span>
            <span>{formatPrice(total, order.currency)}</span>
          </div>
        </div>

        {/* Shipping address */}
        {order.shippingAddress?.recipientName && (
          <div className="mx-5 mb-4 rounded-xl bg-surface-subtle p-3 text-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1">
              <Icon.MapPin size={11} /> Delivery · Cash on delivery
            </p>
            <p className="font-medium text-ink">{order.shippingAddress.recipientName}</p>
            <p className="text-ink-muted">{order.shippingAddress.phone}</p>
            <p className="text-ink-muted">
              {order.shippingAddress.addressLine}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.governorate}
            </p>
            {order.shippingAddress.notes && (
              <p className="mt-1 text-xs italic text-ink-subtle">Note: {order.shippingAddress.notes}</p>
            )}
          </div>
        )}

        {/* Buyer actions */}
        {buyerMode && (
          <div className="flex gap-2 px-5 pb-4">
            <button
              onClick={() => setShowInvoice(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-surface-border bg-surface py-2 text-sm font-medium text-ink hover:bg-surface-subtle transition-colors"
            >
              <Icon.FileText size={15} />
              Invoice
            </button>
            {order.status === "delivered" && (
              <button
                onClick={() => setShowReturn(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                <Icon.RotateCcw size={15} />
                Request Return
              </button>
            )}
          </div>
        )}
      </article>

      {showInvoice && (
        <OrderInvoiceModal order={order} onClose={() => setShowInvoice(false)} />
      )}
      {showReturn && (
        <ReturnRequestModal order={order} onClose={() => setShowReturn(false)} />
      )}
    </>
  );
}
