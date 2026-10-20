import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sparkles,
  Cpu,
  User,
  Sliders,
  CheckCircle2,
  Trophy,
  HelpCircle,
  Code2,
  Zap,
  ArrowRight,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { clsx } from 'clsx';

// ==========================================
// TYPES & CONSTANTS
// ==========================================

export type CellType = 'wall' | 'open' | 'visiting' | 'backtrack' | 'path' | 'start' | 'end';

export interface MazeStep {
  cell: [number, number];
  action: 'visit' | 'try_dir' | 'dead_end' | 'backtrack' | 'success';
  direction?: 'RIGHT' | 'DOWN' | 'LEFT' | 'UP';
  currentPath: Array<[number, number]>;
  visitedCells: Array<[number, number]>;
  backtrackedCells: Array<[number, number]>;
  callDepth: number;
  explanation: string;
  codeLine: number;
}

const ALGORITHM_CODE = [
  'function solveMaze(r, c, path) {',
  '  if (r === destR && c === destC) return true; // Destination reached',
  '  if (!isValid(r, c) || isVisited(r, c)) return false; // Blocked or loop',
  '  ',
  '  markVisited(r, c); path.push([r, c]); // Choose',
  '  ',
  '  for (const [dr, dc] of DIRECTIONS) { // Explore',
  '    if (solveMaze(r + dr, c + dc, path)) return true;',
  '  }',
  '  ',
  '  path.pop(); markBacktrack(r, c); // Un-choose (Backtrack)',
  '  return false;',
  '}',
];

// ==========================================
// MAZE GENERATOR (Recursive Backtracking DFS)
// ==========================================

function generateMazeMatrix(size: number): number[][] {
  // Ensure size is odd for wall/corridor lattice
  const N = size % 2 === 0 ? size + 1 : size;
  const grid: number[][] = Array.from({ length: N }, () => Array(N).fill(1));

  function carve(r: number, c: number) {
    grid[r][c] = 0;
    const directions = ([
      [0, 2],
      [2, 0],
      [0, -2],
      [-2, 0],
    ] as [number, number][]).sort(() => Math.random() - 0.5);

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < N - 1 && nc > 0 && nc < N - 1 && grid[nr][nc] === 1) {
        grid[r + dr / 2][c + dc / 2] = 0;
        carve(nr, nc);
      }
    }
  }

  // Start carving from (1, 1)
  carve(1, 1);

  // Guarantee Start and End are open
  grid[0][0] = 0;
  grid[0][1] = 0;
  grid[1][0] = 0;
  grid[1][1] = 0;

  grid[N - 1][N - 1] = 0;
  grid[N - 1][N - 2] = 0;
  grid[N - 2][N - 1] = 0;

  // Add a few random extra openings to create interesting branch choices
  const extraOpenings = Math.floor(N * 0.4);
  for (let i = 0; i < extraOpenings; i++) {
    const rx = Math.floor(Math.random() * (N - 2)) + 1;
    const ry = Math.floor(Math.random() * (N - 2)) + 1;
    grid[rx][ry] = 0;
  }

  return grid;
}

// ==========================================
// PRE-RECORDED RAT IN A MAZE TRACE ENGINE
// ==========================================

