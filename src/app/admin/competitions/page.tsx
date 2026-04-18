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
        <h2 className="text-lg font-semibold text-zinc-900">Competitions</h2>
        <Link href="/admin/competitions/new" className="btn-primary">
          New competition
        </Link>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      {competitions?.length === 0 && (
        <div className="card p-8 text-center text-sm text-zinc-500">
          No competitions yet.
        </div>
      )}

      <div className="space-y-3">
        {competitions?.map((comp) => (
          <div key={comp.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-zinc-900">{comp.title}</p>
                <p className="text-sm text-zinc-500">
                  {comp.entryCount} entries
                </p>
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

                <Link
                  href={`/competitions/${comp.id}`}
                  className="btn-secondary text-sm"
                >
                  View
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${comp.title}"?`)) {
                      void deleteComp.mutateAsync(comp.id);
                    }
                  }}
                  className="btn-secondary text-sm text-red-700"
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
