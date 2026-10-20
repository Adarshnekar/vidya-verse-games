import { Routes, Route, Navigate } from 'react-router-dom';
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
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';

export default function App() {
  const { initGuest } = useAuthStore();
  
  useEffect(() => {
    initGuest();
  }, [initGuest]);

  return (
    <Routes>
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
