"use client";

import { use } from "react";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { CreatePostForm } from "@/features/posts/components/create-post-form";
import { usePlant } from "@/features/plants/hooks/use-plants";

interface PageProps {
  params: Promise<{ plantId: string }>;
}

export default function PlantGrowthUpdatePage({ params }: PageProps) {
  const { plantId } = use(params);

  return (
    <main className="container max-w-2xl py-8">
      <AuthGate>
        <PlantUpdateContent plantId={plantId} />
      </AuthGate>
    </main>
  );
}

function PlantUpdateContent({ plantId }: { plantId: string }) {
  const { data: plant, isLoading } = usePlant(plantId);

  if (isLoading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!plant) return <p className="text-sm text-zinc-500">Plant not found.</p>;

  return (
    <div className="card p-6">
      <h1 className="mb-1 text-xl font-semibold text-zinc-900">
        Post a growth update
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Sharing an update for <strong>{plant.name}</strong>.
      </p>
      <CreatePostForm plantId={plant.id} redirectTo={`/plants/${plant.id}`} />
    </div>
  );
}
