"use client";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { markOneRead } from "@/features/notifications/services/notification-service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonRow } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPage() {
  return (
    <main className="container max-w-2xl py-6 sm:py-10">
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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-display-sm font-bold tracking-tight text-ink">
            Activity
            {unreadCount > 0 && (
              <Badge variant="red" dot>
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Follows, likes, and comments on your posts.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={() => void readAll()}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="card divide-y divide-surface-border overflow-hidden">
        {loading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}

        {!loading && notifications.length === 0 && (
          <EmptyState
            icon={<Icon.Bell size={22} />}
            title="You're all caught up"
            description="When someone follows, likes, or comments, you'll see it here."
            className="border-0 shadow-none"
          />
        )}

        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onRead={handleRead} />
        ))}
      </div>
    </div>
  );
}
