"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPostsByPlant } from "@/features/posts/services/post-service";
import { PostCard } from "@/features/posts/components/post-card";

export function PlantUpdates({ plantId }: { plantId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", "plant", plantId],
    queryFn: () => fetchPostsByPlant(plantId),
  });

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading updates…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">Failed to load updates.</p>;
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No growth updates yet for this plant.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
