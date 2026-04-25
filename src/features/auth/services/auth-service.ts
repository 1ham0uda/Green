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
  type FieldValue,
} from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { log } from "@/lib/logger";
import {
  validateEmail,
  validateHandle,
  validatePassword,
  validateString,
  ValidationError,
} from "@/lib/security/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
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

export async function isHandleAvailable(handle: string): Promise<boolean> {
  // Validate format BEFORE issuing a query — no point round-tripping for
  // garbage input, and we don't want attackers to use this endpoint as an
  // unbounded query probe.
  let cleaned: string;
  try {
    cleaned = validateHandle(handle);
  } catch {
    return false;
  }
  const q = query(
    collection(firestore, COLLECTIONS.users),
    where("handle", "==", cleaned),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty;
}

// ─── Sign up ──────────────────────────────────────────────────────────────────

export async function signUpWithEmail(input: SignUpInput): Promise<UserProfile> {
  // Rate limit BEFORE any Firebase calls — prevents spam at the boundary.
  checkRateLimit("auth.signup");

  // Strict input validation. Mirrors Firestore-rule constraints so a malicious
  // client cannot bypass the UI checks. Throws ValidationError on bad input.
  const email       = validateEmail(input.email);
  const password    = validatePassword(input.password);
  const handle      = validateHandle(input.username);
  const displayName = validateString(input.displayName, {
    field: "Display name", min: 1, max: 80,
  });

  // Account type is a closed set — never trust client-supplied roles.
  const role: UserRole = input.role === "business" ? "business" : "user";

  // Country / governorate / city are short enums — defensive caps.
  const country     = validateString(input.country || "EG",
                        { field: "Country", min: 1, max: 8 });
  const governorate = validateString(input.governorate || "",
                        { field: "Governorate", min: 0, max: 80 });
  const city        = validateString(input.city || "",
                        { field: "City", min: 0, max: 80 });

  // 1. Create Firebase Auth account
  let credential;
  try {
    credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  } catch (err) {
    throw new Error(mapFirebaseError(err));
  }

  await updateProfile(credential.user, { displayName });

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

      // NOTE: every privileged field (role, isVerified, isBanned) is fixed to
      // its safe default here AND enforced by Firestore rules on create —
      // any client attempt to self-elevate to admin is rejected by both layers.
      tx.set(userRef, {
        uid:                credential.user.uid,
        email:              credential.user.email ?? email,
        displayName,
        handle,
        photoURL:           null,
        coverPhotoURL:      null,
        bio:                "",
        role,
        isVerified:         false,
        verificationStatus: "none",
        isBanned:           false,
        bannedReason:       null,
        followerCount:      0,
        followingCount:     0,
        postCount:          0,
        country,
        governorate,
        city,
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
  checkRateLimit("auth.signin");

  // Light validation — full password rules are not enforced on sign-in
  // (legacy passwords may exist), but we do reject malformed shape.
  const email = validateEmail(input.email);
  if (typeof input.password !== "string" || input.password.length === 0
      || input.password.length > 256) {
    throw new ValidationError("Invalid email or password.");
  }

  let credential;
  try {
    credential = await signInWithEmailAndPassword(firebaseAuth, email, input.password);
  } catch (err) {
    throw new Error(mapFirebaseError(err));
  }

  // Block unverified users
  if (!credential.user.emailVerified) {
    await signOut(firebaseAuth);
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  const profile = await fetchProfile(credential.user);

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
  checkRateLimit("auth.resend");
  const cleanEmail = validateEmail(email);
  if (typeof password !== "string" || password.length === 0 || password.length > 256) {
    throw new ValidationError("Invalid email or password.");
  }

  let credential;
  try {
    credential = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, password);
  } catch (err) {
    throw new Error(mapFirebaseError(err));
  }

  try {
    if (credential.user.emailVerified) {
      throw new Error("Your email is already verified. You can sign in.");
    }
    await sendEmailVerification(credential.user);
  } finally {
    // Always sign out, whether sendEmailVerification succeeded or threw.
    await signOut(firebaseAuth).catch(() => null);
  }
}

// ─── Profile helpers ──────────────────────────────────────────────────────────

/**
 * Fetches the Firestore profile for a verified Firebase Auth user.
 * Throws if the profile document does not exist — this is a data integrity
 * error that must not be silently papered over.
 */
export async function fetchProfile(user: User): Promise<UserProfile> {
  const ref  = doc(firestore, COLLECTIONS.users, user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error(
      "Account profile not found. Please contact support or sign up again."
    );
  }
  return mapProfile(snap.data());
}

export async function updateUserProfile(
  uid: string,
  patch: Partial<Pick<UserProfile, "displayName" | "bio" | "photoURL" | "handle">>
): Promise<void> {
  // Validate every field that the caller is allowed to touch. Anything not
  // listed here is silently dropped — the Firestore rules enforce the same
  // allow-list, but this stops accidental writes from reaching the wire.
  const safe: Record<string, FieldValue | string | null> = { updatedAt: serverTimestamp() };
  if (patch.displayName !== undefined) {
    safe.displayName = validateString(patch.displayName,
      { field: "Display name", min: 1, max: 80 });
  }
  if (patch.bio !== undefined) {
    safe.bio = validateString(patch.bio, { field: "Bio", min: 0, max: 500 });
  }
  if (patch.handle !== undefined) {
    safe.handle = validateHandle(patch.handle);
  }
  if (patch.photoURL !== undefined) {
    // Photo URL comes from Firebase Storage download URL — trust it shape-wise
    // but cap length defensively.
    if (patch.photoURL !== null
        && (typeof patch.photoURL !== "string" || patch.photoURL.length > 2048)) {
      throw new ValidationError("Invalid photo URL.");
    }
    safe.photoURL = patch.photoURL;
  }

  await updateDoc(doc(firestore, COLLECTIONS.users, uid), safe);
}
