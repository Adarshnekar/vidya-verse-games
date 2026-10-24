/**
 * useFirebaseAuth.ts
 * Wraps Firebase onAuthStateChanged to expose:
 *   - firebaseUser: the current Firebase user (or null)
 *   - authReady: true once Firebase has resolved the initial auth state
 *
 * This prevents protected routes from rendering before Firebase has
 * determined whether a user is logged in — critical for preventing
 * a flash redirect to /login on refresh.
 *
 * Network disconnection does NOT trigger a signOut event in Firebase,
 * so this hook correctly preserves auth state when offline.
 */
import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, type FirebaseUser } from './firebase';

interface FirebaseAuthState {
  firebaseUser: FirebaseUser | null;
  authReady: boolean;
}

export function useFirebaseAuth(): FirebaseAuthState {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // onAuthStateChanged fires exactly once on mount with the persisted user,
    // then again only on intentional sign-in or sign-out events.
    // A network outage will NOT trigger this with null.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      // Mark auth as resolved — from this point on, the app knows
      // definitively whether a user is logged in.
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return { firebaseUser, authReady };
}
