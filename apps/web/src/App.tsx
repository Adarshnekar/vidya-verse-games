/**
 * App.tsx
 * Root router and route definitions.
 *
 * Offline-first changes:
 * - useFirebaseAuth() is called here so authReady is determined at the top level.
 * - While Firebase is initializing (authReady === false), a minimal loading
 *   screen is shown so protected routes never render with stale/empty auth state.
 * - setAuthReady() is synced to authStore so child components can read it.
 * - Route to /login is preserved intentionally; network loss does NOT redirect here.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { PlayLabPage } from './pages/PlayLabPage';
import { CircuitVersePage } from './pages/CircuitVersePage';
import { CodeVersePage } from './pages/CodeVersePage';
import { MathLudoPage } from './pages/playlab/MathLudoPage';
import { MazeBotPage } from './pages/playlab/MazeBotPage';
import { CarromPage } from './pages/playlab/CarromPage';
import { BharatExplorerPage } from './pages/playlab/BharatExplorerPage';
import { SolarSystemPage } from './pages/playlab/SolarSystemPage';
import { WordQuestPage } from './pages/playlab/WordQuestPage';
import { NumberNinjasPage } from './pages/playlab/NumberNinjasPage';
import { PhysicsPlaygroundPage } from './pages/playlab/PhysicsPlaygroundPage';
import { MathVisualizerPage } from './pages/playlab/MathVisualizerPage';
import { EcosystemSimulatorPage } from './pages/playlab/EcosystemSimulatorPage';
import { ChemistryLabPage } from './pages/playlab/ChemistryLabPage';
import { HumanBodyExplorerPage } from './pages/playlab/HumanBodyExplorerPage';
import { CodeChallengePage } from './pages/codeverse/CodeChallengePage';
import { CodeLearnPage } from './pages/codeverse/CodeLearnPage';
import { SignInPage } from './pages/SignInPage';
import { useAuthStore } from './stores/authStore';
import { useFirebaseAuth } from './lib/useFirebaseAuth';

export default function App() {
  const { initGuest, setAuthReady } = useAuthStore();
  const { authReady } = useFirebaseAuth();

  // Sync Firebase auth readiness into the store so other components can read it
  useEffect(() => {
    setAuthReady(authReady);
  }, [authReady, setAuthReady]);

  // Initialize guest session only after auth has resolved and no user was found
  useEffect(() => {
    if (authReady) {
      initGuest();
    }
  }, [authReady, initGuest]);

  // Show a minimal loading screen while Firebase resolves the initial auth state.
  // This prevents a false redirect to /login for users who are already logged in.
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 animate-pulse" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Loading VidyaVerse…
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Standalone Authentication Routes */}
      <Route path="/login" element={<SignInPage />} />
      <Route path="/signin" element={<SignInPage />} />

      {/* Main Application with AppShell */}
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/playlab" element={<PlayLabPage />} />
        <Route path="/playlab/ludo" element={<MathLudoPage />} />
        <Route path="/playlab/maze" element={<MazeBotPage />} />
        <Route path="/playlab/carrom" element={<CarromPage />} />
        <Route path="/playlab/bharat" element={<BharatExplorerPage />} />
        <Route path="/playlab/wordquest" element={<WordQuestPage />} />
        <Route path="/playlab/number-ninjas" element={<NumberNinjasPage />} />
        <Route path="/playlab/solar" element={<SolarSystemPage />} />
        <Route path="/playlab/physics-playground" element={<PhysicsPlaygroundPage />} />
        <Route path="/playlab/math-visualizer" element={<MathVisualizerPage />} />
        <Route path="/playlab/ecosystem-simulator" element={<EcosystemSimulatorPage />} />
        <Route path="/playlab/chemistry-lab" element={<ChemistryLabPage />} />
        <Route path="/playlab/human-body" element={<HumanBodyExplorerPage />} />
        <Route path="/circuitverse" element={<CircuitVersePage />} />
        <Route path="/codeverse" element={<CodeVersePage />} />
        <Route path="/codeverse/learn" element={<CodeLearnPage />} />
        <Route path="/codeverse/challenge" element={<CodeChallengePage />} />
        <Route path="/codeverse/challenge/:problemId" element={<CodeChallengePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
