"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { PlantForm } from "@/features/plants/components/plant-form";
import { usePlant, useUpdatePlant } from "@/features/plants/hooks/use-plants";

interface PageProps {
  params: Promise<{ plantId: string }>;
}

export default function EditPlantPage({ params }: PageProps) {
  const { plantId } = use(params);

  return (
    <main className="container max-w-2xl py-8">
      <AuthGate>
        <EditPlantContent plantId={plantId} />
      </AuthGate>
    </main>
  );
}

function EditPlantContent({ plantId }: { plantId: string }) {
  const router = useRouter();
  const { data: plant, isLoading } = usePlant(plantId);
  const updatePlant = useUpdatePlant(plantId);

  if (isLoading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!plant) return <p className="text-sm text-zinc-500">Plant not found.</p>;

  return (
    <div className="card p-6">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">Edit plant</h1>
      <PlantForm
        initial={plant}
        submitLabel="Save changes"
        pending={updatePlant.isPending}
        onSubmit={async (input) => {
          await updatePlant.mutateAsync(input);
          router.push(`/plants/${plant.id}`);
          router.refresh();
        }}
      />
    </div>
  );
}
