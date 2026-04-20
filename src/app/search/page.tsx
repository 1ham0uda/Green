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
import { SkeletonRow } from "@/components/ui/skeleton";
import type { PublicProfile } from "@/features/profiles/types";
import type { Post } from "@/features/posts/types";
import type { Product } from "@/features/marketplace/types";
import { formatPrice } from "@/lib/utils/format";

type Tab = "users" | "posts" | "products";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("users");

  const { data: users, isLoading: usersLoading } = useUserSearch(query);
  const { data: posts, isLoading: postsLoading } = usePostSearch(query);
  const { data: products, isLoading: productsLoading } = useProductSearch(query);

  const isSearching = query.length >= 2;

  const TABS: { id: Tab; label: string; count: number | null }[] = [
    { id: "users",    label: "Users",    count: users?.length    ?? null },
    { id: "posts",    label: "Posts",    count: posts?.length    ?? null },
    { id: "products", label: "Products", count: products?.length ?? null },
  ];

  return (
    <main className="mx-auto w-full max-w-[640px] pb-24 md:pb-0">
      <div className="px-4 pb-3 pt-5">
        <p className="eyebrow">Discover</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Search
        </h1>
      </div>

      <div className="relative px-4 pb-4">
        <Icon.Search
          size={18}
          className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 text-ink-subtle"
        />
        <input
          type="search"
          placeholder="Users, posts, products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="input h-11 pl-10"
        />
      </div>

      {isSearching && (
        <>
          <div className="flex gap-0 border-b border-surface-border px-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={[
                  "relative mr-5 pb-3 pt-2 font-sans text-[13px] font-medium transition-colors",
                  tab === t.id ? "text-ink" : "text-ink-subtle hover:text-ink-muted",
                ].join(" ")}
              >
                {t.label}
                {t.count !== null && (
                  <span className="ml-1 tabular-nums text-[11px] text-ink-subtle">
                    {t.count}
                  </span>
                )}
                {tab === t.id && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-ink" />
                )}
              </button>
            ))}
          </div>

          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {tab === "users"    && <UserResults    users={users ?? []}       isLoading={usersLoading}    />}
            {tab === "posts"    && <PostResults    posts={posts ?? []}        isLoading={postsLoading}    />}
            {tab === "products" && <ProductResults products={products ?? []}  isLoading={productsLoading} />}
          </motion.div>
        </>
      )}

      {!isSearching && (
        <div className="px-4 pt-8">
          <EmptyState
            icon={<Icon.Search size={22} />}
            title="Type at least 2 characters"
            description="Start typing to search across the community."
          />
        </div>
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
          {p.imageURLs[0] && (
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-surface-subtle">
              <Image
                src={p.imageURLs[0]}
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
              {formatPrice(p.price, p.currency)} · by {p.vendorDisplayName}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
