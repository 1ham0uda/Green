"use client";

import { use } from "react";
import { ProfileHeader } from "@/features/profiles/components/profile-header";
import { ProfilePosts } from "@/features/profiles/components/profile-posts";
import { useProfileByHandle } from "@/features/profiles/hooks/use-profile";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = use(params);
  const { data: profile, isLoading, error } = useProfileByHandle(handle);

  return (
    <main className="container max-w-4xl py-6 sm:py-10">
      {isLoading && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-surface-border bg-surface">
            <Skeleton className="h-36 w-full rounded-none" />
            <div className="p-6">
              <Skeleton className="-mt-16 h-28 w-28 rounded-full" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <EmptyState
          icon={<Icon.Flag size={22} />}
          title="Failed to load profile"
          description={error.message}
        />
      )}

      {!isLoading && !profile && !error && (
        <EmptyState
          icon={<Icon.User size={22} />}
          title="User not found"
          description={`No gardener with handle @${handle}.`}
        />
      )}

      {profile && (
        <div className="space-y-8">
          <ProfileHeader profile={profile} />
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-ink">Posts</h2>
              <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-medium text-ink-muted">
                {profile.postCount}
              </span>
            </div>
            <ProfilePosts uid={profile.uid} />
          </section>
        </div>
      )}
    </main>
  );
}
