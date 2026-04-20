"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnnouncement } from "../hooks/use-announcement";
import { Icon } from "@/components/ui/icon";

export function AnnouncementBanner() {
  const { announcement, ready } = useAnnouncement();
  const [dismissed, setDismissed] = useState<string | null>(null);

  if (!ready) return null;
  if (!announcement?.active || !announcement.message) return null;
  if (dismissed === announcement.message) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={announcement.message}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="flex items-center gap-3 bg-brand-600 px-4 py-2.5 text-white">
          <Icon.Bell size={16} className="flex-shrink-0" />
          <p className="flex-1 text-sm font-medium leading-snug">
            {announcement.message}
          </p>
          <button
            onClick={() => setDismissed(announcement.message)}
            aria-label="Dismiss announcement"
            className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-white/20"
          >
            <Icon.X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