function generateMazeSolutionSteps(
  grid: number[][],
  start: [number, number],
  end: [number, number]
): MazeStep[] {
  const steps: MazeStep[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const backtracked = new Set<string>();
  const path: Array<[number, number]> = [];

  const key = (r: number, c: number) => `${r},${c}`;

  const directions: Array<{ name: 'RIGHT' | 'DOWN' | 'LEFT' | 'UP'; dr: number; dc: number }> = [
    { name: 'RIGHT', dr: 0, dc: 1 },
    { name: 'DOWN', dr: 1, dc: 0 },
    { name: 'LEFT', dr: 0, dc: -1 },
    { name: 'UP', dr: -1, dc: 0 },
  ];

  function getVisitedArray(): Array<[number, number]> {
    return Array.from(visited).map((k) => k.split(',').map(Number) as [number, number]);
  }

  function getBacktrackedArray(): Array<[number, number]> {
    return Array.from(backtracked).map((k) => k.split(',').map(Number) as [number, number]);
  }

  function dfs(r: number, c: number, depth: number): boolean {
    // Check if reached destination
    if (r === end[0] && c === end[1]) {
      path.push([r, c]);
      visited.add(key(r, c));
      steps.push({
        cell: [r, c],
        action: 'success',
        currentPath: [...path],
        visitedCells: getVisitedArray(),
        backtrackedCells: getBacktrackedArray(),
        callDepth: depth,
        explanation: `🎯 Destination reached at (${r}, ${c})! Optimal path determined with ${path.length} steps.`,
        codeLine: 2,
      });
      return true;
    }

    visited.add(key(r, c));
    path.push([r, c]);

    steps.push({
      cell: [r, c],
      action: 'visit',
      currentPath: [...path],
      visitedCells: getVisitedArray(),
      backtrackedCells: getBacktrackedArray(),
      callDepth: depth,
      explanation: `Visiting cell (${r}, ${c}). Pushing to call stack (Depth: ${depth}).`,
      codeLine: 5,
    });

    for (const { name, dr, dc } of directions) {
      const nr = r + dr;
      const nc = c + dc;

      steps.push({
        cell: [r, c],
        action: 'try_dir',
        direction: name,
        currentPath: [...path],
        visitedCells: getVisitedArray(),
        backtrackedCells: getBacktrackedArray(),
        callDepth: depth,
        explanation: `From (${r}, ${c}), exploring ${name} -> (${nr}, ${nc}).`,
        codeLine: 7,
      });

      // Boundary and wall checks
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        grid[nr][nc] === 0 &&
        !visited.has(key(nr, nc))
      ) {
        if (dfs(nr, nc, depth + 1)) {
          return true;
        }
      }
    }

    // Dead end reached -> Backtrack!
    path.pop();
    backtracked.add(key(r, c));

    steps.push({
      cell: [r, c],
      action: 'dead_end',
      currentPath: [...path],
      visitedCells: getVisitedArray(),
      backtrackedCells: getBacktrackedArray(),
      callDepth: depth,
      explanation: `Dead end at (${r}, ${c})! All directions exhausted. Unwinding call stack and marking cell.`,
      codeLine: 11,
    });

    return false;
  }

  dfs(start[0], start[1], 1);
  return steps;
}

// ==========================================
// COMPONENT
// ==========================================

