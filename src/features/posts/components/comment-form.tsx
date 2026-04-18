"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAddComment } from "../hooks/use-comments";

export function CommentForm({ postId }: { postId: string }) {
  const { user } = useAuth();
  const addComment = useAddComment(postId);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="text-sm text-zinc-500">Sign in to leave a comment.</p>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setError(null);
    try {
      await addComment.mutateAsync(trimmed);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="comment-body" className="sr-only">
        Add a comment
      </label>
      <textarea
        id="comment-body"
        rows={2}
        maxLength={500}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment…"
        className="input"
      />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={addComment.isPending || body.trim().length === 0}
          className="btn-primary"
        >
          {addComment.isPending ? "Posting…" : "Post comment"}
        </button>
      </div>
    </form>
  );
}
