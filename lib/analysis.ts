import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { getDb } from "./firebase";

export type AnalysisArrays = {
  mutual: string[];
  fans: string[];
  not_following_back: string[];
};

export type SnapshotCounts = {
  followers: number;
  following: number;
  mutual: number;
  fans: number;
  not_following_back: number;
  new_unfollowers: number;
};

export type Snapshot = AnalysisArrays & {
  id: string;
  new_unfollowers: string[];
  counts: SnapshotCounts;
};

export type AnalysisResult = Snapshot & {
  followersCount: number;
  followingCount: number;
  previousId: string | null;
};

export type HistoryPoint = {
  id: string;
  createdAt: Date;
  counts: SnapshotCounts;
};

const HISTORY = "history";

export function computeArrays(
  followers: string[],
  following: string[],
): AnalysisArrays {
  const followerSet = new Set(followers);
  const followingSet = new Set(following);

  const mutual: string[] = [];
  const fans: string[] = [];
  const not_following_back: string[] = [];

  for (const u of followingSet) {
    if (followerSet.has(u)) mutual.push(u);
    else not_following_back.push(u);
  }
  for (const u of followerSet) {
    if (!followingSet.has(u)) fans.push(u);
  }

  mutual.sort();
  fans.sort();
  not_following_back.sort();

  return { mutual, fans, not_following_back };
}

export function diffNewUnfollowers(
  previous: string[] | null | undefined,
  current: string[],
): string[] {
  if (!previous || previous.length === 0) return [];
  const prev = new Set(previous);
  return current.filter((u) => !prev.has(u)).sort();
}

function buildCounts(
  followers: string[],
  following: string[],
  arrays: AnalysisArrays,
  new_unfollowers: string[],
): SnapshotCounts {
  return {
    followers: followers.length,
    following: following.length,
    mutual: arrays.mutual.length,
    fans: arrays.fans.length,
    not_following_back: arrays.not_following_back.length,
    new_unfollowers: new_unfollowers.length,
  };
}

/**
 * Rebuilds a SnapshotCounts from whatever is available on a Firestore
 * document - falling back to array lengths when older docs lack `counts`.
 */
function countsFromData(data: {
  counts?: Partial<SnapshotCounts>;
  mutual?: string[];
  fans?: string[];
  not_following_back?: string[];
  new_unfollowers?: string[];
}): SnapshotCounts {
  const mutual = data.mutual ?? [];
  const fans = data.fans ?? [];
  const notBack = data.not_following_back ?? [];
  const newUnf = data.new_unfollowers ?? [];
  const c = data.counts ?? {};
  const mutualCount = c.mutual ?? mutual.length;
  const fansCount = c.fans ?? fans.length;
  const notBackCount = c.not_following_back ?? notBack.length;
  return {
    followers: c.followers ?? mutualCount + fansCount,
    following: c.following ?? mutualCount + notBackCount,
    mutual: mutualCount,
    fans: fansCount,
    not_following_back: notBackCount,
    new_unfollowers: c.new_unfollowers ?? newUnf.length,
  };
}

