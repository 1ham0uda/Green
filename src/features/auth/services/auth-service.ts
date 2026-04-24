import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
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
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { log } from "@/lib/logger";
import type { SignInInput, SignUpInput, UserProfile, UserRole } from "../types";

// ─── Error mapping ────────────────────────────────────────────────────────────

function mapFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/email-already-in-use":    "This email is already registered. Try signing in.",
    "auth/invalid-email":           "Please enter a valid email address.",
    "auth/weak-password":           "Password is too weak. Choose a stronger one.",
    "auth/user-not-found":          "No account found with this email.",
    "auth/wrong-password":          "Incorrect password. Please try again.",
    "auth/invalid-credential":      "Incorrect email or password.",
    "auth/too-many-requests":       "Too many failed attempts. Please try again later.",
    "auth/network-request-failed":  "Network error. Check your internet connection.",
    "auth/user-disabled":           "This account has been disabled.",
  };
  if (map[code]) return map[code];
  if (err instanceof Error && err.message) return err.message;
  return "An unexpected error occurred. Please try again.";
}

// ─── Profile mapper ───────────────────────────────────────────────────────────

export function mapProfile(d: Record<string, unknown>): UserProfile {
  return {
    uid:                d.uid as string,
    email:              (d.email as string)              ?? "",
    displayName:        (d.displayName as string)        ?? "Gardener",
    handle:             (d.handle as string)             ?? (d.uid as string),
    photoURL:           (d.photoURL as string | null)    ?? null,
    coverPhotoURL:      (d.coverPhotoURL as string | null) ?? null,
    bio:                (d.bio as string)                ?? "",
    role:               ((d.role as string)              ?? "user") as UserRole,
    isVerified:         (d.isVerified as boolean)        ?? false,
    verificationStatus: (d.verificationStatus as UserProfile["verificationStatus"]) ?? "none",
    isBanned:           (d.isBanned as boolean)          ?? false,
    bannedReason:       (d.bannedReason as string | null) ?? null,
    followerCount:      (d.followerCount as number)      ?? 0,
    followingCount:     (d.followingCount as number)     ?? 0,
    postCount:          (d.postCount as number)          ?? 0,
    country:            (d.country as string)            ?? "EG",
    governorate:        (d.governorate as string)        ?? "",
    city:               (d.city as string)               ?? "",
    createdAt:          (d.createdAt as UserProfile["createdAt"]) ?? null,
    updatedAt:          (d.updatedAt as UserProfile["updatedAt"]) ?? null,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeHandle(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) || "gardener";
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

// ─── Sign up ──────────────────────────────────────────────────────────────────

export async function signUpWithEmail(input: SignUpInput): Promise<UserProfile> {
  const handle = sanitizeHandle(input.username);

  if (handle.length < 3) {
    throw new Error("Username must be at least 3 characters.");
  }

  // 1. Create Firebase Auth account
  let credential;
  try {
    credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      input.email.trim().toLowerCase(),
      input.password
    );
  } catch (err) {
    throw new Error(mapFirebaseError(err));
  }

  await updateProfile(credential.user, { displayName: input.displayName.trim() });

  // 2. Atomically claim handle + write user document
  const handleRef = doc(firestore, COLLECTIONS.handles, handle);
  const userRef   = doc(firestore, COLLECTIONS.users,   credential.user.uid);

  try {
    await runTransaction(firestore, async (tx) => {
      const handleSnap = await tx.get(handleRef);
      if (handleSnap.exists()) {
        throw new Error("That username is already taken. Please choose another.");
      }

      tx.set(handleRef, {
        uid:       credential.user.uid,
        claimedAt: serverTimestamp(),
      });

      tx.set(userRef, {
        uid:                credential.user.uid,
        email:              credential.user.email ?? input.email.trim().toLowerCase(),
        displayName:        input.displayName.trim(),
        handle,
        photoURL:           null,
        coverPhotoURL:      null,
        bio:                "",
        role:               input.role ?? "user",
        isVerified:         false,
        verificationStatus: "none",
        isBanned:           false,
        bannedReason:       null,
        followerCount:      0,
        followingCount:     0,
        postCount:          0,
        country:            input.country   || "EG",
        governorate:        input.governorate,
        city:               input.city,
        createdAt:          serverTimestamp(),
        updatedAt:          serverTimestamp(),
      });
    });
  } catch (err) {
    // Roll back the Firebase Auth account so the email isn't permanently blocked
    await credential.user.delete().catch(() => null);
    throw err instanceof Error ? err : new Error(mapFirebaseError(err));
  }

  // 3. Send verification email
  try {
    await sendEmailVerification(credential.user);
  } catch {
    // Non-fatal — user can request resend from the login page
  }

  // 4. Sign out immediately — user must verify email before accessing the app
  await signOut(firebaseAuth);

  const snap = await getDoc(userRef);
  const profile = mapProfile(snap.data()!);
  void log("auth.signup", profile.uid);
  return profile;
}

// ─── Sign in ──────────────────────────────────────────────────────────────────

export async function signInWithEmail(input: SignInInput): Promise<UserProfile> {
  let credential;
  try {
    credential = await signInWithEmailAndPassword(
      firebaseAuth,
      input.email.trim().toLowerCase(),
      input.password
    );
  } catch (err) {
    throw new Error(mapFirebaseError(err));
  }

  // Block unverified users
  if (!credential.user.emailVerified) {
    await signOut(firebaseAuth);
    throw new Error("EMAIL_NOT_VERIFIED");
  }

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

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOutUser(): Promise<void> {
  await signOut(firebaseAuth);
}

// ─── Resend verification email ────────────────────────────────────────────────

export async function resendVerificationEmail(email: string, password: string): Promise<void> {
  let credential;
  try {
    credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  } catch (err) {
    throw new Error(mapFirebaseError(err));
  }
  if (credential.user.emailVerified) {
    await signOut(firebaseAuth);
    throw new Error("Your email is already verified. You can sign in.");
  }
  await sendEmailVerification(credential.user);
  await signOut(firebaseAuth);
}

// ─── Profile helpers ──────────────────────────────────────────────────────────

export async function fetchOrCreateProfile(user: User): Promise<UserProfile> {
  const ref  = doc(firestore, COLLECTIONS.users, user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // Fallback: write a minimal profile if Firestore doc is somehow missing
    const handle = sanitizeHandle((user.email ?? user.uid).split("@")[0]);
    await runTransaction(firestore, async (tx) => {
      const s = await tx.get(ref);
      if (s.exists()) return;
      tx.set(ref, {
        uid:                user.uid,
        email:              user.email ?? "",
        displayName:        user.displayName ?? "Gardener",
        handle,
        photoURL:           user.photoURL ?? null,
        coverPhotoURL:      null,
        bio:                "",
        role:               "user",
        isVerified:         false,
        verificationStatus: "none",
        isBanned:           false,
        bannedReason:       null,
        followerCount:      0,
        followingCount:     0,
        postCount:          0,
        country:            "EG",
        governorate:        "",
        city:               "",
        createdAt:          serverTimestamp(),
        updatedAt:          serverTimestamp(),
      });
    });
    const fresh = await getDoc(ref);
    return mapProfile(fresh.data()!);
  }
  return mapProfile(snap.data());
}

export async function updateUserProfile(
  uid: string,
  patch: Partial<Pick<UserProfile, "displayName" | "bio" | "photoURL" | "handle">>
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTIONS.users, uid), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}
