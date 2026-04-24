"use client";

import { ProfileHeader } from "@/features/profiles/components/profile-header";
import { ProfilePosts } from "@/features/profiles/components/profile-posts";
import { StoryHighlights } from "@/features/highlights/components/story-highlights";
import { BusinessProducts } from "@/features/profiles/components/business-products";
import { useProfileByHandle } from "@/features/profiles/hooks/use-profile";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";

interface ProfilePageProps {
  params: { handle: string };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = params;
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useProfileByHandle(handle);

  return (
    <main className="mx-auto w-full max-w-[640px] pb-24 md:pb-0">
      {isLoading && (
        <div>
          <div className="skeleton h-28 w-full rounded-none" />
          <div className="px-5 pt-3 space-y-2">
            <div className="skeleton h-6 w-36 rounded-full" />
            <div className="skeleton h-4 w-24 rounded-full" />
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
        <div>
          <ProfileHeader profile={profile} />
          <StoryHighlights uid={profile.uid} />
          {(profile.role === "business" || profile.role === "admin") && (
            <BusinessProducts vendorId={profile.uid} />
          )}
          <ProfilePosts uid={profile.uid} isSelf={user?.uid === profile.uid} />
        </div>
      )}
    </main>
  );
}
