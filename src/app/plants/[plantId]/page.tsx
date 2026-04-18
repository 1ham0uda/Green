"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { PlantUpdates } from "@/features/plants/components/plant-updates";
import { useDeletePlant, usePlant } from "@/features/plants/hooks/use-plants";
import { PLANT_TYPES } from "@/features/plants/types";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ plantId: string }>;
}

export default function PlantDetailPage({ params }: PageProps) {
  const { plantId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const { data: plant, isLoading, error } = usePlant(plantId);
  const deletePlant = useDeletePlant();

  const typeLabel = plant
    ? (PLANT_TYPES.find((t) => t.value === plant.type)?.label ?? plant.type)
    : "";

  const isOwner = Boolean(plant && user && plant.ownerId === user.uid);

  async function handleDelete() {
    if (!plant) return;
    if (!confirm(`Delete "${plant.name}"? This cannot be undone.`)) return;
    await deletePlant.mutateAsync(plant.id);
    router.push("/plants");
  }

  return (
    <main className="container max-w-3xl py-8">
      {isLoading && <p className="text-sm text-zinc-500">Loading plant…</p>}
      {error && <p className="text-sm text-red-600">Failed to load plant.</p>}
      {!isLoading && !plant && (
        <div className="card p-6 text-center text-zinc-600">
          This plant doesn&apos;t exist.
        </div>
      )}

      {plant && (
        <div className="space-y-6">
          <section className="card overflow-hidden">
            {plant.imageURL && (
              <div className="relative aspect-video w-full bg-brand-50">
                <Image
                  src={plant.imageURL}
                  alt={plant.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="space-y-2 p-6">
              <p className="text-xs uppercase tracking-wider text-brand-700">
                {typeLabel}
              </p>
              <h1 className="text-2xl font-semibold text-zinc-900">
                {plant.name}
              </h1>
              {plant.description && (
                <p className="text-sm text-zinc-700">{plant.description}</p>
              )}

              {isOwner && (
                <div className="flex flex-wrap gap-2 pt-3">
                  <Link
                    href={`/plants/${plant.id}/edit`}
                    className="btn-secondary"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/plants/${plant.id}/update`}
                    className="btn-primary"
                  >
                    Post growth update
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={deletePlant.isPending}
                    className="btn-secondary text-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">
              Growth updates
            </h2>
            <PlantUpdates plantId={plant.id} />
          </section>
        </div>
      )}
    </main>
  );
}
