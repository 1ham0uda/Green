"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useSubmitReport } from "@/features/moderation/hooks/use-moderation";
import { useMuteUser } from "../hooks/use-mute";

interface PostOptionsMenuProps {
  postId: string;
  postAuthorId: string;
  postAuthorHandle: string;
  viewerId: string;
  onClose: () => void;
}

export function PostOptionsMenu({
  postId,
  postAuthorId,
  postAuthorHandle,
  viewerId,
  onClose,
}: PostOptionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [reportStep, setReportStep] = useState<"idle" | "form" | "done">("idle");
  const [muteStep, setMuteStep] = useState<"idle" | "done">("idle");
  const [reason, setReason] = useState("");

  const report = useSubmitReport();
  const { mute } = useMuteUser(viewerId, postAuthorId);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  async function handleReport() {
    if (!reason.trim()) return;
    await report.mutateAsync({
      reporterId: viewerId,
      targetId: postId,
      targetType: "post",
      reason: reason.trim(),
    });
    setReportStep("done");
  }

  async function handleMute() {
    await mute.mutateAsync();
    setMuteStep("done");
    setTimeout(onClose, 1200);
  }

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-surface-border bg-surface shadow-lg"
      role="menu"
    >
      {reportStep === "idle" && muteStep === "idle" && (
        <ul className="py-1.5">
          <li>
            <button
              type="button"
              onClick={() => setReportStep("form")}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-hover"
              role="menuitem"
            >
              <Icon.Flag size={15} className="text-ink-muted" />
              Report post
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={handleMute}
              disabled={mute.isPending}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-hover disabled:opacity-50"
              role="menuitem"
            >
              <Icon.VolumeX size={15} className="text-ink-muted" />
              Mute posts from @{postAuthorHandle}
            </button>
          </li>
        </ul>
      )}

      {reportStep === "form" && (
        <div className="p-4 space-y-3">
          <p className="text-sm font-medium text-ink">Why are you reporting this?</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell us what's wrong…"
            maxLength={300}
            rows={3}
            className="input resize-none text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReportStep("idle")}
              className="btn-secondary btn-sm flex-1"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleReport}
              disabled={!reason.trim() || report.isPending}
              className="btn-primary btn-sm flex-1"
            >
              {report.isPending ? "Sending…" : "Submit"}
            </button>
          </div>
        </div>
      )}

      {reportStep === "done" && (
        <div className="px-4 py-5 text-center space-y-1">
          <Icon.Check size={20} className="mx-auto text-brand-600" />
          <p className="text-sm font-medium text-ink">Report submitted</p>
          <p className="text-xs text-ink-muted">Thanks — we&apos;ll review it soon.</p>
          <button type="button" onClick={onClose} className="mt-2 text-xs text-brand-600 hover:underline">
            Close
          </button>
        </div>
      )}

      {muteStep === "done" && (
        <div className="px-4 py-5 text-center space-y-1">
          <Icon.VolumeX size={20} className="mx-auto text-ink-muted" />
          <p className="text-sm font-medium text-ink">@{postAuthorHandle} muted</p>
          <p className="text-xs text-ink-muted">Their posts won&apos;t appear in your feed.</p>
        </div>
      )}
    </div>
  );
}
