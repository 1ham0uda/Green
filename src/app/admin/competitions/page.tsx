"use client";

import Link from "next/link";
import {
  useAdminDeleteCompetition,
  useAdminUpdateCompetitionStatus,
} from "@/features/admin/hooks/use-admin";
import { useCompetitions } from "@/features/competitions/hooks/use-competitions";
import type { Competition } from "@/features/competitions/types";

const STATUS_OPTS: Competition["status"][] = ["upcoming", "active", "closed"];

export default function AdminCompetitionsPage() {
  const { data: competitions, isLoading } = useCompetitions();
  const updateStatus = useAdminUpdateCompetitionStatus();
  const deleteComp = useAdminDeleteCompetition();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow mb-1">Admin</p>
          <h2 className="font-serif text-[24px] font-normal tracking-[-0.02em] text-ink">Competitions</h2>
        </div>
        <Link href="/admin/competitions/new" className="btn-primary btn-sm">
          New competition
        </Link>
      </div>

      {isLoading && <p className="font-sans text-[13px] text-ink-muted">Loading…</p>}

      {competitions?.length === 0 && (
        <p className="font-sans text-[13px] text-ink-muted">No competitions yet.</p>
      )}

      <div className="space-y-3">
        {competitions?.map((comp) => (
          <div key={comp.id} className="rounded-2xl border border-surface-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-sans text-[14px] font-medium text-ink">{comp.title}</p>
                <p className="eyebrow mt-0.5">{comp.entryCount} entries</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={comp.status}
                  onChange={(e) =>
                    void updateStatus.mutateAsync({
                      competitionId: comp.id,
                      status: e.target.value as Competition["status"],
                    })
                  }
                  className="input w-auto text-sm"
                >
                  {STATUS_OPTS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>

                <Link href={`/competitions/${comp.id}`} className="btn-secondary btn-sm">
                  View
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${comp.title}"?`)) {
                      void deleteComp.mutateAsync(comp.id);
                    }
                  }}
                  className="btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
