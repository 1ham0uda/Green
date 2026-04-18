"use client";

import { useAdminLogs } from "@/features/admin/hooks/use-admin";

export default function AdminLogsPage() {
  const { data: logs, isLoading } = useAdminLogs();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900">
        System logs ({logs?.length ?? 0})
      </h2>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      <div className="card divide-y divide-surface-border overflow-hidden text-sm">
        {logs?.length === 0 && (
          <p className="p-6 text-center text-zinc-500">No logs yet.</p>
        )}
        {logs?.map((entry) => (
          <div key={entry.id} className="flex items-start gap-4 p-4">
            <span className="mt-0.5 w-36 flex-shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-center text-xs font-mono text-zinc-700">
              {entry.action}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-zinc-800">
                <span className="font-medium">{entry.userId ?? "system"}</span>
                {entry.targetId && (
                  <span className="text-zinc-500"> → {entry.targetId}</span>
                )}
              </p>
            </div>
            <span className="flex-shrink-0 text-xs text-zinc-500">
              {entry.createdAt
                ? entry.createdAt.toDate().toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
