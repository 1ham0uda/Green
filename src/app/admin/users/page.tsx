"use client";

import { useState } from "react";
import {
  useAllUsers,
  useBanUser,
  useSearchUsers,
  useUnbanUser,
  useUpdateUserRole,
} from "@/features/admin/hooks/use-admin";
import { VerificationBadge } from "@/features/verification/components/verification-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminUser } from "@/features/admin/types";
import type { UserProfile } from "@/features/auth/types";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: allUsers, isLoading: allLoading } = useAllUsers();
  const { data: searchResults, isLoading: searchLoading } =
    useSearchUsers(searchTerm);
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const updateRole = useUpdateUserRole();
  const [banReason, setBanReason] = useState<Record<string, string>>({});
  const [banDialogId, setBanDialogId] = useState<string | null>(null);

  const isSearching = searchTerm.length >= 2;
  const users = isSearching ? searchResults : allUsers;
  const isLoading = isSearching ? searchLoading : allLoading;

  function handleBan(user: AdminUser) {
    const reason = banReason[user.uid] ?? "Violation of community guidelines";
    void banUser.mutateAsync({ targetId: user.uid, reason }).then(() =>
      setBanDialogId(null)
    );
  }

  function handleRoleChange(uid: string, role: UserProfile["role"]) {
    void updateRole.mutateAsync({ targetId: uid, role });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow mb-1">Admin</p>
        <h2 className="font-serif text-[24px] font-normal tracking-[-0.02em] text-ink">Users</h2>
        <p className="mt-0.5 font-sans text-[13px] text-ink-muted">
          {isSearching
            ? `${searchResults?.length ?? 0} results for "${searchTerm}"`
            : `${allUsers?.length ?? 0} total users`}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Icon.Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
        />
        <input
          type="search"
          placeholder="Search by username…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                {["User", "Role", "Posts", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-4">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))}
              {users?.map((u) => (
                <tr
                  key={u.uid}
                  className="transition-colors hover:bg-surface-hover"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.photoURL} name={u.displayName} size="sm" />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-medium text-ink">
                          {u.displayName}
                          {u.isVerified && <VerificationBadge />}
                        </p>
                        <p className="truncate text-xs text-ink-muted">
                          @{u.handle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleRoleChange(
                          u.uid,
                          e.target.value as UserProfile["role"]
                        )
                      }
                      className="rounded-lg border border-surface-border bg-surface px-2 py-1 text-xs font-medium text-ink focus:border-brand-500 focus:outline-none"
                    >
                      <option value="user">User</option>
                      <option value="business">Business</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-ink-muted tabular-nums">
                    {u.postCount}
                  </td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <Badge variant="red" dot>
                        Banned
                      </Badge>
                    ) : (
                      <Badge variant="success" dot>
                        Active
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => void unbanUser.mutateAsync(u.uid)}
                        isLoading={unbanUser.isPending}
                      >
                        Unban
                      </Button>
                    ) : banDialogId === u.uid ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Reason…"
                          value={banReason[u.uid] ?? ""}
                          onChange={(e) =>
                            setBanReason((prev) => ({
                              ...prev,
                              [u.uid]: e.target.value,
                            }))
                          }
                          className="input h-8 w-40 py-1 text-xs"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleBan(u)}
                          isLoading={banUser.isPending}
                        >
                          Ban
                        </Button>
                        <button
                          type="button"
                          onClick={() => setBanDialogId(null)}
                          className="text-xs text-ink-muted hover:text-ink"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBanDialogId(u.uid)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Ban
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && !users?.length && (
          <EmptyState
            icon={<Icon.Users size={22} />}
            title={isSearching ? "No matching users" : "No users yet"}
            description={
              isSearching
                ? `No results for "${searchTerm}".`
                : "Users will appear here as they sign up."
            }
            className="border-0 shadow-none"
          />
        )}
      </div>
    </div>
  );
}
