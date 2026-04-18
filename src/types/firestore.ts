import { FieldValue } from "firebase/firestore";

export type FirestorePatch<T = unknown> = Partial<{
  [K in keyof T]: T[K] | FieldValue;
}>;