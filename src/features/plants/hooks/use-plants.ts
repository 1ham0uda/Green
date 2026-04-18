"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  createPlant,
  deletePlant,
  fetchPlantById,
  fetchPlantsByOwner,
  updatePlant,
} from "../services/plant-service";
import type { CreatePlantInput, UpdatePlantInput } from "../types";

export function useMyPlants() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["plants", "owner", user?.uid],
    queryFn: () => fetchPlantsByOwner(user!.uid),
    enabled: Boolean(user?.uid),
  });
}

export function useOwnerPlants(ownerId: string | null | undefined) {
  return useQuery({
    queryKey: ["plants", "owner", ownerId],
    queryFn: () => fetchPlantsByOwner(ownerId as string),
    enabled: Boolean(ownerId),
  });
}

export function usePlant(plantId: string | null | undefined) {
  return useQuery({
    queryKey: ["plants", "detail", plantId],
    queryFn: () => fetchPlantById(plantId as string),
    enabled: Boolean(plantId),
  });
}

export function useCreatePlant() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlantInput) => {
      if (!user) throw new Error("Must be signed in");
      return createPlant(user.uid, input);
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({
          queryKey: ["plants", "owner", user.uid],
        });
      }
    },
  });
}

export function useUpdatePlant(plantId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePlantInput) => {
      if (!user) throw new Error("Must be signed in");
      return updatePlant(plantId, user.uid, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plants", "detail", plantId] });
      if (user) {
        queryClient.invalidateQueries({
          queryKey: ["plants", "owner", user.uid],
        });
      }
    },
  });
}

export function useDeletePlant() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plantId: string) => deletePlant(plantId),
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({
          queryKey: ["plants", "owner", user.uid],
        });
      }
    },
  });
}
