"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  markAllRead,
  subscribeToNotifications,
} from "../services/notification-service";
import type { Notification } from "../types";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToNotifications(user.uid, (items) => {
      setNotifications(items);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function readAll() {
    if (!user?.uid) return;
    await markAllRead(user.uid);
  }

  return { notifications, loading, unreadCount, readAll };
}
