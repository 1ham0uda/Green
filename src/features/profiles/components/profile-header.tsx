"use client";

import Image from "next/image";
import { useAuth } from "@/features/auth/hooks/use-auth";
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
    <section className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-brand-100">
          {profile.photoURL ? (
            <Image
              src={profile.photoURL}
              alt={profile.displayName}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-brand-700">
              {profile.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {profile.displayName}
          </h1>
          <p className="text-sm text-zinc-500">@{profile.handle}</p>
          {profile.bio && (
            <p className="mt-2 max-w-xl text-sm text-zinc-700">{profile.bio}</p>
          )}

          <div className="mt-3 flex gap-4 text-sm text-zinc-600">
            <span>
              <strong className="text-zinc-900">{profile.postCount}</strong> posts
            </span>
            <span>
              <strong className="text-zinc-900">{profile.followerCount}</strong>{" "}
              followers
            </span>
            <span>
              <strong className="text-zinc-900">{profile.followingCount}</strong>{" "}
              following
            </span>
          </div>
        </div>
      </div>

      {!isSelf && viewerId && (
        <div>
          {following ? (
            <button
              type="button"
              onClick={() => unfollow.mutate()}
              disabled={unfollow.isPending}
              className="btn-secondary"
            >
              {unfollow.isPending ? "…" : "Unfollow"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => follow.mutate()}
              disabled={follow.isPending}
              className="btn-primary"
            >
              {follow.isPending ? "…" : "Follow"}
            </button>
          )}
        </div>
      )}

      {isSelf && (
        <a href="/settings/profile" className="btn-secondary">
          Edit profile
        </a>
      )}
    </section>
  );
}
