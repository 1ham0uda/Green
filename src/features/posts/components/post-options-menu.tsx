"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useSubmitReport } from "@/features/moderation/hooks/use-moderation";
import { useMuteUser } from "../hooks/use-mute";
import { useDeletePost, useTagPostPlant } from "../hooks/use-post";
import { useMyPlants } from "@/features/plants/hooks/use-plants";

type Panel =
  | "idle"
  | "report-form"
  | "report-done"
  | "mute-done"
  | "delete-confirm"
  | "plant-picker";

interface PostOptionsMenuProps {
  postId: string;
  postAuthorId: string;
  postAuthorHandle: string;
  currentPlantId: string | null;
  viewerId: string;
  onClose: () => void;
  /** Called after a successful delete so the parent can navigate away if needed. */
  onDeleted?: () => void;
}

export function PostOptionsMenu({
  postId,
  postAuthorId,
  postAuthorHandle,
  currentPlantId,
  viewerId,
  onClose,
  onDeleted,
}: PostOptionsMenuProps) {
  const menuRef  = useRef<HTMLDivElement>(null);
  const router   = useRouter();
  const [panel, setPanel]   = useState<Panel>("idle");
  const [reason, setReason] = useState("");

  const isOwnPost = viewerId === postAuthorId;

  const report    = useSubmitReport();
  const { mute }  = useMuteUser(viewerId, postAuthorId);
  const deleteMut = useDeletePost(postId, postAuthorId);
  const tagMut    = useTagPostPlant(postId, postAuthorId);
  const { data: myPlants = [] } = useMyPlants();

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
    setPanel("report-done");
  }

  async function handleMute() {
    await mute.mutateAsync();
    setPanel("mute-done");
    setTimeout(onClose, 1200);
  }

  async function handleDelete() {
    await deleteMut.mutateAsync();
    onClose();
    onDeleted?.();
    router.push("/feed");
  }

  async function handleTagPlant(plantId: string | null) {
    await tagMut.mutateAsync(plantId);
    onClose();
  }

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-10 z-50 w-60 rounded-2xl border border-surface-border bg-surface shadow-lg"
      role="menu"
    >
      {/* ── Main menu ── */}
      {panel === "idle" && (
        <ul className="py-1.5">
          {isOwnPost ? (
            <>
              {/* Author-only actions */}
              <li>
                <button
                  type="button"
                  onClick={() => setPanel("plant-picker")}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-hover"
                  role="menuitem"
                >
                  <Icon.Leaf size={15} className="text-brand-600" />
                  {currentPlantId ? "Change plant tag" : "Tag a plant"}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPanel("delete-confirm")}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  role="menuitem"
                >
                  <Icon.Trash size={15} />
                  Delete post
                </button>
              </li>
            </>
          ) : (
            <>
              {/* Viewer actions */}
              <li>
                <button
                  type="button"
                  onClick={() => setPanel("report-form")}
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
                  Mute @{postAuthorHandle}
                </button>
              </li>
            </>
          )}
        </ul>
      )}

      {/* ── Report form ── */}
      {panel === "report-form" && (
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
            <button type="button" onClick={() => setPanel("idle")} className="btn-secondary btn-sm flex-1">
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

      {/* ── Report done ── */}
      {panel === "report-done" && (
        <div className="px-4 py-5 text-center space-y-1">
          <Icon.Check size={20} className="mx-auto text-brand-600" />
          <p className="text-sm font-medium text-ink">Report submitted</p>
          <p className="text-xs text-ink-muted">Thanks — we&apos;ll review it soon.</p>
          <button type="button" onClick={onClose} className="mt-2 text-xs text-brand-600 hover:underline">
            Close
          </button>
        </div>
      )}

      {/* ── Mute done ── */}
      {panel === "mute-done" && (
        <div className="px-4 py-5 text-center space-y-1">
          <Icon.VolumeX size={20} className="mx-auto text-ink-muted" />
          <p className="text-sm font-medium text-ink">@{postAuthorHandle} muted</p>
          <p className="text-xs text-ink-muted">Their posts won&apos;t appear in your feed.</p>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {panel === "delete-confirm" && (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-red-600">
            <Icon.Trash size={16} />
            <p className="text-sm font-medium">Delete this post?</p>
          </div>
          <p className="text-xs text-ink-muted">
            This is permanent. The post and all its likes and comments will be removed.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPanel("idle")} className="btn-secondary btn-sm flex-1">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMut.isPending}
              className="flex-1 rounded-xl bg-red-600 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteMut.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      )}

      {/* ── Plant picker ── */}
      {panel === "plant-picker" && (
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Tag a plant</p>
            <button type="button" onClick={() => setPanel("idle")} className="text-ink-muted hover:text-ink">
              <Icon.X size={16} />
            </button>
          </div>

          {myPlants.length === 0 ? (
            <p className="py-4 text-center text-xs text-ink-muted">
              You haven&apos;t added any plants yet.
            </p>
          ) : (
            <ul className="max-h-56 overflow-y-auto space-y-0.5">
              {currentPlantId && (
                <li>
                  <button
                    type="button"
                    onClick={() => handleTagPlant(null)}
                    disabled={tagMut.isPending}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Icon.X size={14} />
                    Remove plant tag
                  </button>
                </li>
              )}
              {myPlants.map((plant) => {
                const isTagged = plant.id === currentPlantId;
                return (
                  <li key={plant.id}>
                    <button
                      type="button"
                      onClick={() => handleTagPlant(plant.id)}
                      disabled={tagMut.isPending || isTagged}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-surface-hover disabled:opacity-50"
                    >
                      {plant.imageURL ? (
                        <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-surface-subtle">
                          <Image src={plant.imageURL} alt={plant.name} fill sizes="32px" className="object-cover" />
                        </div>
                      ) : (
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                          <Icon.Leaf size={14} className="text-brand-600" />
                        </span>
                      )}
                      <div className="min-w-0 text-left">
                        <p className="truncate font-medium">{plant.name}</p>
                        <p className="truncate text-[11px] text-ink-muted">{plant.type}</p>
                      </div>
                      {isTagged && (
                        <Icon.Check size={14} className="ml-auto text-brand-600 flex-shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
