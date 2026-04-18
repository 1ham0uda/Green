"use client";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { markOneRead } from "@/features/notifications/services/notification-service";
import { useAuth } from "@/features/auth/hooks/use-auth";

export default function NotificationsPage() {
  return (
    <main className="container max-w-2xl py-8">
      <AuthGate>
        <NotificationsContent />
      </AuthGate>
    </main>
  );
}

function NotificationsContent() {
  const { user } = useAuth();
  const { notifications, loading, unreadCount, readAll } = useNotifications();

  function handleRead(id: string) {
    if (!user) return;
    void markOneRead(user.uid, id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Notifications</h1>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void readAll()}
            className="btn-secondary text-sm"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="card divide-y divide-surface-border overflow-hidden">
        {loading && (
          <p className="p-6 text-sm text-zinc-500">Loading…</p>
        )}

        {!loading && notifications.length === 0 && (
          <p className="p-8 text-center text-sm text-zinc-500">
            No notifications yet.
          </p>
        )}

        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onRead={handleRead} />
        ))}
      </div>
    </div>
  );
}
