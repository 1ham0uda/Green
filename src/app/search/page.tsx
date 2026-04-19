"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  usePostSearch,
  useProductSearch,
  useUserSearch,
} from "@/features/search/hooks/use-search";
import { VerificationBadge } from "@/features/verification/components/verification-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Tabs } from "@/components/ui/tabs";
import { SkeletonRow } from "@/components/ui/skeleton";
import type { PublicProfile } from "@/features/profiles/types";
import type { Post } from "@/features/posts/types";
import type { Product } from "@/features/marketplace/types";

type Tab = "users" | "posts" | "products";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("users");

  const { data: users, isLoading: usersLoading } = useUserSearch(query);
  const { data: posts, isLoading: postsLoading } = usePostSearch(query);
  const { data: products, isLoading: productsLoading } = useProductSearch(query);

  const isSearching = query.length >= 2;

  return (
    <main className="container max-w-2xl py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-display-sm font-bold tracking-tight text-ink">
          Search
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Find gardeners, posts, and products.
        </p>
      </div>

      <div className="relative mb-6">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-subtle"
        >
          <circle cx={11} cy={11} r={8} />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search users, posts, products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="input h-12 pl-12 text-base"
        />
      </div>

      {isSearching && (
        <>
          <div className="mb-5 flex justify-center">
            <Tabs
              variant="pill"
              tabs={[
                {
                  id: "users",
                  label: "Users",
                  count: users?.length ?? null,
                  icon: <Icon.Users size={14} />,
                },
                {
                  id: "posts",
                  label: "Posts",
                  count: posts?.length ?? null,
                  icon: <Icon.Leaf size={14} />,
                },
                {
                  id: "products",
                  label: "Products",
                  count: products?.length ?? null,
                  icon: <Icon.ShoppingBag size={14} />,
                },
              ]}
              active={tab}
              onChange={(id) => setTab(id as Tab)}
            />
          </div>

          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "users" && (
              <UserResults users={users ?? []} isLoading={usersLoading} />
            )}
            {tab === "posts" && (
              <PostResults posts={posts ?? []} isLoading={postsLoading} />
            )}
            {tab === "products" && (
              <ProductResults
                products={products ?? []}
                isLoading={productsLoading}
              />
            )}
          </motion.div>
        </>
      )}

      {!isSearching && (
        <EmptyState
          icon={<Icon.Search size={22} />}
          title="Type at least 2 characters"
          description="Start typing to search across the community."
        />
      )}
    </main>
  );
}

function UserResults({
  users,
  isLoading,
}: {
  users: PublicProfile[];
  isLoading: boolean;
}) {
  if (isLoading)
    return (
      <div className="card divide-y divide-surface-border overflow-hidden">
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  if (!users.length)
    return (
      <EmptyState
        icon={<Icon.Users size={22} />}
        title="No users found"
      />
    );

  return (
    <div className="card divide-y divide-surface-border overflow-hidden">
      {users.map((u) => (
        <Link
          key={u.uid}
          href={`/u/${u.handle}`}
          className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-hover"
        >
          <Avatar src={u.photoURL} name={u.displayName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 font-medium text-ink">
              {u.displayName}
              {u.isVerified && <VerificationBadge />}
            </p>
            <p className="truncate text-sm text-ink-muted">@{u.handle}</p>
          </div>
          {u.role === "business" && <Badge variant="blue">Business</Badge>}
          {u.role === "admin" && <Badge variant="red">Admin</Badge>}
        </Link>
      ))}
    </div>
  );
}

function PostResults({
  posts,
  isLoading,
}: {
  posts: Post[];
  isLoading: boolean;
}) {
  if (isLoading)
    return (
      <div className="card divide-y divide-surface-border overflow-hidden">
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  if (!posts.length)
    return (
      <EmptyState icon={<Icon.Leaf size={22} />} title="No posts found" />
    );

  return (
    <div className="card divide-y divide-surface-border overflow-hidden">
      {posts.map((p) => (
        <Link
          key={p.id}
          href={`/posts/${p.id}`}
          className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-hover"
        >
          {p.imageURL && (
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-surface-subtle">
              <Image
                src={p.imageURL}
                alt={p.caption || "Post"}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
              {p.authorDisplayName}
              {p.authorIsVerified && <VerificationBadge />}
            </p>
            {p.caption && (
              <p className="truncate text-sm text-ink-muted">{p.caption}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProductResults({
  products,
  isLoading,
}: {
  products: Product[];
  isLoading: boolean;
}) {
  if (isLoading)
    return (
      <div className="card divide-y divide-surface-border overflow-hidden">
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  if (!products.length)
    return (
      <EmptyState
        icon={<Icon.ShoppingBag size={22} />}
        title="No products found"
      />
    );

  return (
    <div className="card divide-y divide-surface-border overflow-hidden">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/marketplace/${p.id}`}
          className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-hover"
        >
          {p.imageURL && (
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-surface-subtle">
              <Image
                src={p.imageURL}
                alt={p.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">{p.name}</p>
            <p className="text-sm text-ink-muted">
              {p.currency} {p.price.toFixed(2)} · by {p.vendorDisplayName}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
