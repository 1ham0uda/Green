"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  useAllUsers,
  useBanUser,
  useUnbanUser,
  useUpdateUserRole,
} from "@/features/admin/hooks/use-admin";
import type { AdminUser } from "@/features/admin/types";
import type { UserProfile } from "@/features/auth/types";

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAllUsers();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const updateRole = useUpdateUserRole();
  const [banReason, setBanReason] = useState<Record<string, string>>({});
  const [banDialogId, setBanDialogId] = useState<string | null>(null);

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
          Users ({users?.length ?? 0})
        </h2>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left">
            <tr>
              {["User", "Handle", "Role", "Posts", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 font-medium text-zinc-600"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {users?.map((u) => (
              <tr key={u.uid} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {u.displayName}
                  <p className="text-xs text-zinc-500">{u.email}</p>
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
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-zinc-600">{u.postCount}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      u.banned
                        ? "bg-red-100 text-red-700"
                        : "bg-brand-100 text-brand-700"
                    )}
                  >
                    {u.banned ? "Banned" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.banned ? (
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
      </div>
    </div>
  );
}
