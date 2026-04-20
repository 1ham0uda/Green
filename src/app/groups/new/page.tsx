"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useCreateGroup } from "@/features/groups/hooks/use-groups";
import { Icon } from "@/components/ui/icon";

export default function NewGroupPage() {
  return (
    <main className="container max-w-xl pb-24 md:pb-0">
      <AuthGate>
        <NewGroupForm />
      </AuthGate>
    </main>
  );
}

function NewGroupForm() {
  const router = useRouter();
  const createGroup = useCreateGroup();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }
    setError(null);
    try {
      const group = await createGroup.mutateAsync({
        name,
        description,
        isPublic,
        coverFile,
      });
      router.push(`/groups/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    }
  }

  return (
    <div className="space-y-6">
      <div className="py-5">
        <p className="eyebrow">Community</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Create a Group
        </h1>
        <p className="mt-1 font-sans text-[13px] text-ink-muted">
          Bring gardeners together around a shared interest.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Cover image */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">Cover image</label>
          <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-br from-brand-400 to-brand-700">
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
            )}
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
              <span className="flex items-center gap-1.5 rounded-xl bg-black/50 px-3 py-1.5 text-sm text-white">
                <Icon.ImagePlus size={16} />
                Choose photo
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleCover}
              />
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-ink">
            Group name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            maxLength={60}
            className="input"
            placeholder="e.g. Rooftop Growers Cairo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="desc" className="text-sm font-medium text-ink">
            Description
          </label>
          <textarea
            id="desc"
            rows={3}
            maxLength={300}
            className="input"
            placeholder="What's this group about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-surface-border p-4">
          <div>
            <p className="text-sm font-medium text-ink">Public group</p>
            <p className="text-xs text-ink-muted">
              Anyone can find and join this group.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => setIsPublic((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPublic ? "bg-brand-500" : "bg-surface-border"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                isPublic ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={createGroup.isPending || !name.trim()}
          className="btn-primary w-full"
        >
          {createGroup.isPending ? "Creating…" : "Create group"}
        </button>
      </form>
    </div>
  );
}
