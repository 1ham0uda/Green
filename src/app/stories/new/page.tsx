"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useCreateStory } from "@/features/stories/hooks/use-stories";
import { Icon } from "@/components/ui/icon";

export default function NewStoryPage() {
  return (
    <main className="container max-w-lg pb-24 md:pb-0">
      <AuthGate>
        <NewStoryForm />
      </AuthGate>
    </main>
  );
}

function NewStoryForm() {
  const router = useRouter();
  const createStory = useCreateStory();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!imageFile) {
      setError("Please select an image.");
      return;
    }
    setError(null);
    try {
      await createStory.mutateAsync({ imageFile, caption });
      router.push("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post story");
    }
  }

  return (
    <div className="space-y-6">
      <div className="py-5">
        <p className="eyebrow">Stories</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Add to Your Story
        </h1>
        <p className="mt-1 font-sans text-[13px] text-ink-muted">
          Visible to everyone for 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image picker */}
        {preview ? (
          <div className="relative mx-auto aspect-[9/16] max-h-[480px] w-full overflow-hidden rounded-3xl border border-surface-border bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setPreview(null);
              }}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <Icon.X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-surface-border bg-surface-subtle py-20 transition-colors hover:border-brand-400">
            <Icon.ImagePlus size={32} className="text-ink-muted" />
            <span className="text-sm text-ink-muted">Tap to choose a photo</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFile}
            />
          </label>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-ink">
            Caption{" "}
            <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            type="text"
            className="input"
            maxLength={150}
            placeholder="Say something…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={createStory.isPending || !imageFile}
          className="btn-primary w-full"
        >
          {createStory.isPending ? "Uploading…" : "Share story"}
        </button>
      </form>
    </div>
  );
}
