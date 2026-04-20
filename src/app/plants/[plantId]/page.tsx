"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { PlantUpdates } from "@/features/plants/components/plant-updates";
import { useDeletePlant, usePlant } from "@/features/plants/hooks/use-plants";
import { PLANT_TYPES } from "@/features/plants/types";
import { useRouter } from "next/navigation";

interface PageProps {
  params: { plantId: string };
}

export default function PlantDetailPage({ params }: PageProps) {
  const { plantId } = params;
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
    <main className="container max-w-3xl pb-24 md:pb-0">
      {isLoading && <div className="skeleton mt-8 h-64 w-full rounded-2xl" />}
      {error && <p className="mt-8 font-sans text-[13px] text-red-600">Failed to load plant.</p>}
      {!isLoading && !plant && (
        <p className="mt-8 font-sans text-[13px] text-ink-muted">This plant doesn&apos;t exist.</p>
      )}

      {plant && (
        <div className="space-y-6 pt-6">
          <section className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
            {plant.imageURL && (
              <div className="relative aspect-video w-full bg-surface-subtle">
                <Image
                  src={plant.imageURL}
                  alt={plant.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <p className="eyebrow mb-2">{typeLabel}</p>
              <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
                {plant.name}
              </h1>
              {plant.description && (
                <p className="mt-2 font-sans text-[14px] leading-relaxed text-ink-soft">
                  {plant.description}
                </p>
              )}

              {isOwner && (
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/plants/${plant.id}/edit`} className="btn-secondary btn-sm">
                    Edit
                  </Link>
                  <Link href={`/plants/${plant.id}/update`} className="btn-primary btn-sm">
                    Post growth update
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={deletePlant.isPending}
                    className="btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <p className="eyebrow">Growth Updates</p>
            <PlantUpdates plantId={plant.id} />
          </section>
        </div>
      )}
    </main>
  );
}
