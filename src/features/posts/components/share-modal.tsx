"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useUserGroups, useCreateGroupPost } from "@/features/groups/hooks/use-groups";
import type { Post } from "../types";

interface ShareModalProps {
  post: Post;
  onClose: () => void;
}

export function ShareModal({ post, onClose }: ShareModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [step, setStep] = useState<"pick" | "compose" | "done">("pick");
  const [copied, setCopied] = useState(false);

  const { user } = useAuth();
  const { data: groups = [], isLoading } = useUserGroups();

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;
  const createGroupPost = useCreateGroupPost(selectedGroupId ?? "");

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  async function handleCopyLink() {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  async function handleShareToGroup() {
    if (!selectedGroupId || !user) return;
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    const fullCaption = caption.trim()
      ? `${caption.trim()}\n\n${postUrl}`
      : postUrl;
    await createGroupPost.mutateAsync({ imageFiles: [], caption: fullCaption });
    setStep("done");
  }

  return (
    <AnimatePresence>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-sm rounded-3xl border border-surface-border bg-surface shadow-elevated overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <h2 className="font-serif text-[17px] font-normal text-ink">
              {step === "pick" ? "Share post" : step === "compose" ? `Share to ${selectedGroup?.name}` : "Shared!"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-hover text-ink-muted transition"
            >
              <Icon.X size={16} />
            </button>
          </div>

          {step === "pick" && (
            <div className="p-4 space-y-3">
              {/* Copy link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex w-full items-center gap-3 rounded-2xl border border-surface-border bg-surface-subtle px-4 py-3 text-sm font-medium text-ink hover:bg-surface-hover transition"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                  <Icon.Link size={16} />
                </span>
                <span className="flex-1 text-left">{copied ? "Link copied!" : "Copy link"}</span>
                {copied && <Icon.Check size={14} className="text-brand-600" />}
              </button>

              {/* Share to group */}
              {user && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted px-1">Share to group</p>
                  {isLoading && (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-12 rounded-2xl skeleton" />
                      ))}
                    </div>
                  )}
                  {!isLoading && groups.length === 0 && (
                    <p className="text-sm text-ink-muted text-center py-2">You haven&apos;t joined any groups yet.</p>
                  )}
                  <ul className="space-y-1.5 max-h-52 overflow-y-auto">
                    {groups.map((group) => (
                      <li key={group.id}>
                        <button
                          type="button"
                          onClick={() => { setSelectedGroupId(group.id); setStep("compose"); }}
                          className="flex w-full items-center gap-3 rounded-2xl border border-surface-border px-3 py-2.5 text-sm hover:bg-surface-hover transition text-left"
                        >
                          <Avatar name={group.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-ink truncate">{group.name}</p>
                            <p className="text-xs text-ink-muted">{group.memberCount} members</p>
                          </div>
                          <Icon.ChevronRight size={14} className="text-ink-muted flex-shrink-0" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {step === "compose" && selectedGroup && (
            <div className="p-4 space-y-3">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={`Add a message to ${selectedGroup.name}… (optional)`}
                rows={3}
                maxLength={300}
                className="input resize-none text-sm w-full"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("pick")}
                  className="btn-secondary btn-sm flex-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleShareToGroup}
                  disabled={createGroupPost.isPending}
                  className="btn-primary btn-sm flex-1"
                >
                  {createGroupPost.isPending ? "Sharing…" : "Share"}
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="px-4 py-8 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
                <Icon.Send size={20} className="text-brand-700" />
              </div>
              <p className="font-serif text-[18px] text-ink">Shared to {selectedGroup?.name}!</p>
              <p className="text-sm text-ink-muted">The group members can now see this post.</p>
              <button type="button" onClick={onClose} className="mt-3 btn-primary btn-sm">
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
