"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useCreatePost } from "../hooks/use-post";
import { Icon } from "@/components/ui/icon";

const MAX_IMAGES = 5;
const MAX_MB = 10;

interface CreatePostFormProps {
  plantId?: string;
  redirectTo?: string;
}

export function CreatePostForm({
  plantId,
  redirectTo = "/feed",
}: CreatePostFormProps = {}) {
  const router = useRouter();
  const createPost = useCreatePost();

  const [caption, setCaption] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    const oversized = selected.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (oversized) {
      setError(`Each image must be under ${MAX_MB} MB.`);
      event.target.value = "";
      return;
    }

    const merged = [...imageFiles, ...selected].slice(0, MAX_IMAGES);
    setImageFiles(merged);
    setPreviews(merged.map((f) => URL.createObjectURL(f)));
    event.target.value = "";
    setError(null);
  }

  function removeImage(index: number) {
    const next = imageFiles.filter((_, i) => i !== index);
    setImageFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (imageFiles.length === 0) {
      setError("Please select at least one image.");
      return;
    }

    setError(null);
    try {
      await createPost.mutateAsync({
        caption,
        imageFiles,
        plantId: plantId ?? null,
      });
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-800">
          Images{" "}
          <span className="font-normal text-ink-muted">
            (up to {MAX_IMAGES})
          </span>
        </label>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previews.map((src, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-xl border border-surface-border bg-surface-subtle"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <Icon.X size={12} />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {imageFiles.length < MAX_IMAGES && (
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-surface-border px-4 py-3 text-sm text-ink-muted transition-colors hover:border-brand-400 hover:text-brand-600">
            <Icon.ImagePlus size={18} />
            Add photos
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="caption" className="text-sm font-medium text-zinc-800">
          Caption
        </label>
        <textarea
          id="caption"
          rows={3}
          maxLength={500}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Tell the community what's growing…"
          className="input"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={createPost.isPending || imageFiles.length === 0}
        className="btn-primary"
      >
        {createPost.isPending ? "Publishing…" : "Publish post"}
      </button>
    </form>
  );
}
