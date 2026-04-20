"use client";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { markOneRead } from "@/features/notifications/services/notification-service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonRow } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";

export default function NotificationsPage() {
  return (
    <main className="mx-auto w-full max-w-[640px] pb-24 md:pb-0">
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
    <div>
      <div className="flex items-center justify-between gap-4 px-4 pb-3 pt-5">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
            Activity
            {unreadCount > 0 && (
              <span className="ml-2 tabular-nums font-sans text-[14px] font-normal text-brand-500">
                {unreadCount} new
              </span>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void readAll()}
            className="btn-ghost btn-sm"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="border-t border-surface-border">
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
          />
        )}

        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onRead={handleRead} />
        ))}
      </div>
    </div>
  );
}
