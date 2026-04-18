"use client";

import { useState } from "react";
import { useOpenReports, useResolveReport } from "@/features/admin/hooks/use-admin";
import { useModerationLogs } from "@/features/admin/hooks/use-admin";

export default function AdminModerationPage() {
  const { data: reports, isLoading: reportsLoading } = useOpenReports();
  const { data: logs, isLoading: logsLoading } = useModerationLogs();
  const resolveReport = useResolveReport();
  const [tab, setTab] = useState<"reports" | "log">("reports");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900">Content Moderation</h2>

      <div className="flex gap-2 border-b border-surface-border">
        {(["reports", "log"] as const).map((t) => (
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
            {t === "reports" ? `Open Reports (${reports?.length ?? 0})` : "Moderation Log"}
          </button>
        ))}
      </div>

      {tab === "reports" && (
        <div className="card divide-y divide-surface-border overflow-hidden text-sm">
          {reportsLoading && <p className="p-6 text-zinc-500">Loading…</p>}

          {!reportsLoading && reports?.length === 0 && (
            <p className="p-8 text-center text-zinc-500">No open reports.</p>
          )}

          {reports?.map((report) => {
            const ts = report.createdAt;
            return (
              <div key={report.id} className="flex items-start gap-4 p-4">
                <span className="mt-0.5 w-20 flex-shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-center text-xs font-mono text-zinc-700">
                  {report.targetType}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-800 truncate">
                    Target: {report.targetId}
                  </p>
                  <p className="text-zinc-500 truncate">
                    Reporter: {report.reporterId}
                  </p>
                  <p className="mt-1 text-zinc-600">{report.reason}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-zinc-400">
                  {ts
                    ? ts.toDate().toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
                <div className="flex flex-shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={resolveReport.isPending}
                    onClick={() =>
                      void resolveReport.mutate({
                        reportId: report.id,
                        action: "resolved",
                      })
                    }
                    className="btn-primary py-1 px-3 text-xs"
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    disabled={resolveReport.isPending}
                    onClick={() =>
                      void resolveReport.mutate({
                        reportId: report.id,
                        action: "dismissed",
                      })
                    }
                    className="btn-secondary py-1 px-3 text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "log" && (
        <div className="card divide-y divide-surface-border overflow-hidden text-sm">
          {logsLoading && <p className="p-6 text-zinc-500">Loading…</p>}

          {!logsLoading && logs?.length === 0 && (
            <p className="p-8 text-center text-zinc-500">No moderation actions yet.</p>
          )}

          {logs?.map((entry) => {
            const ts = entry.createdAt;
            return (
              <div key={entry.id} className="flex items-start gap-4 p-4">
                <span className="mt-0.5 w-36 flex-shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-center text-xs font-mono text-zinc-700">
                  {entry.action}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-zinc-800">
                    <span className="font-medium">{entry.adminHandle}</span>
                    {entry.targetId && (
                      <span className="text-zinc-500"> → {entry.targetId}</span>
                    )}
                  </p>
                  {entry.note && (
                    <p className="text-zinc-500">{entry.note}</p>
                  )}
                </div>
                <span className="flex-shrink-0 text-xs text-zinc-500">
                  {ts
                    ? ts.toDate().toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
