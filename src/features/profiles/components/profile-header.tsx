"use client";

import Image from "next/image";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { VerificationBadge } from "@/features/verification/components/verification-badge";
import { Avatar } from "@/components/ui/avatar";
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
    <section className="border-b border-surface-border bg-surface">
      {/* Cover */}
      <div className="relative h-28 sm:h-40">
        {profile.coverPhotoURL ? (
          <Image
            src={profile.coverPhotoURL}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-surface-subtle" />
        )}
      </div>

      <div className="px-5 pb-5 sm:px-6">
        {/* Avatar row */}
        <div className="-mt-10 mb-3 flex items-end justify-between">
          <div className="rounded-full border-4 border-surface bg-surface">
            <Avatar src={profile.photoURL} name={profile.displayName} size="2xl" />
          </div>

          <div className="flex items-center gap-2 pb-1">
            {!isSelf && viewerId && (
              <>
                {following ? (
                  <button
                    type="button"
                    onClick={() => unfollow.mutate()}
                    disabled={unfollow.isPending}
                    className="btn-secondary btn-sm"
                  >
                    Following
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => follow.mutate()}
                    disabled={follow.isPending}
                    className="btn-primary btn-sm"
                  >
                    Follow
                  </button>
                )}
                <a href="#" className="btn-secondary btn-sm aspect-square !px-0 flex items-center justify-center w-8 h-8">
                  <Icon.MessageCircle size={15} />
                </a>
              </>
            )}
            {isSelf && (
              <a href="/settings/profile" className="btn-secondary btn-sm flex items-center gap-1.5">
                <Icon.Settings size={14} />
                Edit profile
              </a>
            )}
          </div>
        </div>

        {/* Name + handle */}
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-[24px] font-normal leading-tight tracking-[-0.02em] text-ink">
              {profile.displayName}
            </h1>
            {profile.isVerified && <VerificationBadge size="sm" />}
            {profile.role === "business" && (
              <span className="badge badge-zinc">Business</span>
            )}
            {profile.role === "admin" && (
              <span className="badge badge-red">Admin</span>
            )}
          </div>
          <p className="font-sans text-[13px] text-ink-muted">@{profile.handle}</p>
        </div>

        {profile.bio && (
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-pretty text-ink-soft">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="mt-4 flex gap-5">
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
    <div className="flex flex-col">
      <span className="tabular-nums font-sans text-[15px] font-medium text-ink">
        {value.toLocaleString()}
      </span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}
