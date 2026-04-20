"use client";

import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { PlantForm } from "@/features/plants/components/plant-form";
import { usePlant, useUpdatePlant } from "@/features/plants/hooks/use-plants";

interface PageProps {
  params: { plantId: string };
}

export default function EditPlantPage({ params }: PageProps) {
  const { plantId } = params;

  return (
    <main className="container max-w-2xl pb-24 md:pb-0">
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

  if (isLoading) return <div className="skeleton mt-8 h-8 w-40 rounded-full" />;
  if (!plant) return <p className="mt-8 font-sans text-[13px] text-ink-muted">Plant not found.</p>;

  return (
    <div>
      <div className="py-5">
        <p className="eyebrow">Garden</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Edit Plant
        </h1>
      </div>
      <div className="rounded-2xl border border-surface-border bg-surface p-6">
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
    </div>
  );
}
