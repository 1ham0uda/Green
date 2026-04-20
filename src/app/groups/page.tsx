"use client";

import Image from "next/image";
import Link from "next/link";
import { usePublicGroups, useUserGroups } from "@/features/groups/hooks/use-groups";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import type { Group } from "@/features/groups/types";

export default function GroupsPage() {
  const { user } = useAuth();
  const { data: allGroups = [], isLoading } = usePublicGroups();
  const { data: myGroups = [] } = useUserGroups();

  const myGroupIds = new Set(myGroups.map((g) => g.id));

  return (
    <main className="container max-w-5xl pb-24 md:pb-0">
      <div className="flex items-center justify-between py-5">
        <div>
          <p className="eyebrow">Community</p>
          <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
            Groups
          </h1>
        </div>
        {user && (
          <Link href="/groups/new" className="btn-primary btn-sm flex items-center gap-1.5">
            <Icon.Plus size={14} />
            New group
          </Link>
        )}
      </div>

      {user && myGroups.length > 0 && (
        <section className="mb-8">
          <p className="eyebrow mb-3">Your Groups</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myGroups.map((g, i) => (
              <GroupCard key={g.id} group={g} index={i} isMember />
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="eyebrow mb-3">Discover</p>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : allGroups.length === 0 ? (
          <EmptyState
            icon={<Icon.Users size={22} />}
            title="No groups yet"
            description="Be the first to create a gardening group."
            action={
              user ? (
                <Link href="/groups/new" className="btn-primary btn-sm">
                  Create group
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allGroups.map((g, i) => (
              <GroupCard
                key={g.id}
                group={g}
                index={i}
                isMember={myGroupIds.has(g.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function GroupCard({
  group,
  isMember,
}: {
  group: Group;
  index?: number;
  isMember: boolean;
}) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="group block overflow-hidden rounded-2xl border border-surface-border bg-surface transition-all duration-200 hover:border-brand-200 hover:shadow-elevated"
    >
      <div className="relative h-24 bg-surface-subtle">
        {group.coverImageURL && (
          <Image
            src={group.coverImageURL}
            alt={group.name}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-cover"
          />
        )}
        {isMember && (
          <span className="badge badge-brand absolute right-2 top-2">
            Joined
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-sans text-[14px] font-medium text-ink transition-colors group-hover:text-brand-700">
          {group.name}
        </p>
        {group.description && (
          <p className="mt-1 line-clamp-2 font-sans text-[12px] text-ink-muted">
            {group.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 font-sans text-[11px] text-ink-subtle">
          <span className="flex items-center gap-1">
            <Icon.Users size={12} />
            {group.memberCount}
          </span>
          <span className="flex items-center gap-1">
            <Icon.Leaf size={12} />
            {group.postCount}
          </span>
          {!group.isPublic && (
            <span className="flex items-center gap-1">
              <Icon.Shield size={11} />
              Private
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