export async function fetchLatestSnapshot(
  options: { excludeId?: string } = {},
): Promise<Snapshot | null> {
  const db = getDb();
  // orderBy on a normal field (createdAt) is auto-indexed by Firestore.
  // Fetch up to 2 so we can skip `excludeId` without a compound query.
  const q = query(
    collection(db, HISTORY),
    orderBy("createdAt", "desc"),
    limit(2),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const docSnap = snap.docs.find((d) => d.id !== options.excludeId);
  if (!docSnap) return null;

  const data = docSnap.data() as {
    mutual?: string[];
    fans?: string[];
    not_following_back?: string[];
    new_unfollowers?: string[];
    counts?: Partial<SnapshotCounts>;
  };
  return {
    id: docSnap.id,
    mutual: data.mutual ?? [],
    fans: data.fans ?? [],
    not_following_back: data.not_following_back ?? [],
    new_unfollowers: data.new_unfollowers ?? [],
    counts: countsFromData(data),
  };
}

/**
 * Returns up to `days` most-recent snapshots (newest last, so charts render
 * left-to-right chronologically). Falls back to counting the embedded arrays
 * if an older document didn't store the `counts` field.
 */
export async function fetchHistory(days = 30): Promise<HistoryPoint[]> {
  const db = getDb();
  const q = query(
    collection(db, HISTORY),
    orderBy("createdAt", "desc"),
    limit(days),
  );
  const snap = await getDocs(q);
  if (snap.empty) return [];

  const points: HistoryPoint[] = snap.docs.map((d) => {
    const data = d.data() as {
      mutual?: string[];
      fans?: string[];
      not_following_back?: string[];
      new_unfollowers?: string[];
      counts?: Partial<SnapshotCounts>;
      createdAt?: Timestamp;
    };
    const createdAt = data.createdAt?.toDate?.() ?? parseIdToDate(d.id);
    return {
      id: d.id,
      createdAt,
      counts: countsFromData(data),
    };
  });

  return points.reverse();
}

function parseIdToDate(id: string): Date {
  const [y, m, d] = id.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export function todayId(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Fetches a single snapshot document by its id (which is the `YYYY-MM-DD`
 * date). Returns `null` if the doc doesn't exist.
 */
export async function fetchSnapshotById(id: string): Promise<Snapshot | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, HISTORY, id));
  if (!snap.exists()) return null;

  const data = snap.data() as {
    mutual?: string[];
    fans?: string[];
    not_following_back?: string[];
    new_unfollowers?: string[];
    counts?: Partial<SnapshotCounts>;
  };
  return {
    id: snap.id,
    mutual: data.mutual ?? [],
    fans: data.fans ?? [],
    not_following_back: data.not_following_back ?? [],
    new_unfollowers: data.new_unfollowers ?? [],
    counts: countsFromData(data),
  };
}

/**
 * Cheap metadata listing of every snapshot (up to 366). Used for the
 * history calendar so we can mark days without pulling the full arrays.
 */
export async function fetchAllHistoryIds(
  cap = 366,
): Promise<{ id: string; createdAt: Date }[]> {
  const db = getDb();
  const q = query(
    collection(db, HISTORY),
    orderBy("createdAt", "desc"),
    limit(cap),
  );
  const snap = await getDocs(q);
  if (snap.empty) return [];
  return snap.docs.map((d) => {
    const data = d.data() as { createdAt?: Timestamp };
    const createdAt = data.createdAt?.toDate?.() ?? parseIdToDate(d.id);
    return { id: d.id, createdAt };
  });
}

/**
 * Wipes every document from the `history` collection. Firestore batches are
 * capped at 500 writes so we chunk if needed.
 */
export async function deleteAllHistory(): Promise<number> {
  const db = getDb();
  const snap = await getDocs(collection(db, HISTORY));
  if (snap.empty) return 0;

  let deleted = 0;
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db);
    for (const d of docs.slice(i, i + 400)) batch.delete(d.ref);
    await batch.commit();
    deleted += Math.min(400, docs.length - i);
  }
  return deleted;
}

export async function saveSnapshot(
  id: string,
  payload: AnalysisArrays & {
    new_unfollowers: string[];
    counts: SnapshotCounts;
  },
): Promise<void> {
  await setDoc(doc(getDb(), HISTORY, id), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

export async function runAnalysis(
  followers: string[],
  following: string[],
): Promise<AnalysisResult> {
  const arrays = computeArrays(followers, following);
  const id = todayId();
  // Skip today's existing snapshot (if re-running the same day) so the diff
  // always compares against a prior-day snapshot.
  const previous = await fetchLatestSnapshot({ excludeId: id });
  const new_unfollowers = diffNewUnfollowers(
    previous?.not_following_back,
    arrays.not_following_back,
  );

  const counts = buildCounts(followers, following, arrays, new_unfollowers);
  await saveSnapshot(id, { ...arrays, new_unfollowers, counts });

  return {
    id,
    ...arrays,
    new_unfollowers,
    counts,
    followersCount: followers.length,
    followingCount: following.length,
    previousId: previous?.id ?? null,
  };
}
