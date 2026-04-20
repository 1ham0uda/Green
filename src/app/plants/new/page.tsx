"use client";

import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { PlantForm } from "@/features/plants/components/plant-form";
import { useCreatePlant } from "@/features/plants/hooks/use-plants";

export default function NewPlantPage() {
  return (
    <main className="container max-w-2xl pb-24 md:pb-0">
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
    <div>
      <div className="py-5">
        <p className="eyebrow">Garden</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Add a Plant
        </h1>
      </div>
      <div className="rounded-2xl border border-surface-border bg-surface p-6">
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
    </div>
  );
}
