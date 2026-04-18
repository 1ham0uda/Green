"use client";

import { use } from "react";
import { ProfileHeader } from "@/features/profiles/components/profile-header";
import { ProfilePosts } from "@/features/profiles/components/profile-posts";
import { useProfileByHandle } from "@/features/profiles/hooks/use-profile";

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = use(params);
  const { data: profile, isLoading, error } = useProfileByHandle(handle);

  return (
    <main className="container py-8">
      {isLoading && <p className="text-sm text-zinc-500">Loading profile…</p>}

      {error && (
        <p className="text-sm text-red-600">Failed to load profile.</p>
      )}

      {!isLoading && !profile && (
        <div className="card p-6 text-center text-zinc-600">
          <p>No user found with handle @{handle}.</p>
        </div>
      )}

      {profile && (
        <div className="space-y-6">
          <ProfileHeader profile={profile} />
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Posts</h2>
            <ProfilePosts uid={profile.uid} />
          </section>
        </div>
      )}
    </main>
  );
}
