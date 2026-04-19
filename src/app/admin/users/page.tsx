"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  useAllUsers,
  useBanUser,
  useSearchUsers,
  useUnbanUser,
  useUpdateUserRole,
} from "@/features/admin/hooks/use-admin";
import { VerificationBadge } from "@/features/verification/components/verification-badge";
import type { AdminUser } from "@/features/admin/types";
import type { UserProfile } from "@/features/auth/types";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: allUsers, isLoading: allLoading } = useAllUsers();
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(searchTerm);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">
          Users ({isSearching ? (searchResults?.length ?? 0) : (allUsers?.length ?? 0)})
        </h2>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        >
          <circle cx={11} cy={11} r={8} />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search by username…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-9"
        />
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left">
            <tr>
              {["User", "Username", "Role", "Posts", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-zinc-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {users?.map((u) => (
              <tr key={u.uid} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-zinc-900 flex items-center gap-1">
                        {u.displayName}
                        {u.isVerified && <VerificationBadge />}
                      </p>
                      <p className="text-xs text-zinc-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-600">@{u.handle}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) =>
                      handleRoleChange(u.uid, e.target.value as UserProfile["role"])
                    }
                    className="input w-auto text-xs"
                  >
                    <option value="user">User</option>
                    <option value="business">Business</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-zinc-600">{u.postCount}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      u.isBanned
                        ? "bg-red-100 text-red-700"
                        : "bg-brand-100 text-brand-700"
                    )}
                  >
                    {u.isBanned ? "Banned" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.isBanned ? (
                    <button
                      type="button"
                      onClick={() => void unbanUser.mutateAsync(u.uid)}
                      disabled={unbanUser.isPending}
                      className="btn-secondary text-xs"
                    >
                      Unban
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {banDialogId === u.uid ? (
                        <>
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
                            className="input w-40 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleBan(u)}
                            disabled={banUser.isPending}
                            className="btn-secondary text-xs text-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setBanDialogId(null)}
                            className="text-xs text-zinc-500"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setBanDialogId(u.uid)}
                          className="btn-secondary text-xs text-red-700"
                        >
                          Ban
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && !users?.length && (
          <p className="p-8 text-center text-sm text-zinc-500">
            {isSearching ? `No users matching "${searchTerm}".` : "No users yet."}
          </p>
        )}
      </div>
    </div>
  );
}
