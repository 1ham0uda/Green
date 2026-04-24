"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useCreateReturn, useHasReturnRequest } from "../hooks/use-returns";
import type { Order } from "../types";

interface Props {
  order: Order;
  onClose: () => void;
}

export function ReturnRequestModal({ order, onClose }: Props) {
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const createReturn = useCreateReturn();
  const { data: alreadyExists } = useHasReturnRequest(order.id);

  function handleFiles(selected: FileList | null) {
    if (!selected) return;
    const arr = Array.from(selected).slice(0, 3 - files.length);
    const newFiles = [...files, ...arr].slice(0, 3);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  }

  function removeFile(i: number) {
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit() {
    if (!reason.trim()) {
      setError("Please enter a reason for the return.");
      return;
    }
    setError(null);
    try {
      await createReturn.mutateAsync({
        orderId: order.id,
        vendorId: order.vendorId,
        reason,
        imageFiles: files,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit return request.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl bg-surface shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <Icon.RotateCcw size={17} className="text-red-500" />
            Request Return
          </h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <Icon.X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {done ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
                <Icon.Check size={24} className="text-brand-700" />
              </div>
              <p className="font-semibold text-ink">Return request submitted</p>
              <p className="text-sm text-ink-muted">Our team will review it and get back to you shortly.</p>
              <button onClick={onClose} className="btn-primary mt-2">Done</button>
            </div>
          ) : alreadyExists ? (
            <div className="text-center py-6 space-y-2">
              <p className="font-medium text-ink">Return already requested</p>
              <p className="text-sm text-ink-muted">You have already submitted a return request for this order.</p>
              <button onClick={onClose} className="btn-secondary mt-2">Close</button>
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-surface-subtle p-3 text-xs text-ink-muted">
                Order #{order.id.slice(0, 8).toUpperCase()} · {order.lines.map((l) => l.name).join(", ")}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink">Reason for return <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  className="input resize-none"
                  placeholder="Describe why you want to return this order…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                />
                <p className="text-xs text-ink-muted text-right">{reason.length}/500</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-ink">Photos (optional, max 3)</p>
                <div className="flex flex-wrap gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl bg-surface-subtle">
                      <Image src={src} alt="Return photo" fill sizes="80px" className="object-cover" />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <Icon.X size={10} />
                      </button>
                    </div>
                  ))}
                  {files.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-surface-border bg-surface-subtle text-ink-muted hover:border-brand-400 transition-colors"
                    >
                      <Icon.ImagePlus size={18} />
                      <span className="text-[10px]">Add photo</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={createReturn.isPending}
                className="btn-primary w-full"
              >
                {createReturn.isPending ? "Submitting…" : "Submit return request"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
