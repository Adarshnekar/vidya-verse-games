/**
 * firestoreService.ts
 * Centralized Firestore operations for VidyaVerse collections:
 *   - users/{uid}      : user profile, XP, level, badges
 *   - scores/{uid}     : game scores per activity
 *   - progress/{uid}   : CodeVerse / CircuitVerse progress
 *   - leaderboard      : top scores across all users
 */

import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  onSnapshot,
  type DocumentData,
} from './firebase';

// ─────────────────────────────────────────────
// CONNECTIVITY TEST
// ─────────────────────────────────────────────

/**
 * Write a small test document to Firestore to confirm end-to-end connectivity.
 * The document is written to _connectivity_test/{timestamp} and can be safely
 * deleted from the Firebase Console after verification.
 * Returns true if write succeeded, false otherwise.
 */
export async function testFirestoreConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const testRef = doc(db, '_connectivity_test', `ping_${Date.now()}`);
    await setDoc(testRef, {
      timestamp: serverTimestamp(),
      message: 'VidyaVerse connectivity test',
    });
    console.log('[Firestore] ✅ Connectivity test PASSED — data written successfully.');
    return { ok: true };
  } catch (err: any) {
    console.error('[Firestore] ❌ Connectivity test FAILED:', err?.code, err?.message);
    return { ok: false, error: err?.message || String(err) };
  }
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  username: string;
  role: string;
  grade: number;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  badges: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface ActivityScore {
  uid: string;
  name: string;
  activity: string; // e.g. 'math-ludo', 'mazebot', 'carrom'
  score: number;
  timeTaken?: number; // seconds
  createdAt?: any;
}

export interface UserProgress {
  uid: string;
  codeverse?: {
    completedLessons: string[];
    completedChallenges: string[];
    lastOpened?: string;
  };
  circuitverse?: {
    completedExperiments: string[];
    lastOpened?: string;
  };
  playlab?: {
    [game: string]: { highScore: number; timesPlayed: number };
  };
  updatedAt?: any;
}

export interface LeaderboardEntry {
  uid: string;
  name: string;
  avatar?: string;
  activity: string;
  score: number;
  grade?: number;
  createdAt?: any;
}

// ─────────────────────────────────────────────
// USERS COLLECTION
// ─────────────────────────────────────────────

/** Create or update a user profile doc on sign-in */
export async function upsertUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
  console.log('[Firestore] upsertUserProfile called for uid:', profile.uid);
  const ref = doc(db, 'users', profile.uid);

  try {
    const snap = await getDoc(ref);

    if (snap.exists()) {
      console.log('[Firestore] Updating existing user profile...');
      await updateDoc(ref, {
        name: profile.name,
        email: profile.email,
        updatedAt: serverTimestamp(),
      });
      console.log('[Firestore] ✅ User profile updated successfully.');
    } else {
      console.log('[Firestore] Creating new user profile...');
      await setDoc(ref, {
        ...profile,
        coins: profile.coins ?? 0,
        streak: profile.streak ?? 1,
        badges: profile.badges ?? [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('[Firestore] ✅ User profile created successfully.');
    }
  } catch (err: any) {
    console.error('[Firestore] ❌ upsertUserProfile failed:', err?.code, err?.message, err);
    throw err; // Re-throw so the caller (SignInPage) can surface it
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserXP(uid: string, xp: number, level: number) {
  await updateDoc(doc(db, 'users', uid), { xp, level, updatedAt: serverTimestamp() });
}

export async function addBadge(uid: string, badge: string, currentBadges: string[]) {
  if (currentBadges.includes(badge)) return;
  await updateDoc(doc(db, 'users', uid), {
    badges: [...currentBadges, badge],
    updatedAt: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────
// SCORES COLLECTION
// ─────────────────────────────────────────────

/** Save a new score entry for a user's activity */
export async function saveScore(entry: Omit<ActivityScore, 'createdAt'>) {
  await addDoc(collection(db, 'scores'), {
    ...entry,
    createdAt: serverTimestamp(),
  });
}

/** Get all scores for a specific user */
export async function getUserScores(uid: string): Promise<ActivityScore[]> {
  const q = query(
    collection(db, 'scores'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ActivityScore);
}

/** Get top scores for a specific activity */
export async function getTopScores(activity: string, count = 10): Promise<ActivityScore[]> {
  const q = query(
    collection(db, 'scores'),
    where('activity', '==', activity),
    orderBy('score', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ActivityScore);
}

// ─────────────────────────────────────────────
// PROGRESS COLLECTION
// ─────────────────────────────────────────────

export async function getUserProgress(uid: string): Promise<UserProgress | null> {
  const snap = await getDoc(doc(db, 'progress', uid));
  return snap.exists() ? (snap.data() as UserProgress) : null;
}

export async function updateProgress(uid: string, updates: Partial<Omit<UserProgress, 'uid'>>) {
  const ref = doc(db, 'progress', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { uid, ...updates, updatedAt: serverTimestamp() });
  }
}

// ─────────────────────────────────────────────
// LEADERBOARD COLLECTION
// ─────────────────────────────────────────────

/** Post a leaderboard entry (called after a game ends) */
export async function postLeaderboardEntry(entry: Omit<LeaderboardEntry, 'createdAt'>) {
  await addDoc(collection(db, 'leaderboard'), {
    ...entry,
    createdAt: serverTimestamp(),
  });
}

/** Get global leaderboard for an activity */
export async function getLeaderboard(activity: string, count = 10): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, 'leaderboard'),
    where('activity', '==', activity),
    orderBy('score', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as LeaderboardEntry);
}

/** Real-time leaderboard listener */
export function subscribeLeaderboard(
  activity: string,
  count: number,
  callback: (entries: LeaderboardEntry[]) => void
) {
  const q = query(
    collection(db, 'leaderboard'),
    where('activity', '==', activity),
    orderBy('score', 'desc'),
    limit(count)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as LeaderboardEntry));
  });
}
