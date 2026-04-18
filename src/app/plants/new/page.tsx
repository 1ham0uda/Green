"use client";

import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { PlantForm } from "@/features/plants/components/plant-form";
import { useCreatePlant } from "@/features/plants/hooks/use-plants";

export default function NewPlantPage() {
  return (
    <main className="container max-w-2xl py-8">
      <AuthGate>
        <NewPlantContent />
      </AuthGate>
    </main>
  );
}

function NewPlantContent() {
  const router = useRouter();
  const createPlant = useCreatePlant();

  return (
    <div className="card p-6">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">Add a plant</h1>
      <PlantForm
        submitLabel="Add plant"
        pending={createPlant.isPending}
        onSubmit={async (input) => {
          const plant = await createPlant.mutateAsync(input);
          router.push(`/plants/${plant.id}`);
          router.refresh();
        }}
      />
    </div>
  );
}
