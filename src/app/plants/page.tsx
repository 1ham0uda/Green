"use client";

import Link from "next/link";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { PlantGrid } from "@/features/plants/components/plant-grid";
import { useMyPlants } from "@/features/plants/hooks/use-plants";

export default function MyPlantsPage() {
  return (
    <main className="container py-8">
      <AuthGate>
        <MyPlantsContent />
      </AuthGate>
    </main>
  );
}

function MyPlantsContent() {
  const { data, isLoading, error } = useMyPlants();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">My plants</h1>
          <p className="text-sm text-zinc-500">
            Track what you&apos;re growing and post growth updates.
          </p>
        </div>
        <Link href="/plants/new" className="btn-primary">
          Add plant
        </Link>
      </div>

      {isLoading && (
        <p className="text-sm text-zinc-500">Loading your plants…</p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          Failed to load plants.
        </p>
      )}

      {data && (
        <PlantGrid
          plants={data}
          emptyMessage="You haven't added any plants yet."
        />
      )}
    </div>
  );
}
