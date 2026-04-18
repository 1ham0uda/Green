"use client";

import type { Plant } from "../types";
import { PlantCard } from "./plant-card";

interface PlantGridProps {
  plants: Plant[];
  emptyMessage?: string;
}

export function PlantGrid({
  plants,
  emptyMessage = "No plants yet.",
}: PlantGridProps) {
  if (plants.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-zinc-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plants.map((plant) => (
        <PlantCard key={plant.id} plant={plant} />
      ))}
    </div>
  );
}
