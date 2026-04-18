"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useCreatePost } from "../hooks/use-post";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!imageFile) {
      setError("Please select an image.");
      return;
    }

    setError(null);
    try {
      await createPost.mutateAsync({
        caption,
        imageFile,
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
      <div className="space-y-1">
        <label htmlFor="image" className="text-sm font-medium text-zinc-800">
          Image
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          required
          onChange={handleFileChange}
          className="text-sm"
        />
        {preview && (
          <div className="mt-2 overflow-hidden rounded-md border border-surface-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="h-64 w-full object-cover"
            />
          </div>
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
        disabled={createPost.isPending}
        className="btn-primary"
      >
        {createPost.isPending ? "Publishing…" : "Publish post"}
      </button>
    </form>
  );
}
