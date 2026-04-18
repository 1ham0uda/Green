"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import type {
  CreateProductInput,
  Product,
} from "../types";

interface ProductFormProps {
  initial?: Product | null;
  submitLabel: string;
  pending: boolean;
  onSubmit: (input: CreateProductInput) => Promise<unknown>;
}

export function ProductForm({
  initial,
  submitLabel,
  pending,
  onSubmit,
}: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState<string>(
    initial?.price !== undefined ? String(initial.price) : ""
  );
  const [stock, setStock] = useState<string>(
    initial?.stock !== undefined ? String(initial.stock) : "0"
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.imageURL ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Price must be a non-negative number.");
      return;
    }

    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setError("Stock must be a non-negative integer.");
      return;
    }

    try {
      await onSubmit({
        name,
        description,
        price: parsedPrice,
        stock: Math.floor(parsedStock),
        imageFile,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-zinc-800">
          Product name
        </label>
        <input
          id="name"
          type="text"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium text-zinc-800">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="price" className="text-sm font-medium text-zinc-800">
            Price (USD)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="stock" className="text-sm font-medium text-zinc-800">
            Stock
          </label>
          <input
            id="stock"
            type="number"
            step="1"
            min="0"
            required
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="image" className="text-sm font-medium text-zinc-800">
          Product image
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-sm"
        />
        {preview && (
          <div className="mt-2 overflow-hidden rounded-md border border-surface-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="h-48 w-full object-cover" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
