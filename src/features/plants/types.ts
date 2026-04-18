import type { Timestamp } from "firebase/firestore";

export type PlantType =
  | "herb"
  | "vegetable"
  | "fruit"
  | "flower"
  | "succulent"
  | "houseplant"
  | "other";

export const PLANT_TYPES: { value: PlantType; label: string }[] = [
  { value: "herb", label: "Herb" },
  { value: "vegetable", label: "Vegetable" },
  { value: "fruit", label: "Fruit" },
  { value: "flower", label: "Flower" },
  { value: "succulent", label: "Succulent" },
  { value: "houseplant", label: "Houseplant" },
  { value: "other", label: "Other" },
];

export interface Plant {
  id: string;
  ownerId: string;
  name: string;
  type: PlantType;
  description: string;
  imageURL: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface CreatePlantInput {
  name: string;
  type: PlantType;
  description: string;
  imageFile?: File | null;
}

export interface UpdatePlantInput {
  name?: string;
  type?: PlantType;
  description?: string;
  imageFile?: File | null;
}
