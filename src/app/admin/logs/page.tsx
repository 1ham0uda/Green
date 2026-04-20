"use client";

import { useAdminLogs } from "@/features/admin/hooks/use-admin";

export default function AdminLogsPage() {
  const { data: logs, isLoading } = useAdminLogs();

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow mb-1">Admin</p>
        <h2 className="font-serif text-[24px] font-normal tracking-[-0.02em] text-ink">System Logs ({logs?.length ?? 0})</h2>
      </div>

      {isLoading && <p className="font-sans text-[13px] text-ink-muted">Loading…</p>}

      <div className="rounded-2xl border border-surface-border bg-surface divide-y divide-surface-border overflow-hidden font-sans text-[13px]">
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
