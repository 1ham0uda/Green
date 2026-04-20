"use client";

import { useState } from "react";
import {
  clearAnnouncement,
  publishAnnouncement,
} from "@/features/announcements/services/announcement-service";
import { useAnnouncement } from "@/features/announcements/hooks/use-announcement";
import { Icon } from "@/components/ui/icon";

export default function AdminAnnouncementsPage() {
  const { announcement } = useAnnouncement();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handlePublish() {
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }
    setError(null);
    setSuccess(false);
    setPending(true);
    try {
      await publishAnnouncement(message.trim());
      setMessage("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setPending(false);
    }
  }

  async function handleClear() {
    if (!confirm("Remove the current announcement?")) return;
    setPending(true);
    try {
      await clearAnnouncement();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-1">Admin</p>
        <h2 className="font-serif text-[24px] font-normal tracking-[-0.02em] text-ink">Global Announcement</h2>
      </div>

      {announcement?.active && (
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <Icon.Bell size={20} className="mt-0.5 flex-shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-amber-900">
              Currently active
            </p>
            <p className="mt-1 text-sm text-amber-800">
              &ldquo;{announcement.message}&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={pending}
            className="flex-shrink-0 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-50 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      )}

      {!announcement?.active && (
        <p className="text-sm text-ink-muted">No active announcement.</p>
      )}

      <div className="rounded-2xl border border-surface-border bg-surface space-y-4 p-6">
        <p className="eyebrow">Send New Announcement</p>
        <p className="font-sans text-[13px] text-ink-muted">
          This message will appear at the top of every page for all users until
          cleared. Keep it short and actionable.
        </p>

        <textarea
          rows={3}
          maxLength={200}
          className="input"
          placeholder="e.g. 🌱 Don't forget to water your plants today and share your progress!"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p className="text-right text-xs text-ink-muted">
          {message.length}/200
        </p>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
            Announcement sent to all users.
          </p>
        )}

        <button
          type="button"
          onClick={handlePublish}
          disabled={pending || !message.trim()}
          className="btn-primary"
        >
          {pending ? "Sending…" : "Send to all users"}
        </button>
      </div>
    </div>
  );
}
