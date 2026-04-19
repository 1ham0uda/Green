"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  usePostSearch,
  useProductSearch,
  useUserSearch,
} from "@/features/search/hooks/use-search";
import { VerificationBadge } from "@/features/verification/components/verification-badge";
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
    <main className="container max-w-2xl py-8">
      <h1 className="mb-4 text-2xl font-semibold text-zinc-900">Search</h1>

      <div className="relative mb-4">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
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
          className="input pl-10"
        />
      </div>

      {isSearching && (
        <>
          <div className="mb-4 flex gap-0 border-b border-surface-border">
            {(["users", "posts", "products"] as const).map((t) => {
              const count =
                t === "users"
                  ? users?.length
                  : t === "posts"
                  ? posts?.length
                  : products?.length;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium capitalize ${
                    tab === t
                      ? "border-b-2 border-brand-600 text-brand-600"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  {t} {count != null ? `(${count})` : ""}
                </button>
              );
            })}
          </div>

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
        </>
      )}

      {!isSearching && (
        <div className="card p-8 text-center text-sm text-zinc-500">
          Type at least 2 characters to search.
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
  if (isLoading) return <p className="text-sm text-zinc-500">Searching…</p>;
  if (!users.length)
    return (
      <p className="text-sm text-zinc-500">No users found.</p>
    );

  return (
    <div className="card divide-y divide-surface-border overflow-hidden">
      {users.map((u) => (
        <Link
          key={u.uid}
          href={`/u/${u.handle}`}
          className="flex items-center gap-3 p-4 hover:bg-surface-muted transition"
        >
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-brand-100">
            {u.photoURL ? (
              <Image
                src={u.photoURL}
                alt={u.displayName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-brand-700">
                {u.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 font-medium text-zinc-900">
              {u.displayName}
              {u.isVerified && <VerificationBadge />}
            </p>
            <p className="text-sm text-zinc-500">@{u.handle}</p>
          </div>
          {u.role === "business" && (
            <span className="flex-shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
              Business
            </span>
          )}
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
  if (isLoading) return <p className="text-sm text-zinc-500">Searching…</p>;
  if (!posts.length) return <p className="text-sm text-zinc-500">No posts found.</p>;

  return (
    <div className="card divide-y divide-surface-border overflow-hidden">
      {posts.map((p) => (
        <Link
          key={p.id}
          href={`/posts/${p.id}`}
          className="flex items-center gap-3 p-4 hover:bg-surface-muted transition"
        >
          {p.imageURL && (
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-zinc-100">
              <Image
                src={p.imageURL}
                alt={p.caption || "Post"}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-sm font-medium text-zinc-900">
              {p.authorDisplayName}
              {p.authorIsVerified && <VerificationBadge />}
            </p>
            {p.caption && (
              <p className="truncate text-sm text-zinc-600">{p.caption}</p>
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
  if (isLoading) return <p className="text-sm text-zinc-500">Searching…</p>;
  if (!products.length)
    return <p className="text-sm text-zinc-500">No products found.</p>;

  return (
    <div className="card divide-y divide-surface-border overflow-hidden">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/marketplace/${p.id}`}
          className="flex items-center gap-3 p-4 hover:bg-surface-muted transition"
        >
          {p.imageURL && (
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-zinc-100">
              <Image
                src={p.imageURL}
                alt={p.name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-zinc-900">{p.name}</p>
            <p className="text-sm text-zinc-500">
              {p.currency} {p.price.toFixed(2)} · by {p.vendorDisplayName}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
