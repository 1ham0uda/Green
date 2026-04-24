"use client";

import { useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/utils/format";
import type { Order } from "../types";

interface Props {
  order: Order;
  onClose: () => void;
}

export function OrderInvoiceModal({ order, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const total = order.subtotal + order.shippingFee;

  const date = order.createdAt
    ? new Date(order.createdAt.toMillis()).toLocaleDateString("en-EG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  function handlePrint() {
    if (!printRef.current) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice · ${order.id.slice(0, 8).toUpperCase()}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #111; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .muted { color: #888; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #eee; font-size: 13px; }
        th { font-weight: 600; color: #555; }
        .total { font-weight: bold; font-size: 15px; }
        .address { background: #f8f8f8; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-top: 20px; }
      </style></head><body>
      ${printRef.current.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-surface shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <Icon.FileText size={18} className="text-ink-muted" />
            Invoice
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Icon.Printer size={14} />
              Print
            </button>
            <button onClick={onClose} className="text-ink-muted hover:text-ink">
              <Icon.X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice content */}
        <div className="overflow-y-auto max-h-[70vh] p-6">
          <div ref={printRef} className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-serif text-[22px] font-normal text-ink">Green.</h1>
                <p className="text-xs text-ink-muted mt-0.5">Marketplace Invoice</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Order</p>
                <p className="font-mono text-sm font-bold text-ink">#{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-ink-muted">{date}</p>
              </div>
            </div>

            {/* Shipping address */}
            <div className="rounded-xl bg-surface-subtle p-4 text-sm space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Ship to</p>
              <p className="font-medium text-ink">{order.shippingAddress.recipientName}</p>
              <p className="text-ink-muted">{order.shippingAddress.phone}</p>
              <p className="text-ink-muted">
                {order.shippingAddress.addressLine}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.governorate}
              </p>
            </div>

            {/* Line items */}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="py-2 text-left font-semibold text-ink-muted text-xs uppercase tracking-wider">Item</th>
                  <th className="py-2 text-center font-semibold text-ink-muted text-xs uppercase tracking-wider">Qty</th>
                  <th className="py-2 text-right font-semibold text-ink-muted text-xs uppercase tracking-wider">Price</th>
                  <th className="py-2 text-right font-semibold text-ink-muted text-xs uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {order.lines.map((line) => (
                  <tr key={line.productId}>
                    <td className="py-2.5 text-ink">{line.name}</td>
                    <td className="py-2.5 text-center text-ink-muted">{line.quantity}</td>
                    <td className="py-2.5 text-right text-ink-muted tabular-nums">
                      {formatPrice(line.unitPrice, order.currency)}
                    </td>
                    <td className="py-2.5 text-right font-medium text-ink tabular-nums">
                      {formatPrice(line.unitPrice * line.quantity, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="space-y-2 border-t border-surface-border pt-3">
              <div className="flex justify-between text-sm text-ink-muted">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-ink-muted">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingFee, order.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-ink border-t border-surface-border pt-2">
                <span>Total</span>
                <span>{formatPrice(total, order.currency)}</span>
              </div>
            </div>

            <div className="flex justify-between rounded-xl bg-surface-subtle px-4 py-3 text-xs text-ink-muted">
              <span>Payment method</span>
              <span className="font-medium text-ink capitalize">{order.paymentMethod === "cod" ? "Cash on delivery" : order.paymentMethod}</span>
            </div>

            <p className="text-center text-xs text-ink-muted">Thank you for shopping at Green Marketplace.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
