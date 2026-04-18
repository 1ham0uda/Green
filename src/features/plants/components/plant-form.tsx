"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { PLANT_TYPES, type CreatePlantInput, type Plant, type PlantType } from "../types";

interface PlantFormProps {
  initial?: Plant | null;
  submitLabel: string;
  onSubmit: (input: CreatePlantInput) => Promise<unknown>;
  pending: boolean;
}

export function PlantForm({
  initial,
  submitLabel,
  onSubmit,
  pending,
}: PlantFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<PlantType>(initial?.type ?? "herb");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initial?.imageURL ?? null
  );
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await onSubmit({ name, type, description, imageFile });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-zinc-800">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          minLength={1}
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="type" className="text-sm font-medium text-zinc-800">
          Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as PlantType)}
          className="input"
        >
          {PLANT_TYPES.map((pt) => (
            <option key={pt.value} value={pt.value}>
              {pt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium text-zinc-800">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="image" className="text-sm font-medium text-zinc-800">
          Photo
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
