"use client";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { CreatePostForm } from "@/features/posts/components/create-post-form";
import { usePlant } from "@/features/plants/hooks/use-plants";

interface PageProps {
  params: { plantId: string };
}

export default function PlantGrowthUpdatePage({ params }: PageProps) {
  const { plantId } = params;

  return (
    <main className="mx-auto w-full max-w-[640px] pb-24 md:pb-0">
      <AuthGate>
        <PlantUpdateContent plantId={plantId} />
      </AuthGate>
    </main>
  );
}

function PlantUpdateContent({ plantId }: { plantId: string }) {
  const { data: plant, isLoading } = usePlant(plantId);

  if (isLoading) return <div className="skeleton mt-8 h-8 w-40 rounded-full" />;
  if (!plant) return <p className="mt-8 font-sans text-[13px] text-ink-muted">Plant not found.</p>;

  return (
    <div>
      <div className="px-4 pt-5 pb-3">
        <p className="eyebrow">Garden · {plant.name}</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Growth Update
        </h1>
      </div>
      <div className="border-t border-surface-border px-4 pt-5">
        <CreatePostForm plantId={plant.id} redirectTo={`/plants/${plant.id}`} />
      </div>
    </div>
  );
}