export const MazeBotPage: React.FC = () => {
  const navigate = useNavigate();

  // Configuration
  const [gridSize, setGridSize] = useState<number>(13); // 11, 13, 15, 17, 19
  const [mode, setMode] = useState<'visualizer' | 'manual'>('visualizer');
  const [speedMs, setSpeedMs] = useState<number>(60); // Animation interval

  // Maze Matrix State
  const [mazeGrid, setMazeGrid] = useState<number[][]>(() => generateMazeMatrix(13));
  const startPos: [number, number] = [0, 0];
  const endPos: [number, number] = [mazeGrid.length - 1, mazeGrid[0].length - 1];

  // Visualizer Execution State
  const [executionSteps, setExecutionSteps] = useState<MazeStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Manual Play State
  const [playerPos, setPlayerPos] = useState<[number, number]>([0, 0]);
  const [playerPath, setPlayerPath] = useState<Array<[number, number]>>([[0, 0]]);
  const [manualWon, setManualWon] = useState<boolean>(false);
  const [manualStepsCount, setManualStepsCount] = useState<number>(0);

  const playbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Regenerate Maze and Steps
  const initializeNewMaze = useCallback((size: number) => {
    setIsPlaying(false);
    const newGrid = generateMazeMatrix(size);
    const N = newGrid.length;
    setMazeGrid(newGrid);

    const steps = generateMazeSolutionSteps(newGrid, [0, 0], [N - 1, N - 1]);
    setExecutionSteps(steps);
    setCurrentStepIdx(0);

    // Reset Manual Mode
    setPlayerPos([0, 0]);
    setPlayerPath([[0, 0]]);
    setManualWon(false);
    setManualStepsCount(0);
  }, []);

  // Initialize on mount or grid size change
  useEffect(() => {
    initializeNewMaze(gridSize);
  }, [gridSize, initializeNewMaze]);

  // Visualizer Playback Loop
  useEffect(() => {
    if (isPlaying && mode === 'visualizer') {
      playbackTimerRef.current = setTimeout(() => {
        setCurrentStepIdx((prev) => {
          if (prev < executionSteps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, speedMs);
    }

    return () => {
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, [isPlaying, currentStepIdx, executionSteps.length, speedMs, mode]);

  // Step Controls
  const stepForward = () => {
    setIsPlaying(false);
    if (currentStepIdx < executionSteps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  // Keyboard navigation for manual mode
  useEffect(() => {
    if (mode !== 'manual' || manualWon) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let dr = 0;
      let dc = 0;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dr = -1;
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dr = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dc = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dc = 1;
      else return;

      e.preventDefault();

      const nr = playerPos[0] + dr;
      const nc = playerPos[1] + dc;
      const N = mazeGrid.length;

      if (nr >= 0 && nr < N && nc >= 0 && nc < N && mazeGrid[nr][nc] === 0) {
        setPlayerPos([nr, nc]);
        setPlayerPath((prev) => [...prev, [nr, nc]]);
        setManualStepsCount((prev) => prev + 1);

        if (nr === N - 1 && nc === N - 1) {
          setManualWon(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, playerPos, mazeGrid, manualWon]);

  // Current visualizer step data
  const currentStep = executionSteps[currentStepIdx] || null;
  const currentPathSet = new Set(
    currentStep?.currentPath.map(([r, c]) => `${r},${c}`) || []
  );
  const backtrackedSet = new Set(
    currentStep?.backtrackedCells.map(([r, c]) => `${r},${c}`) || []
  );
  const visitedSet = new Set(
    currentStep?.visitedCells.map(([r, c]) => `${r},${c}`) || []
  );

  const N = mazeGrid.length;

  return (
    <div className="min-h-screen bg-surface-900 text-surface-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* Top Bar Header */}
      <header className="border-b border-surface-800 bg-surface-850/80 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/playlab')}
            className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-display text-white">
                MazeBot: Algorithm Visualizer
              </h1>
              <span className="badge-code text-[10px]">Rat in a Maze • DFS</span>
            </div>
            <p className="text-xs text-surface-400 hidden sm:block">
              Interactive recursive backtracking & state exploration engine
            </p>
          </div>
        </div>

        {/* Mode Toggle (Visualizer vs Play Yourself) */}
        <div className="flex items-center gap-2 bg-surface-800 p-1 rounded-xl border border-surface-700">
          <button
            onClick={() => {
              setIsPlaying(false);
              setMode('visualizer');
            }}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all',
              mode === 'visualizer'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-surface-300 hover:text-white'
            )}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Visualizer</span>
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setMode('manual');
            }}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all',
              mode === 'manual'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-surface-300 hover:text-white'
            )}
          >
            <User className="w-3.5 h-3.5" />
            <span>Manual Play</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Controls & Settings (3 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Card */}
          <div className="card space-y-4 p-5 bg-surface-800 border-surface-700/80">
            <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Simulation Controls</span>
            </h2>

            {mode === 'visualizer' ? (
              <div className="space-y-4">
                {/* Play / Pause / Step Controls */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={clsx(
                      'p-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all',
                      isPlaying
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    )}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Auto Run'}</span>
                  </button>

                  <button
                    onClick={stepForward}
                    disabled={isPlaying || currentStepIdx >= executionSteps.length - 1}
                    className="p-2.5 rounded-xl bg-surface-700 hover:bg-surface-600 disabled:opacity-50 text-surface-200 font-semibold text-xs flex items-center justify-center gap-1"
                    title="Step Forward"
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Step</span>
                  </button>

                  <button
                    onClick={resetSimulation}
                    className="p-2.5 rounded-xl bg-surface-700 hover:bg-surface-600 text-surface-200 font-semibold text-xs flex items-center justify-center gap-1"
                    title="Reset Simulation"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Step Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-surface-300">
                    <span>Progress:</span>
                    <span className="font-mono text-purple-400 font-bold">
                      {currentStepIdx + 1} / {executionSteps.length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, executionSteps.length - 1)}
                    value={currentStepIdx}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setCurrentStepIdx(Number(e.target.value));
                    }}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* Speed Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-surface-300">
                    <span>Execution Speed:</span>
                    <span className="font-mono text-surface-400">
                      {speedMs < 50 ? 'Fast' : speedMs < 120 ? 'Normal' : 'Slow'} ({speedMs}ms)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="250"
                    step="5"
                    value={speedMs}
                    onChange={(e) => setSpeedMs(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-surface-300">
                  Use your keyboard <strong className="text-white">Arrow Keys</strong> or{' '}
                  <strong className="text-white">WASD</strong> to guide the green bot to the purple goal.
                </p>
                <div className="p-3 bg-surface-900/60 rounded-xl border border-surface-700/60 text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-surface-400">
                    <span>Moves taken:</span>
                    <span className="text-white font-bold">{manualStepsCount}</span>
                  </div>
                  <div className="flex justify-between text-surface-400">
                    <span>Goal:</span>
                    <span className="text-purple-400 font-bold">({N - 1}, {N - 1})</span>
                  </div>
                </div>
                {manualWon && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center space-y-1">
                    <Trophy className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="text-sm font-bold text-emerald-300">Maze Conquered!</p>
                    <p className="text-xs text-surface-300">Solved in {manualStepsCount} moves.</p>
                  </div>
                )}
              </div>
            )}

            {/* Grid Size Selector & Generate New Maze */}
            <div className="pt-3 border-t border-surface-700/60 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-surface-300">
                  Grid Dimensions:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[11, 13, 15, 17].map((s) => (
                    <button
                      key={s}
                      onClick={() => setGridSize(s)}
                      className={clsx(
                        'py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors',
                        gridSize === s
                          ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                          : 'bg-surface-700/50 text-surface-400 border-surface-700 hover:text-white'
                      )}
                    >
                      {s}×{s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => initializeNewMaze(gridSize)}
                className="w-full py-2.5 rounded-xl bg-surface-700 hover:bg-surface-600 text-surface-100 font-semibold text-xs flex items-center justify-center gap-2 border border-surface-600 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate New Maze</span>
              </button>
            </div>
          </div>

          {/* Color Legend Card */}
          <div className="card p-4 space-y-2.5 bg-surface-800/80 border-surface-700/60">
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Color Legend
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-blue-500 border border-blue-400" />
                <span className="text-surface-300">Start (0,0)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-purple-600 border border-purple-400" />
                <span className="text-surface-300">End Portal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-400" />
                <span className="text-surface-300">Solution Path</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-yellow-400 border border-yellow-300" />
                <span className="text-surface-300">Active Node</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-rose-500 border border-rose-400" />
                <span className="text-surface-300">Backtrack</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-surface-950 border border-surface-800" />
                <span className="text-surface-300">Solid Wall</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: MAZE GRID VISUALIZER (6 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-[560px] aspect-square bg-surface-950 rounded-3xl p-3 sm:p-4 border-2 border-surface-700/80 shadow-2xl flex items-center justify-center overflow-hidden">
            <div
              className="grid gap-[2px] w-full h-full"
              style={{
                gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${N}, minmax(0, 1fr))`,
              }}
            >
              {mazeGrid.map((row, r) =>
                row.map((cellValue, c) => {
                  const isWall = cellValue === 1;
                  const isStart = r === startPos[0] && c === startPos[1];
                  const isEnd = r === endPos[0] && c === endPos[1];

                  // Visualizer states
                  const isVisiting =
                    mode === 'visualizer' &&
                    currentStep &&
                    currentStep.cell[0] === r &&
                    currentStep.cell[1] === c;

                  const isInCurrentPath =
                    mode === 'visualizer' && currentPathSet.has(`${r},${c}`);

                  const isBacktracked =
                    mode === 'visualizer' && backtrackedSet.has(`${r},${c}`);

                  // Manual Mode states
                  const isPlayerHere =
                    mode === 'manual' && playerPos[0] === r && playerPos[1] === c;
                  const isPlayerPathHere =
                    mode === 'manual' &&
                    playerPath.some(([pr, pc]) => pr === r && pc === c);

                  let cellColor = isWall ? 'bg-surface-900 border-surface-800' : 'bg-surface-950';

                  if (!isWall) {
                    if (isStart) {
                      cellColor = 'bg-blue-600 shadow-md shadow-blue-500/40';
                    } else if (isEnd) {
                      cellColor = 'bg-purple-600 shadow-md shadow-purple-500/40 animate-pulse';
                    } else if (mode === 'visualizer') {
                      if (isVisiting) {
                        cellColor = 'bg-yellow-400 ring-2 ring-yellow-200 z-10 scale-105';
                      } else if (isInCurrentPath) {
                        cellColor = 'bg-emerald-500/90 shadow-sm shadow-emerald-500/30';
                      } else if (isBacktracked) {
                        cellColor = 'bg-rose-950/70 text-rose-500 border border-rose-900/50';
                      }
                    } else if (mode === 'manual') {
                      if (isPlayerHere) {
                        cellColor = 'bg-emerald-400 ring-2 ring-white z-10 scale-110';
                      } else if (isPlayerPathHere) {
                        cellColor = 'bg-emerald-950/60 border border-emerald-800/40';
                      }
                    }
                  }

                  return (
                    <div
                      key={`cell-${r}-${c}`}
                      className={clsx(
                        'rounded-[3px] transition-colors duration-150 relative flex items-center justify-center',
                        cellColor
                      )}
                    >
                      {/* Robot Head on Visiting Cell */}
                      {isVisiting && (
                        <div className="w-2.5 h-2.5 rounded-full bg-surface-950 ring-1 ring-white animate-ping" />
                      )}

                      {/* Manual Player Indicator */}
                      {isPlayerHere && (
                        <div className="w-2.5 h-2.5 rounded-full bg-surface-950 ring-2 ring-white" />
                      )}

                      {/* Start / End Labels */}
                      {isStart && <span className="text-[8px] font-bold text-white">S</span>}
                      {isEnd && <span className="text-[8px] font-bold text-white">G</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Algorithm Call Stack & Code (3 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Real-time State & Explanation Panel */}
          <div className="card p-4 space-y-3 bg-surface-800 border-surface-700/80">
            <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Step-by-Step State</span>
            </h2>

            {mode === 'visualizer' && currentStep ? (
              <div className="space-y-2.5">
                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-surface-900/70 border border-surface-700/50">
                    <span className="text-surface-400 block text-[10px]">Call Depth</span>
                    <span className="text-purple-400 font-bold text-sm">
                      {currentStep.callDepth}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-900/70 border border-surface-700/50">
                    <span className="text-surface-400 block text-[10px]">Path Length</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {currentStep.currentPath.length}
                    </span>
                  </div>
                </div>

                {/* Live Action Box */}
                <div className="p-3 rounded-xl bg-surface-900/80 border border-purple-500/30 text-xs space-y-1">
                  <div className="flex items-center justify-between text-purple-300 font-bold">
                    <span>Action: {currentStep.action.toUpperCase()}</span>
                    {currentStep.direction && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-900 text-purple-200 text-[10px]">
                        DIR: {currentStep.direction}
                      </span>
                    )}
                  </div>
                  <p className="text-surface-300 text-[11px] leading-relaxed">
                    {currentStep.explanation}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-surface-400">
                Switch to AI Visualizer mode to observe recursion stack unwinding and state metrics.
              </p>
            )}
          </div>

          {/* Code Viewer with Live Highlight */}
          <div className="card p-4 space-y-3 bg-surface-850 border-surface-700/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Algorithm Code</span>
              </h3>
              <span className="text-[10px] text-surface-400 font-mono">JavaScript / C++</span>
            </div>

            <div className="p-3 bg-surface-950 rounded-xl font-mono text-[11px] text-surface-300 overflow-x-auto space-y-0.5 border border-surface-800">
              {ALGORITHM_CODE.map((line, idx) => {
                const lineNum = idx + 1;
                const isCurrentLine =
                  mode === 'visualizer' && currentStep?.codeLine === lineNum;

                return (
                  <div
                    key={idx}
                    className={clsx(
                      'px-1.5 py-0.5 rounded transition-colors flex items-center gap-2',
                      isCurrentLine
                        ? 'bg-purple-600/30 text-purple-200 border-l-2 border-purple-400 font-bold'
                        : 'text-surface-400'
                    )}
                  >
                    <span className="text-[9px] text-surface-600 w-4 text-right select-none">
                      {lineNum}
                    </span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MazeBotPage;
