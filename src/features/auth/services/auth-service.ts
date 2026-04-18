import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  firebaseAuth,
  firestore,
  googleAuthProvider,
} from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type {
  SignInInput,
  SignUpInput,
  UserProfile,
  UserRole,
} from "../types";

function handleFromEmail(email: string): string {
  const base = email.split("@")[0] ?? "gardener";
  return base.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) || "gardener";
}

async function createUserDocument(
  user: User,
  overrides: Partial<UserProfile> = {}
): Promise<UserProfile> {
  const ref = doc(firestore, COLLECTIONS.users, user.uid);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    return existing.data() as UserProfile;
  }

  const profile: Omit<UserProfile, "createdAt" | "updatedAt"> = {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? overrides.displayName ?? "New Gardener",
    handle: overrides.handle ?? handleFromEmail(user.email ?? user.uid),
    photoURL: user.photoURL ?? null,
    bio: "",
    role: (overrides.role ?? "user") as UserRole,
    followerCount: 0,
    followingCount: 0,
    postCount: 0,
  };

  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const saved = await getDoc(ref);
  return saved.data() as UserProfile;
}

export async function signUpWithEmail(input: SignUpInput): Promise<UserProfile> {
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    input.email,
    input.password
  );

  await updateProfile(credential.user, { displayName: input.displayName });
  return createUserDocument(credential.user, { displayName: input.displayName });
}

export async function signInWithEmail(input: SignInInput): Promise<UserProfile> {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    input.email,
    input.password
  );
  return fetchOrCreateProfile(credential.user);
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const credential = await signInWithPopup(firebaseAuth, googleAuthProvider);
  return fetchOrCreateProfile(credential.user);
}

export async function signOutUser(): Promise<void> {
  await signOut(firebaseAuth);
}

export async function fetchOrCreateProfile(user: User): Promise<UserProfile> {
  const ref = doc(firestore, COLLECTIONS.users, user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return createUserDocument(user);
  }

  return snap.data() as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  patch: Partial<Pick<UserProfile, "displayName" | "bio" | "photoURL" | "handle">>
): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.users, uid);
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}
