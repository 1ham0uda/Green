import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { UserProfile } from "@/features/auth/types";
import { fetchPostById } from "@/features/posts/services/post-service";
import type {
  Competition,
  CompetitionEntry,
  LeaderboardRow,
} from "../types";

const COMPETITIONS = COLLECTIONS.competitions;
const ENTRIES_SUBCOLLECTION = "entries";
const VOTES_SUBCOLLECTION = "votes";

function mapCompetition(
  snap: QueryDocumentSnapshot | DocumentSnapshot
): Competition {
  const data = snap.data();
  if (!data) throw new Error("Competition snapshot has no data");
  return {
    id: snap.id,
    title: data.title,
    description: data.description ?? "",
    coverImageURL: data.coverImageURL ?? null,
    status: data.status ?? "upcoming",
    startsAt: data.startsAt ?? null,
    endsAt: data.endsAt ?? null,
    entryCount: data.entryCount ?? 0,
    createdAt: data.createdAt ?? null,
  };
}

function mapEntry(
  snap: QueryDocumentSnapshot | DocumentSnapshot
): CompetitionEntry {
  const data = snap.data();
  if (!data) throw new Error("Entry snapshot has no data");
  return {
    id: snap.id,
    competitionId: data.competitionId,
    postId: data.postId,
    userId: data.userId,
    userHandle: data.userHandle,
    userDisplayName: data.userDisplayName,
    postImageURL: data.postImageURL,
    postCaption: data.postCaption,
    voteCount: data.voteCount ?? 0,
    createdAt: data.createdAt ?? null,
  };
}

export async function fetchCompetitions(): Promise<Competition[]> {
  const q = query(
    collection(firestore, COMPETITIONS),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapCompetition);
}

export async function fetchActiveCompetitions(): Promise<Competition[]> {
  const q = query(
    collection(firestore, COMPETITIONS),
    where("status", "==", "active"),
    orderBy("endsAt", "asc"),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapCompetition);
}

export async function fetchCompetitionById(
  competitionId: string
): Promise<Competition | null> {
  const snap = await getDoc(doc(firestore, COMPETITIONS, competitionId));
  return snap.exists() ? mapCompetition(snap) : null;
}

export async function fetchEntries(
  competitionId: string
): Promise<CompetitionEntry[]> {
  const q = query(
    collection(
      firestore,
      COMPETITIONS,
      competitionId,
      ENTRIES_SUBCOLLECTION
    ),
    orderBy("voteCount", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapEntry);
}

export async function fetchLeaderboard(
  competitionId: string
): Promise<LeaderboardRow[]> {
  const entries = await fetchEntries(competitionId);
  return entries.map((entry, index) => ({ entry, rank: index + 1 }));
}

export async function submitEntry(
  competitionId: string,
  user: UserProfile,
  postId: string
): Promise<CompetitionEntry> {
  const post = await fetchPostById(postId);
  if (!post) throw new Error("Post not found");
  if (post.authorId !== user.uid) {
    throw new Error("You can only submit your own posts");
  }

  const competitionRef = doc(firestore, COMPETITIONS, competitionId);
  const entriesRef = collection(
    firestore,
    COMPETITIONS,
    competitionId,
    ENTRIES_SUBCOLLECTION
  );

  // Prevent duplicate: check for existing entry by postId for this user.
  const existing = await getDocs(
    query(
      entriesRef,
      where("userId", "==", user.uid),
      where("postId", "==", postId),
      limit(1)
    )
  );
  if (!existing.empty) {
    return mapEntry(existing.docs[0]);
  }

  const payload = {
    competitionId,
    postId,
    userId: user.uid,
    userHandle: user.handle,
    userDisplayName: user.displayName,
    postImageURL: post.imageURLs[0] ?? null,
    postCaption: post.caption,
    voteCount: 0,
    createdAt: serverTimestamp(),
  };

  // Create entry and increment counter atomically.
  const newEntryRef = doc(entriesRef);
  await runTransaction(firestore, async (tx) => {
    const comp = await tx.get(competitionRef);
    if (!comp.exists()) throw new Error("Competition not found");
    tx.set(newEntryRef, payload);
    tx.update(competitionRef, { entryCount: increment(1) });
  });

  const snap = await getDoc(newEntryRef);
  return mapEntry(snap);
}

export async function castVote(
  competitionId: string,
  entryId: string,
  userId: string
): Promise<void> {
  const entryRef = doc(
    firestore,
    COMPETITIONS,
    competitionId,
    ENTRIES_SUBCOLLECTION,
    entryId
  );
  const voteRef = doc(
    firestore,
    COMPETITIONS,
    competitionId,
    ENTRIES_SUBCOLLECTION,
    entryId,
    VOTES_SUBCOLLECTION,
    userId
  );

  await runTransaction(firestore, async (tx) => {
    const existing = await tx.get(voteRef);
    if (existing.exists()) return;

    tx.set(voteRef, { userId, createdAt: serverTimestamp() });
    tx.update(entryRef, { voteCount: increment(1) });
  });
}

export async function removeVote(
  competitionId: string,
  entryId: string,
  userId: string
): Promise<void> {
  const entryRef = doc(
    firestore,
    COMPETITIONS,
    competitionId,
    ENTRIES_SUBCOLLECTION,
    entryId
  );
  const voteRef = doc(
    firestore,
    COMPETITIONS,
    competitionId,
    ENTRIES_SUBCOLLECTION,
    entryId,
    VOTES_SUBCOLLECTION,
    userId
  );

  await runTransaction(firestore, async (tx) => {
    const existing = await tx.get(voteRef);
    if (!existing.exists()) return;

    tx.delete(voteRef);
    tx.update(entryRef, { voteCount: increment(-1) });
  });
}

export async function hasVoted(
  competitionId: string,
  entryId: string,
  userId: string
): Promise<boolean> {
  const voteRef = doc(
    firestore,
    COMPETITIONS,
    competitionId,
    ENTRIES_SUBCOLLECTION,
    entryId,
    VOTES_SUBCOLLECTION,
    userId
  );
  const snap = await getDoc(voteRef);
  return snap.exists();
}
