"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { useNotifications } from "../hooks/use-notifications";

export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <Link
      href="/notifications"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
    >
      <Icon.Bell size={20} />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-soft ring-2 ring-surface"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
