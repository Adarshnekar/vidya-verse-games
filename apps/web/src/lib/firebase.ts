/**
 * firebase.ts
 * Single Firebase initialization point for the VidyaVerse web app.
 *
 * Offline-first features:
 * 1. Auth: browserLocalPersistence — survives page refresh, browser restart,
 *    and temporary network loss. Network disconnection ≠ logout.
 * 2. Firestore: persistentLocalCache (IndexedDB) — modern replacement for the
 *    deprecated enableIndexedDbPersistence(). Reads return cached data offline;
 *    writes are queued and synced on reconnect.
 */
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA-2GOTlnSeYSCC1_5EZq9Tb8oFpGBazE4',
  authDomain: 'vidya-verse-26c91.firebaseapp.com',
  projectId: 'vidya-verse-26c91',
  storageBucket: 'vidya-verse-26c91.firebasestorage.app',
  messagingSenderId: '910179212120',
  appId: '1:910179212120:web:7f46b9348d31cca6a2232d',
  measurementId: 'G-JEL82RSC8X',
};

// Guard: only initialize once (important in HMR / dev environments)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// LOCAL persistence: session survives page refresh, browser restart,
// and temporary network disconnection (network loss ≠ logout)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('[Firebase] Could not set auth persistence:', err);
});

// ─── FIRESTORE ────────────────────────────────────────────────────────────────
// Use initializeFirestore with persistentLocalCache, falling back to getFirestore
// if already initialized (prevents crash on Vite HMR reloads)
import { getFirestore } from 'firebase/firestore';

function createFirestore() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    return getFirestore(app);
  }
}

export const db = createFirestore();

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type FirebaseUser,
};

// ─── FIRESTORE HELPERS ────────────────────────────────────────────────────────
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
};
