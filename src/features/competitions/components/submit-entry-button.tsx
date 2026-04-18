"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAuthorPosts } from "@/features/posts/hooks/use-post";
import { useSubmitEntry } from "../hooks/use-competitions";

export function SubmitEntryButton({
  competitionId,
}: {
  competitionId: string;
}) {
  const { user } = useAuth();
  const { data: posts } = useAuthorPosts(user?.uid);
  const submit = useSubmitEntry(competitionId);

  const [open, setOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="text-sm text-zinc-500">Sign in to submit an entry.</p>
    );
  }

  async function handleSubmit() {
    if (!selectedPostId) {
      setError("Please select a post.");
      return;
    }
    setError(null);
    try {
      await submit.mutateAsync(selectedPostId);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary"
      >
        Submit entry
      </button>
    );
  }

  return (
    <div className="card space-y-3 p-4">
      <p className="text-sm font-medium text-zinc-800">
        Choose one of your posts to enter:
      </p>

      {!posts || posts.length === 0 ? (
        <p className="text-sm text-zinc-500">
          You need at least one post to submit an entry.
        </p>
      ) : (
        <select
          value={selectedPostId}
          onChange={(e) => setSelectedPostId(e.target.value)}
          className="input"
        >
          <option value="">Select a post…</option>
          {posts.map((post) => (
            <option key={post.id} value={post.id}>
              {post.caption.slice(0, 60) || "(no caption)"}
            </option>
          ))}
        </select>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={submit.isPending}
          className="btn-primary"
        >
          {submit.isPending ? "Submitting…" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
