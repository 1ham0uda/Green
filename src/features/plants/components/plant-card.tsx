"use client";

import Image from "next/image";
import Link from "next/link";
import type { Plant } from "../types";
import { PLANT_TYPES } from "../types";

function typeLabel(type: Plant["type"]): string {
  return PLANT_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function PlantCard({ plant }: { plant: Plant }) {
  return (
    <Link
      href={`/plants/${plant.id}`}
      className="card block overflow-hidden transition hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-brand-50">
        {plant.imageURL ? (
          <Image
            src={plant.imageURL}
            alt={plant.name}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            🌱
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-zinc-900">{plant.name}</h3>
        <p className="text-xs uppercase tracking-wider text-brand-700">
          {typeLabel(plant.type)}
        </p>
        {plant.description && (
          <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
            {plant.description}
          </p>
        )}
      </div>
    </Link>
  );
}
