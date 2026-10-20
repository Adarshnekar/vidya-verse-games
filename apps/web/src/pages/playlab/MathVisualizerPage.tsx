import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  Divide,
  Hash,
  Layers,
  LineChart,
  Shapes,
  Sparkles,
  RotateCcw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

type VisualizerTab = 'numberline' | 'fractions' | 'geometry' | 'grapher';

export const MathVisualizerPage: React.FC = () => {
  const navigate = useNavigate();
  const { addXP } = useAuthStore();

  const [activeTab, setActiveTab] = useState<VisualizerTab>('numberline');

  // --- 1. NUMBER LINE STATE ---
  const [nlStart, setNlStart] = useState<number>(3);
  const [nlJump, setNlJump] = useState<number>(5);
  const [nlOperation, setNlOperation] = useState<'add' | 'subtract'>('add');

  // --- 2. FRACTION BARS STATE ---
  const [num1, setNum1] = useState<number>(3);
  const [den1, setDen1] = useState<number>(4);
  const [num2, setNum2] = useState<number>(2);
  const [den2, setDen2] = useState<number>(3);

  // --- 3. GEOMETRY STATE ---
  const [polygonSides, setPolygonSides] = useState<number>(4); // 3=triangle, 4=square, 5=pentagon, 6=hexagon, 8=octagon
  const [shapeRadius, setShapeRadius] = useState<number>(80);
  const [showSymmetry, setShowSymmetry] = useState<boolean>(true);

  // --- 4. FUNCTION GRAPHER STATE ---
  const [functionType, setFunctionType] = useState<'linear' | 'quadratic'>('linear');
  const [slopeM, setSlopeM] = useState<number>(1);
  const [interceptC, setInterceptC] = useState<number>(2);
  const [coeffA, setCoeffA] = useState<number>(1);
  const [coeffB, setCoeffB] = useState<number>(0);

  // Number line calculations
  const nlResult = nlOperation === 'add' ? nlStart + nlJump : nlStart - nlJump;

  // Geometry calculations
  const interiorAngle = ((polygonSides - 2) * 180) / polygonSides;
  const sideLength = 2 * shapeRadius * Math.sin(Math.PI / polygonSides);
  const perimeter = polygonSides * sideLength;
  const apothem = shapeRadius * Math.cos(Math.PI / polygonSides);
  const area = 0.5 * perimeter * apothem;

  // Polygon coordinates
  const polyPoints = Array.from({ length: polygonSides }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / polygonSides - Math.PI / 2;
    return {
      x: 180 + shapeRadius * Math.cos(angle),
      y: 160 + shapeRadius * Math.sin(angle),
    };
  });
  const polyPointsStr = polyPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/playlab')}
            className="p-2 rounded-xl bg-card border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                Math <span className="text-[#10B981]">Visualizer</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Compass className="w-3.5 h-3.5" />
                Classes 1–10
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Interactive number lines, fraction bars, geometric symmetry & function grapher
            </p>
          </div>
        </div>
      </div>

      {/* Visualizer Mode Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-card border border-border rounded-2xl p-2 shadow-soft">
        {[
          { id: 'numberline', label: 'Number Line & Arithmetic', icon: Hash, grades: 'Classes 1–4' },
          { id: 'fractions', label: 'Fraction Bars & Comparison', icon: Divide, grades: 'Classes 3–6' },
          { id: 'geometry', label: 'Geometry & Symmetry', icon: Shapes, grades: 'Classes 5–8' },
          { id: 'grapher', label: 'Coordinate Grapher', icon: LineChart, grades: 'Classes 8–10' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as VisualizerTab);
                addXP(5);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#10B981] text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/5 text-text-muted'
                }`}
              >
                {tab.grades}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Workspaces */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-soft">
        {/* ========================================== */}
        {/* 1. NUMBER LINE WORKSPACE */}
        {/* ========================================== */}
        {activeTab === 'numberline' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold font-display text-text-primary">
                Interactive Dynamic Number Line
              </h2>
              <p className="text-xs text-text-muted">
                Visualize mathematical addition and subtraction as vector jumps along the line
              </p>
            </div>

            {/* Arithmetic Formula Display */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-canvas border border-border text-2xl font-black font-mono text-text-primary shadow-sm">
                <span className="text-blue-500">{nlStart}</span>
                <span className="text-text-muted">{nlOperation === 'add' ? '+' : '−'}</span>
                <span className="text-emerald-500">{nlJump}</span>
                <span className="text-text-muted">=</span>
                <span className="text-[#10B981] underline decoration-wavy underline-offset-4">
                  {nlResult}
                </span>
              </div>
            </div>

            {/* Interactive SVG Number Line Canvas */}
            <div className="w-full overflow-x-auto p-4 bg-canvas rounded-2xl border border-border">
              <svg viewBox="0 0 800 220" className="w-full min-w-[700px] h-52">
                {/* Horizontal Axis */}
                <line x1="50" y1="140" x2="750" y2="140" stroke="#94A3B8" strokeWidth="3" />
                <polygon points="760,140 745,133 745,147" fill="#94A3B8" />
                <polygon points="40,140 55,133 55,147" fill="#94A3B8" />

                {/* Ticks and Numbers from -5 to 15 (offset = 5) */}
                {Array.from({ length: 21 }).map((_, i) => {
                  const val = i - 5;
                  const x = 70 + i * 33;
                  const isZero = val === 0;
                  const isStart = val === nlStart;
                  const isEnd = val === nlResult;

                  return (
                    <g key={i}>
                      <line
                        x1={x}
                        y1={isZero ? 125 : 133}
                        x2={x}
                        y2={isZero ? 155 : 147}
                        stroke={isZero ? '#10B981' : '#64748B'}
                        strokeWidth={isZero ? 3 : 1.5}
                      />
                      <text
                        x={x}
                        y="172"
                        textAnchor="middle"
                        fontSize={isZero ? '14' : '12'}
                        fontWeight={isZero || isStart || isEnd ? 'bold' : 'normal'}
                        fill={isStart ? '#3B82F6' : isEnd ? '#10B981' : isZero ? '#10B981' : '#94A3B8'}
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Jump Arc */}
                {(() => {
                  const xStart = 70 + (nlStart + 5) * 33;
                  const xEnd = 70 + (nlResult + 5) * 33;
                  const midX = (xStart + xEnd) / 2;
                  const arcHeight = Math.min(100, Math.max(40, Math.abs(nlJump) * 12));
                  const pathD = `M ${xStart} 135 Q ${midX} ${135 - arcHeight} ${xEnd} 135`;

                  return (
                    <g>
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3.5"
                        strokeDasharray="6 3"
                      />
                      {/* Destination Circle */}
                      <circle cx={xEnd} cy="135" r="7" fill="#10B981" />
                      {/* Origin Circle */}
                      <circle cx={xStart} cy="135" r="6" fill="#3B82F6" />
                      {/* Jump Label */}
                      <text
                        x={midX}
                        y={130 - arcHeight}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="bold"
                        fill="#10B981"
                      >
                        {nlOperation === 'add' ? `+${nlJump}` : `−${nlJump}`}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Slider Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-text-primary">
                  <span>Starting Number</span>
                  <span className="font-mono text-blue-500">{nlStart}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="10"
                  value={nlStart}
                  onChange={(e) => setNlStart(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-text-primary">
                  <span>Jump Magnitude</span>
                  <span className="font-mono text-emerald-500">{nlJump}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={nlJump}
                  onChange={(e) => setNlJump(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-text-primary block">Operation</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNlOperation('add')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      nlOperation === 'add'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-card border border-border text-text-muted'
                    }`}
                  >
                    + Addition
                  </button>
                  <button
                    onClick={() => setNlOperation('subtract')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      nlOperation === 'subtract'
                        ? 'bg-rose-500 text-white'
                        : 'bg-card border border-border text-text-muted'
                    }`}
                  >
                    − Subtraction
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 2. FRACTION BARS WORKSPACE */}
        {/* ========================================== */}
        {activeTab === 'fractions' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold font-display text-text-primary">
                Fraction Bars & Equivalence Explorer
              </h2>
              <p className="text-xs text-text-muted">
                Directly compare fraction lengths and observe equivalent slices side-by-side
              </p>
            </div>

            {/* Fraction Comparer Readout */}
            <div className="text-center">
              <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-canvas border border-border shadow-sm text-xl font-bold font-mono">
                <span className="text-blue-500">
                  {num1}/{den1} ({(num1 / den1).toFixed(2)})
                </span>
                <span className="text-text-muted font-normal text-sm">
                  {num1 / den1 > num2 / den2 ? '>' : num1 / den1 < num2 / den2 ? '<' : '='}
                </span>
                <span className="text-amber-500">
                  {num2}/{den2} ({(num2 / den2).toFixed(2)})
                </span>
              </div>
            </div>

            {/* Visual Bars Container */}
            <div className="space-y-6 bg-canvas p-6 rounded-2xl border border-border">
              {/* Bar 1 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-text-primary">
                  <span>Fraction A: {num1}/{den1}</span>
                  <span className="text-blue-500 font-mono">{((num1 / den1) * 100).toFixed(0)}% of Whole</span>
                </div>
                <div className="flex h-12 rounded-xl overflow-hidden border-2 border-blue-500/40 bg-card">
                  {Array.from({ length: den1 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 border-r border-border last:border-r-0 flex items-center justify-center text-xs font-bold transition-all ${
                        i < num1
                          ? 'bg-blue-500 text-white shadow-inner'
                          : 'bg-card text-text-muted/40'
                      }`}
                    >
                      1/{den1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar 2 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-text-primary">
                  <span>Fraction B: {num2}/{den2}</span>
                  <span className="text-amber-500 font-mono">{((num2 / den2) * 100).toFixed(0)}% of Whole</span>
                </div>
                <div className="flex h-12 rounded-xl overflow-hidden border-2 border-amber-500/40 bg-card">
                  {Array.from({ length: den2 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 border-r border-border last:border-r-0 flex items-center justify-center text-xs font-bold transition-all ${
                        i < num2
                          ? 'bg-amber-500 text-white shadow-inner'
                          : 'bg-card text-text-muted/40'
                      }`}
                    >
                      1/{den2}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fraction Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-canvas border border-border space-y-3">
                <h4 className="font-bold text-xs text-blue-500">Configure Fraction A</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Numerator (Parts selected): {num1}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={den1}
                    value={num1}
                    onChange={(e) => setNum1(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Denominator (Total equal parts): {den1}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    value={den1}
                    onChange={(e) => {
                      const d = parseInt(e.target.value);
                      setDen1(d);
                      if (num1 > d) setNum1(d);
                    }}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-canvas border border-border space-y-3">
                <h4 className="font-bold text-xs text-amber-500">Configure Fraction B</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Numerator (Parts selected): {num2}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={den2}
                    value={num2}
                    onChange={(e) => setNum2(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Denominator (Total equal parts): {den2}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    value={den2}
                    onChange={(e) => {
                      const d = parseInt(e.target.value);
                      setDen2(d);
                      if (num2 > d) setNum2(d);
                    }}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 3. GEOMETRY & SYMMETRY WORKSPACE */}
        {/* ========================================== */}
        {activeTab === 'geometry' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold font-display text-text-primary">
                Regular Polygons, Angles & Symmetry
              </h2>
              <p className="text-xs text-text-muted">
                Explore internal angles, perimeter, and lines of reflectional symmetry
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* SVG Canvas */}
              <div className="p-6 bg-canvas rounded-2xl border border-border flex items-center justify-center">
                <svg viewBox="0 0 360 320" className="w-full max-w-[320px] h-72">
                  {/* Lines of Symmetry */}
                  {showSymmetry &&
                    Array.from({ length: polygonSides }).map((_, i) => {
                      const angle = (i * Math.PI) / polygonSides - Math.PI / 2;
                      const x1 = 180 + 130 * Math.cos(angle);
                      const y1 = 160 + 130 * Math.sin(angle);
                      const x2 = 180 - 130 * Math.cos(angle);
                      const y2 = 160 - 130 * Math.sin(angle);
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#EC4899"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          opacity="0.6"
                        />
                      );
                    })}

                  {/* Polygon Shape */}
                  <polygon
                    points={polyPointsStr}
                    fill="rgba(16, 185, 129, 0.2)"
                    stroke="#10B981"
                    strokeWidth="3.5"
                  />

                  {/* Vertices */}
                  {polyPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="5" fill="#10B981" />
                  ))}

                  {/* Center Dot */}
                  <circle cx="180" cy="160" r="4" fill="#3B82F6" />
                </svg>
              </div>

              {/* Geometric Calculations Dossier */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-canvas border border-border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">Shape Type:</span>
                    <span className="text-sm font-bold text-text-primary capitalize">
                      {polygonSides === 3
                        ? 'Equilateral Triangle'
                        : polygonSides === 4
                        ? 'Square'
                        : polygonSides === 5
                        ? 'Regular Pentagon'
                        : polygonSides === 6
                        ? 'Regular Hexagon'
                        : `${polygonSides}-sided Polygon`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Interior Angle:</span>
                    <span className="font-mono font-bold text-emerald-500">
                      {interiorAngle.toFixed(1)}°
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Lines of Symmetry:</span>
                    <span className="font-mono font-bold text-pink-500">{polygonSides} lines</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Calculated Perimeter:</span>
                    <span className="font-mono font-bold text-blue-500">
                      {perimeter.toFixed(1)} px
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Calculated Area:</span>
                    <span className="font-mono font-bold text-amber-500">
                      {area.toFixed(0)} px²
                    </span>
                  </div>
                </div>

                {/* Sides Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-text-primary">
                    <span>Number of Sides (n)</span>
                    <span className="font-mono text-emerald-500">{polygonSides}</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={polygonSides}
                    onChange={(e) => setPolygonSides(parseInt(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="symmToggle"
                    checked={showSymmetry}
                    onChange={(e) => setShowSymmetry(e.target.checked)}
                    className="rounded text-pink-500"
                  />
                  <label htmlFor="symmToggle" className="text-xs font-semibold text-text-primary cursor-pointer">
                    Show Lines of Symmetry (Pink dashed)
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 4. COORDINATE GRAPHER WORKSPACE */}
        {/* ========================================== */}
        {activeTab === 'grapher' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold font-display text-text-primary">
                Cartesian Coordinate Plane & Function Grapher
              </h2>
              <p className="text-xs text-text-muted">
                Observe how slope (m) and intercept (c) transform linear equations in real time
              </p>
            </div>

            {/* Formula Readout */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-canvas border border-border text-xl font-bold font-mono text-[#10B981] shadow-sm">
                y = {slopeM}x {interceptC >= 0 ? `+ ${interceptC}` : `− ${Math.abs(interceptC)}`}
              </div>
            </div>

            {/* Cartesian Canvas */}
            <div className="w-full overflow-x-auto p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
              <svg viewBox="-200 -200 400 400" className="w-[380px] h-[380px]">
                {/* Grid Lines */}
                {Array.from({ length: 9 }).map((_, i) => {
                  const coord = (i - 4) * 40;
                  return (
                    <g key={i}>
                      <line x1={coord} y1="-180" x2={coord} y2="180" stroke="#334155" strokeWidth="1" />
                      <line x1="-180" y1={coord} x2="180" y2={coord} stroke="#334155" strokeWidth="1" />
                    </g>
                  );
                })}

                {/* X and Y Axes */}
                <line x1="-190" y1="0" x2="190" y2="0" stroke="#94A3B8" strokeWidth="2" />
                <line x1="0" y1="-190" x2="0" y2="190" stroke="#94A3B8" strokeWidth="2" />
                <text x="180" y="-8" fill="#94A3B8" fontSize="11" fontWeight="bold">X</text>
                <text x="8" y="-180" fill="#94A3B8" fontSize="11" fontWeight="bold">Y</text>

                {/* Linear Function Line: y = mx + c. In SVG, Y is inverted so svgY = -(y * 40) */}
                {(() => {
                  const x1 = -4.5;
                  const y1 = slopeM * x1 + interceptC;
                  const x2 = 4.5;
                  const y2 = slopeM * x2 + interceptC;

                  const svgX1 = x1 * 40;
                  const svgY1 = -y1 * 40;
                  const svgX2 = x2 * 40;
                  const svgY2 = -y2 * 40;

                  return (
                    <line
                      x1={svgX1}
                      y1={svgY1}
                      x2={svgX2}
                      y2={svgY2}
                      stroke="#10B981"
                      strokeWidth="3.5"
                    />
                  );
                })()}

                {/* Y-Intercept Dot */}
                <circle cx="0" cy={-interceptC * 40} r="5" fill="#3B82F6" />
              </svg>
            </div>

            {/* Sliders for m and c */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5 p-4 rounded-2xl bg-canvas border border-border">
                <div className="flex justify-between text-xs font-semibold text-text-primary">
                  <span>Slope (m) - Rate of Change</span>
                  <span className="font-mono text-emerald-500">{slopeM}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.5"
                  value={slopeM}
                  onChange={(e) => setSlopeM(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-canvas border border-border">
                <div className="flex justify-between text-xs font-semibold text-text-primary">
                  <span>Y-Intercept (c) - Origin Offset</span>
                  <span className="font-mono text-blue-500">{interceptC}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.5"
                  value={interceptC}
                  onChange={(e) => setInterceptC(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathVisualizerPage;
