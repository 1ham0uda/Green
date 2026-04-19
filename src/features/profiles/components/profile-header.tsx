"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { VerificationBadge } from "@/features/verification/components/verification-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { PublicProfile } from "../types";
import {
  useFollowMutations,
  useFollowStatus,
} from "../hooks/use-follow";

interface ProfileHeaderProps {
  profile: PublicProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { user } = useAuth();
  const viewerId = user?.uid ?? null;
  const isSelf = viewerId === profile.uid;

  const { data: following } = useFollowStatus(viewerId, profile.uid);
  const { follow, unfollow } = useFollowMutations(
    viewerId,
    user?.handle ?? null,
    profile.uid
  );

  return (
    <section className="relative overflow-hidden rounded-3xl border border-surface-border bg-surface shadow-card">
      {/* Cover gradient */}
      <div className="h-28 bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 sm:h-36" />

      <div className="px-6 pb-6 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="-mt-14 flex flex-col items-start gap-4 sm:-mt-16 sm:flex-row sm:items-end">
            <div className="rounded-full bg-surface p-1 shadow-card">
              <Avatar
                src={profile.photoURL}
                name={profile.displayName}
                size="2xl"
              />
            </div>

            <div className="space-y-1.5 sm:pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink">
                  {profile.displayName}
                  {profile.isVerified && <VerificationBadge size="md" />}
                </h1>
                {profile.role === "business" && (
                  <Badge variant="blue">
                    <Icon.ShoppingBag size={12} />
                    Business
                  </Badge>
                )}
                {profile.role === "admin" && (
                  <Badge variant="red">
                    <Icon.Shield size={12} />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-ink-muted">@{profile.handle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:pb-2">
            {!isSelf && viewerId && (
              <>
                {following ? (
                  <Button
                    variant="secondary"
                    onClick={() => unfollow.mutate()}
                    isLoading={unfollow.isPending}
                  >
                    Following
                  </Button>
                ) : (
                  <Button
                    onClick={() => follow.mutate()}
                    isLoading={follow.isPending}
                  >
                    Follow
                  </Button>
                )}
                <a href="#" className="btn-secondary">
                  <Icon.MessageCircle size={16} />
                </a>
              </>
            )}

            {isSelf && (
              <a href="/settings/profile" className="btn-secondary">
                <Icon.Settings size={16} />
                Edit profile
              </a>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-ink">
            {profile.bio}
          </p>
        )}

        <div className="mt-5 grid grid-cols-3 divide-x divide-surface-border rounded-2xl border border-surface-border bg-surface-muted">
          <Stat label="Posts" value={profile.postCount} />
          <Stat label="Followers" value={profile.followerCount} />
          <Stat label="Following" value={profile.followingCount} />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center py-3">
      <span className="text-lg font-bold tabular-nums text-ink">{value}</span>
      <span className="text-xs uppercase tracking-wider text-ink-muted">
        {label}
      </span>
    </div>
  );
}
