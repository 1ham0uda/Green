import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  firebaseAuth,
  firestore,
  googleAuthProvider,
} from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { log } from "@/lib/logger";
import type {
  SignInInput,
  SignUpInput,
  UserProfile,
  UserRole,
} from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sanitizeHandle(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) || "gardener";
}

function handleFromEmail(email: string): string {
  return sanitizeHandle(email.split("@")[0] ?? "gardener");
}

export async function isHandleAvailable(handle: string): Promise<boolean> {
  const q = query(
    collection(firestore, COLLECTIONS.users),
    where("handle", "==", handle),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty;
}

async function assertHandleAvailable(handle: string, excludeUid?: string): Promise<void> {
  const q = query(
    collection(firestore, COLLECTIONS.users),
    where("handle", "==", handle),
    limit(1)
  );
  const snap = await getDocs(q);
  if (!snap.empty && snap.docs[0].id !== excludeUid) {
    throw new Error("That username is already taken. Please choose another.");
  }
}

// ─── Profile creation ────────────────────────────────────────────────────────

async function createUserDocument(
  user: User,
  overrides: Partial<UserProfile> = {}
): Promise<UserProfile> {
  const ref = doc(firestore, COLLECTIONS.users, user.uid);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    return existing.data() as UserProfile;
  }

  const handle =
    overrides.handle ?? handleFromEmail(user.email ?? user.uid);

  const profile: Omit<UserProfile, "createdAt" | "updatedAt"> = {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? overrides.displayName ?? "New Gardener",
    handle,
    photoURL: user.photoURL ?? null,
    bio: "",
    role: (overrides.role ?? "user") as UserRole,
    isVerified: false,
    verificationStatus: "none",
    isBanned: false,
    bannedReason: null,
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

// ─── Public auth functions ───────────────────────────────────────────────────

export async function signUpWithEmail(input: SignUpInput): Promise<UserProfile> {
  const handle = sanitizeHandle(input.username);

  if (handle.length < 3) {
    throw new Error("Username must be at least 3 characters.");
  }
  if (!/^[a-z0-9_]+$/.test(handle)) {
    throw new Error("Username can only contain lowercase letters, numbers, and underscores.");
  }

  await assertHandleAvailable(handle);

  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    input.email,
    input.password
  );

  await updateProfile(credential.user, { displayName: input.displayName });

  const profile = await createUserDocument(credential.user, {
    displayName: input.displayName,
    handle,
    role: input.role,
  });

  void log("auth.signup", profile.uid);
  return profile;
}

export async function signInWithEmail(input: SignInInput): Promise<UserProfile> {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    input.email,
    input.password
  );
  const profile = await fetchOrCreateProfile(credential.user);

  if (profile.isBanned) {
    await signOut(firebaseAuth);
    throw new Error(
      `Your account has been suspended${profile.bannedReason ? `: ${profile.bannedReason}` : "."}`
    );
  }

  void log("auth.login", profile.uid);
  return profile;
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const credential = await signInWithPopup(firebaseAuth, googleAuthProvider);
  const profile = await fetchOrCreateProfile(credential.user);

  if (profile.isBanned) {
    await signOut(firebaseAuth);
    throw new Error(
      `Your account has been suspended${profile.bannedReason ? `: ${profile.bannedReason}` : "."}`
    );
  }

  void log("auth.login", profile.uid);
  return profile;
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
