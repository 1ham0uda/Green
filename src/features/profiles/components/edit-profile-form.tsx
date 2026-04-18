"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { updateProfile } from "../services/profile-service";

export function EditProfileForm() {
  const { user, initialized } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [handle, setHandle] = useState(user?.handle ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!initialized) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (!user) {
    return <p className="text-sm text-zinc-500">You must be signed in.</p>;
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);

    try {
      await updateProfile(user.uid, {
        displayName,
        bio,
        handle,
        avatarFile,
      });
      router.push(`/u/${handle}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="displayName" className="text-sm font-medium text-zinc-800">
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          required
          minLength={2}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="handle" className="text-sm font-medium text-zinc-800">
          Handle
        </label>
        <input
          id="handle"
          type="text"
          required
          pattern="[a-z0-9_]{2,20}"
          value={handle}
          onChange={(e) => setHandle(e.target.value.toLowerCase())}
          className="input"
        />
        <p className="text-xs text-zinc-500">
          Lowercase letters, numbers, and underscore. 2–20 characters.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="bio" className="text-sm font-medium text-zinc-800">
          Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          maxLength={280}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="input"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="avatar" className="text-sm font-medium text-zinc-800">
          Avatar
        </label>
        <input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
