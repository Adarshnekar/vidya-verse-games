import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  WifiOff,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import toast from 'react-hot-toast';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from '../lib/firebase';
import { upsertUserProfile, testFirestoreConnection } from '../lib/firestoreService';
import { useFormDraft } from '../lib/useFormDraft';
import { useNetworkStatus } from '../lib/useNetworkStatus';
import { Database, CheckCircle2 } from 'lucide-react';

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const { setRole } = useUIStore();

  const from = (location.state as any)?.from?.pathname || '/';

  // Persist email in sessionStorage (password is never persisted — see useFormDraft)
  const { draft, updateDraft, clearDraft } = useFormDraft('signin-form', { email: '' });
  const email = draft.email;
  const setEmail = (v: string) => updateDraft({ email: v });

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { isOnline } = useNetworkStatus();

  /** Map a Firebase user to our internal User model, persist to store and Firestore */
  const handleFirebaseUser = async (firebaseUser: import('firebase/auth').User) => {
    const username = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'student';
    const internalUser = {
      id: firebaseUser.uid,
      username,
      name: firebaseUser.displayName || username,
      email: firebaseUser.email || '',
      role: 'Student',
      grade: 8,
      xp: 0,
      level: 1,
      isGuest: false,
    };
    setUser(internalUser, 'firebase-token');
    setRole('Student' as any);
    // Persist / update profile in Firestore
    try {
      await upsertUserProfile({
        uid: firebaseUser.uid,
        name: internalUser.name,
        email: internalUser.email,
        username,
        role: 'Student',
        grade: 8,
        xp: 0,
        level: 1,
        coins: 0,
        streak: 1,
        badges: [],
      });
      console.log('[Firestore] ✅ User profile written to Firestore');
    } catch (e) {
      console.warn('Firestore upsert warning:', e);
    }
  };

  const handleTestDatabase = async () => {
    setTestingDb(true);
    setDbStatus(null);
    try {
      const res = await testFirestoreConnection();
      if (res.ok) {
        setDbStatus('connected');
        toast.success('Firestore connected! Test document written to database.');
      } else {
        setDbStatus('error');
        toast.error(`Firestore error: ${res.error}`);
      }
    } catch (err: any) {
      setDbStatus('error');
      toast.error(`Firestore test failed: ${err.message}`);
    } finally {
      setTestingDb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your Gmail and password.');
      return;
    }
    if (!isOnline) {
      setError('You are currently offline. Please reconnect to continue.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      let cred;
      if (mode === 'signup') {
        cred = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
        await handleFirebaseUser(cred.user);
        clearDraft();
        toast.success(`Account created! Welcome, ${cred.user.email}!`);
      } else {
        cred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        await handleFirebaseUser(cred.user);
        clearDraft();
        toast.success(`Welcome back, ${cred.user.displayName || cred.user.email}!`);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/network-request-failed' || code === 'auth/internal-error') {
        setError('Network error — please check your connection and try again.');
      } else if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please switch to "Sign In".');
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError(
          mode === 'signin'
            ? 'Invalid email or password. If you are new, click "Create Account" above.'
            : 'Invalid credentials. Please try again.'
        );
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err?.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await handleFirebaseUser(cred.user);
      toast.success(`Welcome, ${cred.user.displayName || cred.user.email}!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8 relative">

        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 mb-3 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-2xl font-bold font-display text-text-primary tracking-tight">
            VidyaVerse
          </h1>
          <p className="text-xs text-text-muted mt-1">Sign in to continue your learning journey</p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-canvas p-1 rounded-xl border border-border mb-6">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Offline Warning */}
        {!isOnline && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <span>You're offline. Sign-in requires an internet connection.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Gmail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-canvas border border-border text-sm text-text-primary focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create a secure password (min 6 chars)' : 'Password'}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-canvas border border-border text-sm text-text-primary focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || googleLoading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{mode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account & Start' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-muted font-medium">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading || googleLoading}
          className="w-full py-2.5 rounded-xl bg-canvas hover:bg-black/5 dark:hover:bg-white/5 border border-border text-sm font-semibold text-text-primary flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60"
        >
          {googleLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Firestore Connectivity Test Badge */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span>Cloud Firestore:</span>
            {dbStatus === 'connected' ? (
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live & Connected
              </span>
            ) : (
              <span className="text-text-muted">Ready</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleTestDatabase}
            disabled={testingDb}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline disabled:opacity-50 cursor-pointer flex items-center gap-1"
          >
            {testingDb ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Pinging...</span>
              </>
            ) : (
              <span>Test Connection</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
