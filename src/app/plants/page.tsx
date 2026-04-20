"use client";

import Link from "next/link";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { PlantGrid } from "@/features/plants/components/plant-grid";
import { useMyPlants } from "@/features/plants/hooks/use-plants";

export default function MyPlantsPage() {
  return (
    <main className="container max-w-5xl pb-24 md:pb-0">
      <AuthGate>
        <MyPlantsContent />
      </AuthGate>
    </main>
  );
}

function MyPlantsContent() {
  const { data, isLoading, error } = useMyPlants();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between py-5">
        <div>
          <p className="eyebrow">Garden</p>
          <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
            My Plants
          </h1>
        </div>
        <Link href="/plants/new" className="btn-primary btn-sm flex items-center gap-1.5">
          Add plant
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <p className="font-sans text-[13px] text-red-600" role="alert">
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
