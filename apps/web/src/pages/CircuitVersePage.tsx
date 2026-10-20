import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Save,
  FolderOpen,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Zap,
  Sliders,
  HelpCircle,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Trash2,
  Cpu,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';

// Component Categories
type ComponentCategory = 'All' | 'Sources' | 'Passive' | 'Active' | 'Logic' | 'Measurement';

export interface CircuitComponentDefinition {
  type: string;
  name: string;
  category: 'Sources' | 'Passive' | 'Active' | 'Logic' | 'Measurement';
  symbol: string;
  defaultValue: string;
  defaultUnit: string;
  terminals: { id: string; x: number; y: number; name: string }[];
  description: string;
}

export interface PlacedComponent {
  id: string;
  type: string;
  name: string;
  value: number;
  unit: string;
  x: number;
  y: number;
  rotation: number;
  state?: boolean | number;
}

export interface WireConnection {
  id: string;
  fromComponentId: string;
  fromTerminalId: string;
  toComponentId: string;
  toTerminalId: string;
  color?: string;
}

export interface GuidedExperiment {
  id: string;
  title: string;
  grade: string;
  category: string;
  summary: string;
  formula: string;
  theory: string;
  falstadUrlParams?: string;
  steps: string[];
  componentsNeeded: string[];
  initialCircuit: {
    components: PlacedComponent[];
    wires: WireConnection[];
  };
}

// 10 Comprehensive Guided Experiments
export const GUIDED_EXPERIMENTS: GuidedExperiment[] = [
  {
    id: 'exp-1',
    title: "1. Ohm's Law Verification",
    grade: 'Class 9-10',
    category: 'Foundations',
    summary: 'Verify that current (I) is directly proportional to voltage (V) for a constant resistance (R).',
    formula: 'V = I × R   ⇒   I = V / R',
    theory:
      "Ohm's Law states that the current flowing through a metallic conductor between two points is directly proportional to the voltage across the two points, provided physical conditions (temperature) remain unchanged. The constant of proportionality is Resistance (R).",
    falstadUrlParams: 'ctz=CQAgjCAMB0l3BWcMBMcUHYMGZIA4UA2ATmIxAUgpABZsBOTAWhyzFh100e4708A7AMzYyQgG4h8jKChAAzAIYAnALqU482gBccy6F1oBfFkW5mQAHqogqAJyL3qY4WcggpY2bICmAB4A9iAQvFCA9p6Q3mYg1F6e9O4o0bEBdDF6XABO-jA+bN5R9AAeHghE6eE5iFkK3rmW6XgJ6e79uXgg2Xm5qfhpqW19+iV+6e0j-bmd4UjD9l4Z432VdAAOMFh4622uI2Mh7jAA5gAupxD1W1j5Z72n4f47r0e7V7e9185Y72+oP6W3nfg2e2W9V7d3w+7y+37V39-Y3g2n9A/qO+h2A/a',
    steps: [
      'Connect a 9V DC battery to a 1000Ω (1kΩ) fixed resistor.',
      'Place a digital ammeter in series to measure the current.',
      'Vary the supply voltage from 1V to 9V and record the current (I). Notice I = V/1000.',
      'Plot V vs I: The straight slope gives Resistance R = ΔV / ΔI.',
    ],
    componentsNeeded: ['DC Power Supply (9V)', 'Resistor (1kΩ)', 'Ammeter', 'Ground'],
    initialCircuit: {
      components: [
        { id: 'c1', type: 'dc_source', name: 'DC Supply', value: 9, unit: 'V', x: 120, y: 160, rotation: 0 },
        { id: 'c2', type: 'resistor', name: 'R1', value: 1000, unit: 'Ω', x: 280, y: 100, rotation: 0 },
        { id: 'c3', type: 'ammeter', name: 'A1', value: 0, unit: 'mA', x: 420, y: 160, rotation: 0 },
        { id: 'c4', type: 'ground', name: 'GND', value: 0, unit: 'V', x: 280, y: 260, rotation: 0 },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'c1', fromTerminalId: 'pos', toComponentId: 'c2', toTerminalId: 't1' },
        { id: 'w2', fromComponentId: 'c2', fromTerminalId: 't2', toComponentId: 'c3', toTerminalId: 'in' },
        { id: 'w3', fromComponentId: 'c3', fromTerminalId: 'out', toComponentId: 'c4', toTerminalId: 'g' },
        { id: 'w4', fromComponentId: 'c1', fromTerminalId: 'neg', toComponentId: 'c4', toTerminalId: 'g' },
      ],
    },
  },
  {
    id: 'exp-2',
    title: '2. LED Current Limiting Circuit',
    grade: 'Class 9-10',
    category: 'Optoelectronics',
    summary: 'Calculate ballast resistor to prevent an LED from burning out when powered by a 9V supply.',
    formula: 'R_ballast = (V_source - V_forward) / I_forward',
    theory:
      'LEDs are non-linear diodes with a fixed forward voltage drop (typically 2.0V for Red). Without a current-limiting resistor, excessive current (>30mA) will destroy the PN junction due to thermal breakdown.',
    falstadUrlParams: 'ctz=CQAgjCAMB0l3BWcMBMcUHYMGZIA4UA2ATmIxAUgpABZsBOTAWhyzFh100e4708A7AMzYyQgG4h8jKChAAzAIYAnALqU482gBccy6F1oBfFkW5mQAHqogqAJyL3qY4WcggpY2bICmAB4A9iAQvFCA9p6Q3mYg1F6e9O4o0bEBdDF6XABO-jA+bN5R9AAeHghE6eE5iFkK3rmW6XgJ6e79uXgg2Xm5qfhpqW19+iV+6e0j-bmd4UjD9l4Z432VdAAOMFh4622uI2Mh7jAA5gAupxD1W1j5Z72n4f47r0e7V7e9185Y72+oP6W3nfg2e2W9V7d3w+7y+37V39-Y3g2n9A/qO+h2A/a',
    steps: [
      'Take a 9V DC source and a red LED (Vf = 2.0V, rated current If = 20mA = 0.02A).',
      'Calculate R = (9V - 2V) / 0.02A = 7V / 0.02A = 350Ω. Use nearest standard 390Ω or 330Ω.',
      'Observe the bright glow of the LED and safe current of ~18mA.',
    ],
    componentsNeeded: ['9V Battery', '330Ω Resistor', 'Red LED', 'Switch'],
    initialCircuit: {
      components: [
        { id: 'c1', type: 'dc_source', name: '9V Battery', value: 9, unit: 'V', x: 100, y: 160, rotation: 0 },
        { id: 'c2', type: 'switch', name: 'SW1', value: 1, unit: 'ON', x: 220, y: 100, rotation: 0, state: 1 },
        { id: 'c3', type: 'resistor', name: 'R_lim', value: 330, unit: 'Ω', x: 340, y: 100, rotation: 0 },
        { id: 'c4', type: 'led', name: 'Red LED', value: 2.0, unit: 'Vf', x: 460, y: 160, rotation: 0, state: 1 },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'c1', fromTerminalId: 'pos', toComponentId: 'c2', toTerminalId: 't1' },
        { id: 'w2', fromComponentId: 'c2', fromTerminalId: 't2', toComponentId: 'c3', toTerminalId: 't1' },
        { id: 'w3', fromComponentId: 'c3', fromTerminalId: 't2', toComponentId: 'c4', toTerminalId: 'anode' },
        { id: 'w4', fromComponentId: 'c4', fromTerminalId: 'cathode', toComponentId: 'c1', toTerminalId: 'neg' },
      ],
    },
  },
  {
    id: 'exp-3',
    title: '3. Series & Parallel Resistors',
    grade: 'Class 10',
    category: 'Foundations',
    summary: 'Compare equivalent resistance, voltage drops, and branch currents in series vs parallel.',
    formula: 'Series: Req = R1 + R2  |  Parallel: 1/Req = 1/R1 + 1/R2',
    theory:
      'In a series circuit, current is identical through all components, while total voltage divides (Kirchhoff’s Voltage Law). In a parallel circuit, voltage across all branches is identical, while current divides (Kirchhoff’s Current Law).',
    steps: [
      'Series: Connect two 1kΩ resistors end-to-end. Notice Req = 2kΩ; voltage splits evenly 4.5V each.',
      'Parallel: Connect two 1kΩ resistors side-by-side. Notice Req = 500Ω; total current doubles.',
      'Toggle the parallel branch switch to see total current jump from 4.5mA to 9mA.',
    ],
    componentsNeeded: ['9V DC Source', 'R1 (1kΩ)', 'R2 (1kΩ)', 'Voltmeter'],
    initialCircuit: {
      components: [
        { id: 'c1', type: 'dc_source', name: '9V DC', value: 9, unit: 'V', x: 100, y: 160, rotation: 0 },
        { id: 'c2', type: 'resistor', name: 'R1', value: 1000, unit: 'Ω', x: 250, y: 100, rotation: 0 },
        { id: 'c3', type: 'resistor', name: 'R2', value: 1000, unit: 'Ω', x: 390, y: 100, rotation: 0 },
        { id: 'c4', type: 'ground', name: 'GND', value: 0, unit: 'V', x: 250, y: 240, rotation: 0 },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'c1', fromTerminalId: 'pos', toComponentId: 'c2', toTerminalId: 't1' },
        { id: 'w2', fromComponentId: 'c2', fromTerminalId: 't2', toComponentId: 'c3', toTerminalId: 't1' },
        { id: 'w3', fromComponentId: 'c3', fromTerminalId: 't2', toComponentId: 'c1', toTerminalId: 'neg' },
      ],
    },
  },
  {
    id: 'exp-4',
    title: '4. Voltage Divider Rule',
    grade: 'Class 10-11',
    category: 'Analog Circuits',
    summary: 'Design a reference voltage tap for sensors and microcontrollers using two resistors.',
    formula: 'V_out = V_in × [ R2 / (R1 + R2) ]',
    theory:
      'A voltage divider produces an output voltage that is a fraction of its input voltage. It is the fundamental building block for potentiometers, volume controls, light-dependent resistors (LDRs), and thermistors.',
    steps: [
      'Connect R1 (10kΩ) and R2 (10kΩ) across a 10V supply.',
      'Measure output across R2: Exactly 5V (half of 10V).',
      'Change R2 to 30kΩ: V_out becomes 10 × 30 / 40 = 7.5V.',
    ],
    componentsNeeded: ['10V DC Supply', 'R1 (10kΩ)', 'R2 (10kΩ)', 'Voltmeter Probe'],
    initialCircuit: {
      components: [
        { id: 'c1', type: 'dc_source', name: '10V Supply', value: 10, unit: 'V', x: 120, y: 160, rotation: 0 },
        { id: 'c2', type: 'resistor', name: 'R1 (Top)', value: 10000, unit: 'Ω', x: 260, y: 110, rotation: 0 },
        { id: 'c3', type: 'resistor', name: 'R2 (Bottom)', value: 10000, unit: 'Ω', x: 260, y: 200, rotation: 0 },
        { id: 'c4', type: 'voltmeter', name: 'V_out Meter', value: 5.0, unit: 'V', x: 400, y: 160, rotation: 0 },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'c1', fromTerminalId: 'pos', toComponentId: 'c2', toTerminalId: 't1' },
        { id: 'w2', fromComponentId: 'c2', fromTerminalId: 't2', toComponentId: 'c3', toTerminalId: 't1' },
        { id: 'w3', fromComponentId: 'c3', fromTerminalId: 't2', toComponentId: 'c1', toTerminalId: 'neg' },
        { id: 'w4', fromComponentId: 'c2', fromTerminalId: 't2', toComponentId: 'c4', toTerminalId: 'in' },
      ],
    },
  },
  {
    id: 'exp-5',
    title: '5. RC Low-Pass Filter',
    grade: 'Class 11-12',
    category: 'AC Circuits',
    summary: 'Observe capacitor exponential charging and high frequency signal attenuation.',
    formula: 'fc = 1 / (2 × π × R × C)  |  τ = R × C',
    theory:
      'The time constant τ = RC defines how quickly the capacitor voltage reaches 63.2% of its maximum value. At frequencies above fc, capacitive reactance Xc decreases, shunting alternating signals to ground.',
    steps: [
      'Connect a 1kΩ resistor and a 10µF capacitor in series.',
      'Time constant τ = 1000Ω × 0.000010F = 0.01s (10 milliseconds).',
      'Switch the DC input and observe the smooth charging curve on the oscilloscope graph.',
    ],
    componentsNeeded: ['AC / Pulse Source', 'Resistor (1kΩ)', 'Capacitor (10µF)', 'Oscilloscope'],
    initialCircuit: {
      components: [
        { id: 'c1', type: 'ac_source', name: '1kHz Signal', value: 5, unit: 'V', x: 100, y: 160, rotation: 0 },
        { id: 'c2', type: 'resistor', name: 'R_filter', value: 1000, unit: 'Ω', x: 250, y: 100, rotation: 0 },
        { id: 'c3', type: 'capacitor', name: 'C_filter', value: 10, unit: 'µF', x: 380, y: 160, rotation: 0 },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'c1', fromTerminalId: 'pos', toComponentId: 'c2', toTerminalId: 't1' },
        { id: 'w2', fromComponentId: 'c2', fromTerminalId: 't2', toComponentId: 'c3', toTerminalId: 'pos' },
        { id: 'w3', fromComponentId: 'c3', fromTerminalId: 'neg', toComponentId: 'c1', toTerminalId: 'neg' },
      ],
    },
  },
  {
    id: 'exp-6',
    title: '6. NPN Transistor as a Switch',
    grade: 'Class 12',
    category: 'Semiconductors',
    summary: 'Use a tiny base current to switch a heavy collector load (lamp/motor) ON and OFF.',
    formula: 'I_collector = β × I_base  (in active region)',
    theory:
      'A bipolar junction transistor (BJT) operates as an electronic switch. When base-emitter voltage Vbe exceeds ~0.7V, base current flows, causing the transistor to saturate into a closed switch with Vce ≈ 0.2V.',
    steps: [
      'Connect the emitter to ground and the collector to a 12V bulb via a collector resistor.',
      'Apply 0V to the base: Transistor is in Cut-off; bulb is dark.',
      'Apply 5V through a 10kΩ base resistor: Transistor saturates; bulb turns brightly ON.',
    ],
    componentsNeeded: ['NPN Transistor (2N2222)', '10kΩ Base Resistor', 'Lamp / LED', '5V / 12V Supply'],
    initialCircuit: {
      components: [
        { id: 'c1', type: 'npn_bjt', name: 'Q1 (2N2222)', value: 100, unit: 'hFE', x: 300, y: 170, rotation: 0 },
        { id: 'c2', type: 'resistor', name: 'Rb', value: 10000, unit: 'Ω', x: 170, y: 170, rotation: 0 },
        { id: 'c3', type: 'dc_source', name: 'V_base', value: 5, unit: 'V', x: 80, y: 170, rotation: 0 },
        { id: 'c4', type: 'led', name: 'Collector Load', value: 2.2, unit: 'V', x: 300, y: 70, rotation: 0 },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'c3', fromTerminalId: 'pos', toComponentId: 'c2', toTerminalId: 't1' },
        { id: 'w2', fromComponentId: 'c2', fromTerminalId: 't2', toComponentId: 'c1', toTerminalId: 'base' },
        { id: 'w3', fromComponentId: 'c4', fromTerminalId: 'cathode', toComponentId: 'c1', toTerminalId: 'collector' },
      ],
    },
  },
  {
    id: 'exp-7',
    title: '7. Full-Wave Bridge Rectifier',
    grade: 'Class 12',
    category: 'Power Electronics',
    summary: 'Convert bidirectional AC into smooth unidirectional DC using 4 PN junction diodes.',
    formula: 'V_peak_dc = V_peak_ac - 2 × V_diode (≈ 1.4V)',
    theory:
      'A diode bridge provides full-wave rectification from a two-wire AC input. During both halves of the AC cycle, two diodes conduct alternately, keeping current flowing in the same direction through the load.',
    steps: [
      'Apply 12V RMS 50Hz AC into the diamond bridge configuration.',
      'Observe pulsating DC across the output load resistor.',
      'Add a 100µF smoothing filter capacitor in parallel to eliminate ripple voltage.',
    ],
    componentsNeeded: ['AC Voltage Source (12V)', '4× 1N4007 Diodes', 'Filter Capacitor (100µF)', 'Load Resistor'],
    initialCircuit: {
      components: [
        { id: 'c1', type: 'ac_source', name: '12V AC 50Hz', value: 12, unit: 'V', x: 100, y: 160, rotation: 0 },
        { id: 'c2', type: 'diode', name: 'D1', value: 0.7, unit: 'V', x: 240, y: 110, rotation: 0 },
        { id: 'c3', type: 'diode', name: 'D2', value: 0.7, unit: 'V', x: 320, y: 110, rotation: 0 },
        { id: 'c4', type: 'resistor', name: 'R_load', value: 1000, unit: 'Ω', x: 420, y: 160, rotation: 0 },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'c1', fromTerminalId: 'pos', toComponentId: 'c2', toTerminalId: 'anode' },
        { id: 'w2', fromComponentId: 'c2', fromTerminalId: 'cathode', toComponentId: 'c4', toTerminalId: 't1' },
      ],
    },
  },
  {
    id: 'exp-8',
    title: '8. Logic Gates: NAND / NOR Universal Gates',
    grade: 'Class 11-12',
    category: 'Digital Electronics',
    summary: 'Verify truth tables and prove that NAND and NOR can synthesize any Boolean function.',
    formula: 'NAND: Y = NOT(A AND B) = (A · B)‾',
    theory:
      'NAND is a universal gate because combinations of NAND gates can recreate NOT, AND, OR, and XOR functions. The output is LOW only when all inputs are HIGH.',
    steps: [
      'Toggle Input A and Input B switches between 0 (LOW) and 1 (HIGH).',
      'Record the logic output on the digital LED probe.',
      'Confirm: 0-0 => 1, 0-1 => 1, 1-0 => 1, 1-1 => 0.',
    ],
    componentsNeeded: ['Logic High (5V)', '2× Toggle Switches', 'NAND Gate IC', 'Logic Probe LED'],
    initialCircuit: {
      components: [
        { id: 'c1', type: 'switch', name: 'Input A', value: 1, unit: 'bit', x: 120, y: 120, rotation: 0, state: 0 },
        { id: 'c2', type: 'switch', name: 'Input B', value: 1, unit: 'bit', x: 120, y: 200, rotation: 0, state: 1 },
        { id: 'c3', type: 'nand_gate', name: '7400 NAND', value: 0, unit: '', x: 280, y: 160, rotation: 0 },
        { id: 'c4', type: 'led', name: 'Output LED', value: 2.0, unit: 'V', x: 420, y: 160, rotation: 0, state: 1 },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'c1', fromTerminalId: 't2', toComponentId: 'c3', toTerminalId: 'in1' },
        { id: 'w2', fromComponentId: 'c2', fromTerminalId: 't2', toComponentId: 'c3', toTerminalId: 'in2' },
        { id: 'w3', fromComponentId: 'c3', fromTerminalId: 'out', toComponentId: 'c4', toTerminalId: 'anode' },
      ],
    },
  },
  {
    id: 'exp-9',
    title: '9. 555 Timer in Astable Multivibrator Mode',
    grade: 'Class 12',
    category: 'Integrated Circuits',
    summary: 'Generate square wave clock pulses and LED blinkers with the legendary NE555 timer.',
    formula: 'f = 1.44 / [ (R1 + 2×R2) × C ]   |   Duty Cycle = (R1 + R2) / (R1 + 2×R2)',
    theory:
      'In astable mode, the 555 timer oscillates continuously between HIGH and LOW states without external triggering. The capacitor charges through R1+R2 and discharges through R2 alone into pin 7.',
    steps: [
      'Configure R1 = 10kΩ, R2 = 47kΩ, and C1 = 10µF.',
      'Oscillation frequency f = 1.44 / (104,000 × 0.000010) ≈ 1.38 Hz (blinks ~1.4 times per second).',
      'Change C1 to 1µF to watch the pulse rate speed up 10×!',
    ],
    componentsNeeded: ['NE555 Timer IC', 'R1 (10kΩ)', 'R2 (47kΩ)', 'Timing Capacitor (10µF)', 'Output Indicator'],
    initialCircuit: {
      components: [
        { id: 'c1', type: 'dc_source', name: 'Vcc 9V', value: 9, unit: 'V', x: 100, y: 160, rotation: 0 },
        { id: 'c2', type: 'ic_555', name: 'NE555 Timer', value: 555, unit: 'IC', x: 280, y: 160, rotation: 0 },
        { id: 'c3', type: 'led', name: 'Flashing LED', value: 2.0, unit: 'V', x: 440, y: 160, rotation: 0, state: 1 },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'c1', fromTerminalId: 'pos', toComponentId: 'c2', toTerminalId: 'vcc' },
        { id: 'w2', fromComponentId: 'c2', fromTerminalId: 'out', toComponentId: 'c3', toTerminalId: 'anode' },
      ],
    },
  },
  {
    id: 'exp-10',
    title: '10. Wheatstone Bridge for Precision Resistance',
    grade: 'Class 12',
    category: 'Bridge Networks',
    summary: 'Measure unknown resistance with laboratory precision using the null-deflection balance condition.',
    formula: 'Balanced Condition: R1 / R2 = R3 / Rx   ⇒   Rx = R3 × (R2 / R1)',
    theory:
      'The Wheatstone bridge consists of four resistive arms. When the ratio of resistances in the two legs is equal, the potential difference between the midpoints is zero, and no current passes through the central galvanometer.',
    steps: [
      'Set ratio arms R1 = 100Ω and R2 = 100Ω.',
      'Adjust variable decade resistance R3 until galvanometer deflection drops to exactly 0.000 V.',
      'Read unknown Rx = R3: High precision immune to power supply fluctuations.',
    ],
    componentsNeeded: ['DC Supply (5V)', 'Ratio Resistors R1, R2', 'Precision Potentiometer R3', 'Galvanometer'],
    initialCircuit: {
      components: [
        { id: 'c1', type: 'dc_source', name: '5V Supply', value: 5, unit: 'V', x: 80, y: 160, rotation: 0 },
        { id: 'c2', type: 'resistor', name: 'R1 (100Ω)', value: 100, unit: 'Ω', x: 220, y: 90, rotation: 0 },
        { id: 'c3', type: 'resistor', name: 'R2 (100Ω)', value: 100, unit: 'Ω', x: 340, y: 90, rotation: 0 },
        { id: 'c4', type: 'resistor', name: 'R3 (Variable)', value: 470, unit: 'Ω', x: 220, y: 220, rotation: 0 },
        { id: 'c5', type: 'resistor', name: 'Rx (Unknown)', value: 470, unit: 'Ω', x: 340, y: 220, rotation: 0 },
        { id: 'c6', type: 'voltmeter', name: 'Galvanometer', value: 0.0, unit: 'mV', x: 280, y: 155, rotation: 0 },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'c1', fromTerminalId: 'pos', toComponentId: 'c2', toTerminalId: 't1' },
        { id: 'w2', fromComponentId: 'c2', fromTerminalId: 't2', toComponentId: 'c3', toTerminalId: 't1' },
        { id: 'w3', fromComponentId: 'c2', fromTerminalId: 't2', toComponentId: 'c6', toTerminalId: 'in' },
        { id: 'w4', fromComponentId: 'c4', fromTerminalId: 't2', toComponentId: 'c6', toTerminalId: 'out' },
      ],
    },
  },
];

// Palette Component Definitions
const COMPONENT_PALETTE: CircuitComponentDefinition[] = [
  // Sources
  {
    type: 'dc_source',
    name: 'DC Voltage Source',
    category: 'Sources',
    symbol: '⎓',
    defaultValue: '9',
    defaultUnit: 'V',
    terminals: [
      { id: 'pos', x: 0, y: -25, name: '+' },
      { id: 'neg', x: 0, y: 25, name: '-' },
    ],
    description: 'Steady constant direct current potential (batteries, DC power packs).',
  },
  {
    type: 'ac_source',
    name: 'AC Voltage Source',
    category: 'Sources',
    symbol: '∿',
    defaultValue: '5',
    defaultUnit: 'V',
    terminals: [
      { id: 'pos', x: 0, y: -25, name: '~' },
      { id: 'neg', x: 0, y: 25, name: '~' },
    ],
    description: 'Sinusoidal alternating voltage supply with configurable frequency.',
  },
  {
    type: 'ground',
    name: 'Ground (0V Reference)',
    category: 'Sources',
    symbol: '⏚',
    defaultValue: '0',
    defaultUnit: 'V',
    terminals: [{ id: 'g', x: 0, y: -15, name: 'GND' }],
    description: 'Common zero-volt electrical reference potential for the circuit.',
  },

  // Passive
  {
    type: 'resistor',
    name: 'Resistor',
    category: 'Passive',
    symbol: '∿∿',
    defaultValue: '1000',
    defaultUnit: 'Ω',
    terminals: [
      { id: 't1', x: -30, y: 0, name: '1' },
      { id: 't2', x: 30, y: 0, name: '2' },
    ],
    description: 'Opposes current flow and dissipates electrical energy as heat (P = I²R).',
  },
  {
    type: 'capacitor',
    name: 'Capacitor',
    category: 'Passive',
    symbol: '┫┣',
    defaultValue: '10',
    defaultUnit: 'µF',
    terminals: [
      { id: 'pos', x: -25, y: 0, name: '+' },
      { id: 'neg', x: 25, y: 0, name: '-' },
    ],
    description: 'Stores electrical energy electrostatically in an electric field.',
  },
  {
    type: 'inductor',
    name: 'Inductor',
    category: 'Passive',
    symbol: '⋒⋒',
    defaultValue: '10',
    defaultUnit: 'mH',
    terminals: [
      { id: 't1', x: -25, y: 0, name: '1' },
      { id: 't2', x: 25, y: 0, name: '2' },
    ],
    description: 'Stores energy in a magnetic field when electric current flows through it.',
  },
  {
    type: 'switch',
    name: 'SPST Switch',
    category: 'Passive',
    symbol: '—/ —',
    defaultValue: '1',
    defaultUnit: 'state',
    terminals: [
      { id: 't1', x: -25, y: 0, name: '1' },
      { id: 't2', x: 25, y: 0, name: '2' },
    ],
    description: 'Single-pole single-throw toggle switch to make or break current paths.',
  },

  // Active
  {
    type: 'led',
    name: 'Light Emitting Diode (LED)',
    category: 'Active',
    symbol: '▷|💡',
    defaultValue: '2.0',
    defaultUnit: 'Vf',
    terminals: [
      { id: 'anode', x: -25, y: 0, name: 'A (+)' },
      { id: 'cathode', x: 25, y: 0, name: 'K (-)' },
    ],
    description: 'Semiconductor diode emitting bright photon radiation when forward biased.',
  },
  {
    type: 'diode',
    name: 'PN Junction Diode',
    category: 'Active',
    symbol: '▷|',
    defaultValue: '0.7',
    defaultUnit: 'Vf',
    terminals: [
      { id: 'anode', x: -25, y: 0, name: 'A' },
      { id: 'cathode', x: 25, y: 0, name: 'K' },
    ],
    description: 'Permits electrical current to flow easily in one direction (rectification).',
  },
  {
    type: 'npn_bjt',
    name: 'NPN Transistor (2N2222)',
    category: 'Active',
    symbol: '⤹|⤸',
    defaultValue: '100',
    defaultUnit: 'β',
    terminals: [
      { id: 'base', x: -25, y: 0, name: 'B' },
      { id: 'collector', x: 15, y: -25, name: 'C' },
      { id: 'emitter', x: 15, y: 25, name: 'E' },
    ],
    description: 'Current amplifier and high-speed electronic switch.',
  },
  {
    type: 'ic_555',
    name: '555 Precision Timer IC',
    category: 'Active',
    symbol: '⏱ 555',
    defaultValue: '555',
    defaultUnit: 'IC',
    terminals: [
      { id: 'vcc', x: 0, y: -30, name: 'Vcc' },
      { id: 'out', x: 35, y: 0, name: 'OUT' },
      { id: 'gnd', x: 0, y: 30, name: 'GND' },
    ],
    description: 'Highly stable device for generating accurate time delays or oscillations.',
  },

  // Logic
  {
    type: 'nand_gate',
    name: 'NAND Logic Gate',
    category: 'Logic',
    symbol: '&̄',
    defaultValue: '2',
    defaultUnit: 'in',
    terminals: [
      { id: 'in1', x: -30, y: -12, name: 'A' },
      { id: 'in2', x: -30, y: 12, name: 'B' },
      { id: 'out', x: 30, y: 0, name: 'Y' },
    ],
    description: 'Universal digital gate outputting LOW only when both inputs are HIGH.',
  },
  {
    type: 'and_gate',
    name: 'AND Logic Gate',
    category: 'Logic',
    symbol: '&',
    defaultValue: '2',
    defaultUnit: 'in',
    terminals: [
      { id: 'in1', x: -30, y: -12, name: 'A' },
      { id: 'in2', x: -30, y: 12, name: 'B' },
      { id: 'out', x: 30, y: 0, name: 'Y' },
    ],
    description: 'Outputs digital HIGH (1) if and only if all inputs are HIGH (1).',
  },
  {
    type: 'or_gate',
    name: 'OR Logic Gate',
    category: 'Logic',
    symbol: '≥1',
    defaultValue: '2',
    defaultUnit: 'in',
    terminals: [
      { id: 'in1', x: -30, y: -12, name: 'A' },
      { id: 'in2', x: -30, y: 12, name: 'B' },
      { id: 'out', x: 30, y: 0, name: 'Y' },
    ],
    description: 'Outputs digital HIGH (1) if any of the inputs are HIGH (1).',
  },

  // Measurement
  {
    type: 'voltmeter',
    name: 'Digital Voltmeter',
    category: 'Measurement',
    symbol: 'Ⓥ',
    defaultValue: '0',
    defaultUnit: 'V',
    terminals: [
      { id: 'in', x: -25, y: 0, name: 'V+' },
      { id: 'out', x: 25, y: 0, name: 'COM' },
    ],
    description: 'Measures electrical potential difference across two nodes with high impedance.',
  },
  {
    type: 'ammeter',
    name: 'Digital Ammeter',
    category: 'Measurement',
    symbol: 'Ⓐ',
    defaultValue: '0',
    defaultUnit: 'mA',
    terminals: [
      { id: 'in', x: -25, y: 0, name: 'A+' },
      { id: 'out', x: 25, y: 0, name: 'A-' },
    ],
    description: 'Measures continuous electric current passing in series through the branch.',
  },
];

export const CircuitVersePage: React.FC = () => {
  // Simulator Mode: 'schematic' (interactive SVG canvas) or 'falstad' (embedded SPICE iframe)
  const [viewMode, setViewMode] = useState<'schematic' | 'falstad'>('schematic');

  // Toolbar & Project State
  const [projectName, setProjectName] = useState<string>("Experiment 1: Ohm's Law Verification");
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Palette State
  const [paletteSearch, setPaletteSearch] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('All');

  // Canvas Schematic State
  const [components, setComponents] = useState<PlacedComponent[]>(
    GUIDED_EXPERIMENTS[0].initialCircuit.components
  );
  const [wires, setWires] = useState<WireConnection[]>(
    GUIDED_EXPERIMENTS[0].initialCircuit.wires
  );
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('c2');
  const [wireStart, setWireStart] = useState<{ componentId: string; terminalId: string } | null>(null);

  // Undo / Redo stacks
  const [history, setHistory] = useState<{ components: PlacedComponent[]; wires: WireConnection[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ components: PlacedComponent[]; wires: WireConnection[] }[]>([]);

  // Guided Experiments
  const [activeExperiment, setActiveExperiment] = useState<GuidedExperiment>(GUIDED_EXPERIMENTS[0]);
  const [showExperimentModal, setShowExperimentModal] = useState<boolean>(false);
  const [showOhmCalculator, setShowOhmCalculator] = useState<boolean>(true);

  // Ohm's Law Calculator state
  const [calcVoltage, setCalcVoltage] = useState<number>(9);
  const [calcResistance, setCalcResistance] = useState<number>(1000);
  const [calcCurrent, setCalcCurrent] = useState<number>(0.009); // in Amperes

  // Falstad Iframe ref & URL
  const falstadIframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [falstadUrl, setFalstadUrl] = useState<string>(
    'https://www.falstad.com/circuit/circuitjs.html'
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Stores
  const { markCompleted } = useProgressStore();
  const { addXP } = useAuthStore();

  // Save current circuit state to history
  const pushHistory = (newComps: PlacedComponent[], newWires: WireConnection[]) => {
    setHistory((prev) => [...prev.slice(-15), { components, wires }]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack((prev) => [...prev, { components, wires }]);
    setComponents(last.components);
    setWires(last.wires);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, { components, wires }]);
    setComponents(next.components);
    setWires(next.wires);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  // Add component to canvas
  const handleAddComponent = (def: CircuitComponentDefinition) => {
    const newId = `c_${Date.now()}`;
    const newComp: PlacedComponent = {
      id: newId,
      type: def.type,
      name: `${def.name.split(' ')[0]} ${components.length + 1}`,
      value: parseFloat(def.defaultValue) || 0,
      unit: def.defaultUnit,
      x: 200 + (components.length % 5) * 60,
      y: 150 + (components.length % 4) * 40,
      rotation: 0,
      state: def.type === 'switch' ? 1 : 0,
    };
    pushHistory(components, wires);
    setComponents((prev) => [...prev, newComp]);
    setSelectedComponentId(newId);
  };

  // Delete selected component
  const handleDeleteSelected = () => {
    if (!selectedComponentId) return;
    pushHistory(components, wires);
    setComponents((prev) => prev.filter((c) => c.id !== selectedComponentId));
    setWires((prev) =>
      prev.filter(
        (w) => w.fromComponentId !== selectedComponentId && w.toComponentId !== selectedComponentId
      )
    );
    setSelectedComponentId(null);
  };

  // Terminal click for wiring
  const handleTerminalClick = (componentId: string, terminalId: string) => {
    if (!wireStart) {
      setWireStart({ componentId, terminalId });
    } else {
      // Complete wire connection
      if (wireStart.componentId !== componentId) {
        const wireId = `w_${Date.now()}`;
        const newWires = [
          ...wires,
          {
            id: wireId,
            fromComponentId: wireStart.componentId,
            fromTerminalId: wireStart.terminalId,
            toComponentId: componentId,
            toTerminalId: terminalId,
            color: '#38bdf8',
          },
        ];
        pushHistory(components, wires);
        setWires(newWires);
      }
      setWireStart(null);
    }
  };

  // Save Project to localStorage
  const handleSaveProject = () => {
    const projectData = {
      name: projectName,
      savedAt: new Date().toISOString(),
      components,
      wires,
      falstadUrl,
    };
    localStorage.setItem(`vidyaverse_circuit_${projectName}`, JSON.stringify(projectData));
    alert(`Project "${projectName}" saved successfully to browser storage!`);
  };

  // Load Guided Experiment
  const handleLoadExperiment = (exp: GuidedExperiment) => {
    setActiveExperiment(exp);
    setProjectName(exp.title);
    pushHistory(components, wires);
    setComponents(exp.initialCircuit.components);
    setWires(exp.initialCircuit.wires);
    setSelectedComponentId(exp.initialCircuit.components[1]?.id || null);

    if (exp.falstadUrlParams) {
      setFalstadUrl(`https://www.falstad.com/circuit/circuitjs.html?${exp.falstadUrlParams}`);
    }

    markCompleted('circuitverse', exp.id, 100);
    addXP(50);
  };

  // Filtered palette
  const filteredPalette = COMPONENT_PALETTE.filter((comp) => {
    const matchesCategory = activeCategory === 'All' || comp.category === activeCategory;
    const matchesSearch =
      comp.name.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      comp.description.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      comp.category.toLowerCase().includes(paletteSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Selected component
  const selectedComp = components.find((c) => c.id === selectedComponentId);

  // Real-time calculated telemetry for selected component
  const calculatedTelemetry = React.useMemo(() => {
    if (!selectedComp) return null;
    let voltage = 0;
    let current = 0;
    let power = 0;

    const sourceComp = components.find((c) => c.type === 'dc_source' || c.type === 'ac_source');
    const sourceV = sourceComp ? sourceComp.value : 9;

    if (selectedComp.type === 'resistor') {
      const r = selectedComp.value || 1;
      // In simple single-resistor or series loop:
      voltage = isSimulating ? sourceV : 0;
      current = voltage / r; // A
      power = voltage * current; // W
    } else if (selectedComp.type === 'dc_source') {
      voltage = selectedComp.value;
      current = 0.009;
      power = voltage * current;
    } else if (selectedComp.type === 'led') {
      voltage = selectedComp.value; // forward drop
      current = isSimulating ? 0.02 : 0;
      power = voltage * current;
    }

    return {
      voltage: voltage.toFixed(2),
      currentMa: (current * 1000).toFixed(2),
      powerMw: (power * 1000).toFixed(2),
    };
  }, [selectedComp, components, isSimulating]);

  // Handle Ohm's calculator auto-compute
  const handleOhmCalcChange = (param: 'V' | 'R' | 'I', val: number) => {
    if (param === 'V') {
      setCalcVoltage(val);
      if (calcResistance > 0) setCalcCurrent(val / calcResistance);
    } else if (param === 'R') {
      setCalcResistance(val);
      if (val > 0) setCalcCurrent(calcVoltage / val);
    } else if (param === 'I') {
      setCalcCurrent(val);
      if (calcResistance > 0) setCalcVoltage(val * calcResistance);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full w-full bg-card text-text-primary font-sans overflow-hidden select-none ${
        viewMode === 'falstad' ? 'rounded-none border-0' : 'rounded-2xl border border-border shadow-soft'
      }`}
    >
      {/* 1. TOP WORKSTATION TOOLBAR */}
      <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="p-1.5 rounded-lg bg-[#DDF8EE] text-[#19B99A] dark:bg-[#0D2E26]">
              <Zap className="w-4 h-4" />
            </span>
            <span className="font-semibold text-text-primary hidden sm:inline">Circuit Workbench</span>
            <span className="hidden sm:inline">/</span>
          </div>

          {/* Editable Project Name */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-canvas border border-border hover:border-[#19B99A]/50 focus:border-[#19B99A] rounded-lg px-2.5 py-1 text-xs text-text-primary focus:outline-none transition-colors w-40 sm:w-60 font-semibold"
              title="Click to rename circuit project"
            />
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-canvas p-0.5 rounded-xl border border-border">
          <button
            onClick={() => setViewMode('schematic')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'schematic'
                ? 'bg-[#19B99A] text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Schematic
          </button>
          <button
            onClick={() => setViewMode('falstad')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'falstad'
                ? 'bg-[#19B99A] text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            SPICE Solver
          </button>
        </div>

        {/* Simulation Action Controls */}
        {viewMode === 'falstad' ? (
          <div className="flex items-center gap-2">
            {/* Experiment Guide Modal Button */}
            <button
              onClick={() => setShowExperimentModal(true)}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#DDF8EE] text-[#19B99A] dark:bg-[#0D2E26] hover:opacity-90 font-semibold border border-[#19B99A]/20 flex items-center gap-1.5 shadow-sm"
              title="Select one of 10 Pre-built Experiments"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>10 Labs</span>
            </button>

            {/* Open in New Tab */}
            <a
              href={falstadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-xs rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 font-semibold"
              title="Open Falstad simulator in a new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </a>

            {/* True Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1 text-xs rounded-lg bg-[#19B99A] hover:bg-[#159F84] text-white font-semibold flex items-center gap-1.5 shadow-sm shadow-[#19B99A]/25 transition-all"
              title={isFullscreen ? 'Exit Full Screen' : 'Expand Falstad to 100% Full Screen'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isFullscreen ? 'Exit Full' : 'Full Screen'}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Run / Pause */}
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
                isSimulating
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                  : 'bg-[#19B99A] hover:bg-[#159F84] text-white shadow-sm shadow-[#19B99A]/25'
              }`}
              title={isSimulating ? 'Pause Circuit Simulation' : 'Run Live SPICE Simulation'}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="hidden sm:inline">{isSimulating ? 'Pause' : 'Simulate'}</span>
            </button>

            {/* Reset */}
            <button
              onClick={() => {
                setIsSimulating(false);
                setTimeout(() => setIsSimulating(true), 200);
              }}
              className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Reset Simulation State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

            {/* Undo / Redo */}
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-30 hidden sm:block"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-30 hidden sm:block"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            {/* Zoom controls for canvas */}
            <div className="hidden md:flex items-center bg-canvas rounded-lg p-0.5 border border-border">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                className="p-1 hover:text-text-primary text-text-muted"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1.5 text-text-muted">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.1))}
                className="p-1 hover:text-text-primary text-text-muted"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-border mx-0.5" />

            {/* Save Project */}
            <button
              onClick={handleSaveProject}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5"
              title="Save circuit to LocalStorage"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>

            {/* Experiment Guide Modal Button */}
            <button
              onClick={() => setShowExperimentModal(true)}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#DDF8EE] text-[#19B99A] dark:bg-[#0D2E26] hover:opacity-90 font-semibold border border-[#19B99A]/20 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>10 Labs</span>
            </button>
          </div>
        )}
      </header>

      {/* 2. MAIN 3-PANEL WORKBENCH */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT PANEL: SEARCHABLE COMPONENT PALETTE (Hidden in Falstad mode) */}
        {viewMode !== 'falstad' && (
          <aside className="w-64 border-r border-border bg-card flex flex-col z-10 text-text-primary shrink-0">
            <div className="p-3 border-b border-border space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  className="w-full bg-canvas border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[#19B99A]"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1">
                {(['All', 'Sources', 'Passive', 'Active', 'Logic', 'Measurement'] as ComponentCategory[]).map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                        activeCategory === cat
                          ? 'bg-[#19B99A] text-white shadow-sm'
                          : 'bg-canvas text-text-muted hover:text-text-primary border border-border'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Component List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              <div className="text-[10px] font-bold tracking-wider text-text-muted uppercase px-2 py-1">
                Click to Place on Workbench ({filteredPalette.length})
              </div>

              {filteredPalette.map((item) => (
                <div
                  key={item.type}
                  onClick={() => handleAddComponent(item)}
                  className="group flex items-center justify-between p-2 rounded-xl bg-canvas hover:bg-[#DDF8EE]/40 dark:hover:bg-[#0D2E26]/40 border border-border hover:border-[#19B99A] cursor-pointer transition-all"
                  title={`${item.name}: ${item.description}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center font-mono text-[#19B99A] text-sm border border-border group-hover:border-[#19B99A]/50 transition-colors shadow-sm">
                      {item.symbol}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-text-primary group-hover:text-[#19B99A] truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        Default: {item.defaultValue} {item.defaultUnit}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-text-muted group-hover:text-[#19B99A] font-mono shadow-sm">
                    + Add
                  </span>
                </div>
              ))}
            </div>

            {/* Guided Lab Quick Selector */}
            <div className="p-3 border-t border-border bg-canvas/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-[#19B99A]">Current Experiment:</span>
                <span className="text-[10px] text-text-muted font-medium">{activeExperiment.grade}</span>
              </div>
              <div className="text-xs font-semibold text-text-primary truncate">{activeExperiment.title}</div>
              <div className="text-[10px] text-text-muted font-mono mt-0.5">{activeExperiment.formula}</div>
            </div>
          </aside>
        )}

        {/* CENTER PANEL: WORKBENCH (SCHEMATIC SVG OR FALSTAD IFRAME) */}
        <main className="flex-1 flex flex-col relative bg-canvas overflow-hidden">
          {viewMode === 'falstad' ? (
            /* FALSTAD CIRCUITJS1 IFRAME VIEW - 100% FULL BLEED, ZERO CLUTTER */
            <iframe
              ref={falstadIframeRef}
              src={falstadUrl}
              title="Falstad Circuit Simulator"
              className="w-full h-full flex-1 border-none bg-black"
              allow="fullscreen"
            />
          ) : (
            /* INTERACTIVE SVG WORKBENCH */
            <div className="flex-1 relative overflow-hidden bg-[#FAFAFC] dark:bg-[#0E0E17] cursor-crosshair">
              {/* Fine Snap-Grid Background Pattern */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1" className="fill-slate-300 dark:fill-slate-800" />
                  </pattern>
                  <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#smallGrid)" />
                    <path d="M 100 0 L 0 0 0 100" fill="none" className="stroke-slate-200 dark:stroke-slate-800/80" strokeWidth="0.75" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Wiring Mode Notification Banner */}
              {wireStart && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/95 text-[#19B99A] px-4 py-1.5 rounded-full border border-[#19B99A]/40 text-xs shadow-soft flex items-center gap-2 z-30 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-[#19B99A] animate-ping" />
                  <span className="font-medium">Wiring Mode Active: Click a second component terminal to complete wire</span>
                  <button
                    onClick={() => setWireStart(null)}
                    className="ml-2 underline text-[11px] text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Interactive Zoomable Schematic Canvas */}
              <div
                className="w-full h-full relative origin-top-left transition-transform duration-75"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* Wires Overlay SVG */}
                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                  {wires.map((wire) => {
                    const fromComp = components.find((c) => c.id === wire.fromComponentId);
                    const toComp = components.find((c) => c.id === wire.toComponentId);
                    if (!fromComp || !toComp) return null;

                    const fromDef = COMPONENT_PALETTE.find((cp) => cp.type === fromComp.type);
                    const toDef = COMPONENT_PALETTE.find((cp) => cp.type === toComp.type);

                    const fromTerm = fromDef?.terminals.find((t) => t.id === wire.fromTerminalId) || { x: 0, y: 0 };
                    const toTerm = toDef?.terminals.find((t) => t.id === wire.toTerminalId) || { x: 0, y: 0 };

                    const x1 = fromComp.x + fromTerm.x;
                    const y1 = fromComp.y + fromTerm.y;
                    const x2 = toComp.x + toTerm.x;
                    const y2 = toComp.y + toTerm.y;

                    // Orthogonal elbow route
                    const midX = (x1 + x2) / 2;
                    const pathD = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

                    return (
                      <g key={wire.id}>
                        {/* Glow halo */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={isSimulating ? '#22c55e' : '#38bdf8'}
                          strokeWidth="4"
                          strokeOpacity="0.2"
                        />
                        {/* Core wire */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={isSimulating ? '#4ade80' : '#38bdf8'}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Current Flow Electrons Animation */}
                        {isSimulating && (
                          <circle r="3" fill="#ffffff">
                            <animateMotion path={pathD} dur="2s" repeatCount="indefinite" />
                          </circle>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Placed Components */}
                {components.map((comp) => {
                  const def = COMPONENT_PALETTE.find((cp) => cp.type === comp.type);
                  const isSelected = selectedComponentId === comp.id;

                  return (
                    <div
                      key={comp.id}
                      onClick={() => setSelectedComponentId(comp.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-move p-2.5 rounded-xl transition-all select-none ${
                        isSelected
                          ? 'ring-2 ring-[#19B99A] bg-card shadow-card-hover border-[#19B99A]'
                          : 'bg-card hover:border-[#19B99A]/50 shadow-soft'
                      } border border-border`}
                      style={{
                        left: `${comp.x}px`,
                        top: `${comp.y}px`,
                      }}
                    >
                      {/* Component Header / Symbol */}
                      <div className="flex flex-col items-center min-w-[70px]">
                        <div className="font-mono text-[#19B99A] font-bold text-base select-none">
                          {def?.symbol || '⚡'}
                        </div>
                        <div className="text-[11px] font-semibold text-text-primary mt-0.5">{comp.name}</div>
                        <div className="text-[10px] text-text-muted font-mono">
                          {comp.value} {comp.unit}
                        </div>

                        {/* Interactive toggle if switch */}
                        {comp.type === 'switch' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              pushHistory(components, wires);
                              setComponents((prev) =>
                                prev.map((c) =>
                                  c.id === comp.id ? { ...c, state: c.state ? 0 : 1, unit: c.state ? 'OFF' : 'ON' } : c
                                )
                              );
                            }}
                            className={`mt-1 text-[9px] px-2 py-0.5 rounded font-bold transition-all ${
                              comp.state
                                ? 'bg-[#19B99A] text-white shadow-sm'
                                : 'bg-canvas text-text-muted border border-border'
                            }`}
                          >
                            {comp.state ? 'CLOSED (ON)' : 'OPEN (OFF)'}
                          </button>
                        )}

                        {/* LED glowing indicator */}
                        {comp.type === 'led' && isSimulating && (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse mt-1" />
                        )}
                      </div>

                      {/* Terminal Connection Pins */}
                      {def?.terminals.map((term) => (
                        <div
                          key={term.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTerminalClick(comp.id, term.id);
                          }}
                          className={`absolute w-3.5 h-3.5 rounded-full border-2 transition-transform hover:scale-125 cursor-pointer flex items-center justify-center ${
                            wireStart?.componentId === comp.id && wireStart.terminalId === term.id
                              ? 'bg-[#19B99A] border-white ring-2 ring-[#19B99A] scale-125'
                              : 'bg-card border-[#19B99A] hover:bg-[#19B99A]'
                          }`}
                          style={{
                            left: `calc(50% + ${term.x}px - 7px)`,
                            top: `calc(50% + ${term.y}px - 7px)`,
                          }}
                          title={`Terminal ${term.name} - Click to wire`}
                        >
                          <span className="text-[7px] text-text-primary font-mono group-hover:text-white">{term.name[0]}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Workbench Telemetry Bar */}
              <div className="absolute bottom-3 left-4 right-4 bg-card/95 backdrop-blur-md rounded-xl p-3 border border-border shadow-soft flex items-center justify-between z-10 text-xs">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isSimulating ? 'bg-[#19B99A] animate-pulse' : 'bg-text-muted/40'
                      }`}
                    />
                    <span className="font-semibold text-text-primary">
                      Solver: {isSimulating ? 'Active SPICE Engine' : 'Paused'}
                    </span>
                  </div>
                  <div className="text-text-muted">
                    Components:{' '}
                    <span className="text-text-primary font-mono font-semibold">{components.length}</span>
                  </div>
                  <div className="text-text-muted">
                    Wires:{' '}
                    <span className="text-text-primary font-mono font-semibold">{wires.length}</span>
                  </div>
                  <div className="text-text-muted">
                    Power:{' '}
                    <span className="text-[#19B99A] font-mono font-semibold">
                      {calculatedTelemetry?.powerMw || '0.00'} mW
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setComponents([]);
                      setWires([]);
                    }}
                    className="text-text-muted hover:text-red-500 flex items-center gap-1 transition-colors px-2 py-1 rounded"
                    title="Clear All Components"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Workbench
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT PANEL: PROPERTIES INSPECTOR & OHM'S CALCULATOR (Hidden in Falstad mode) */}
        {viewMode !== 'falstad' && (
          <aside className="w-80 border-l border-border bg-card flex flex-col z-10 overflow-y-auto text-text-primary shrink-0">
          {/* Header */}
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#19B99A]" />
              <span className="font-display font-semibold text-sm text-text-primary">Properties Inspector</span>
            </div>
            {selectedComp && (
              <button
                onClick={handleDeleteSelected}
                className="text-text-muted hover:text-red-500 p-1 rounded transition-colors"
                title="Delete Component"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Component Property Editor */}
          <div className="p-4 border-b border-border space-y-3">
            {selectedComp ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">{selectedComp.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#DDF8EE] text-[#19B99A] dark:bg-[#0D2E26] font-mono uppercase text-[10px] font-semibold">
                    {selectedComp.type}
                  </span>
                </div>

                {/* Name field */}
                <div>
                  <label className="text-[11px] font-medium text-text-muted mb-1 block">Label / Designator</label>
                  <input
                    type="text"
                    value={selectedComp.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setComponents((prev) =>
                        prev.map((c) => (c.id === selectedComp.id ? { ...c, name: val } : c))
                      );
                    }}
                    className="w-full bg-canvas border border-border rounded-lg px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-[#19B99A]"
                  />
                </div>

                {/* Value field with Unit */}
                <div>
                  <div className="flex justify-between text-[11px] text-text-muted mb-1">
                    <span>Component Value</span>
                    <span className="font-mono text-[#19B99A] font-semibold">{selectedComp.unit}</span>
                  </div>
                  <input
                    type="number"
                    value={selectedComp.value}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      pushHistory(components, wires);
                      setComponents((prev) =>
                        prev.map((c) => (c.id === selectedComp.id ? { ...c, value: val } : c))
                      );
                    }}
                    className="w-full bg-canvas border border-border rounded-lg px-2.5 py-1 text-xs font-mono text-text-primary focus:outline-none focus:border-[#19B99A]"
                  />
                </div>

                {/* Real-time Telemetry Cards */}
                {calculatedTelemetry && (
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                      Live Electrical Telemetry
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-canvas p-2 rounded-lg border border-border text-center">
                        <div className="text-[10px] text-text-muted">Voltage</div>
                        <div className="text-xs font-mono font-bold text-sky-500">
                          {calculatedTelemetry.voltage} V
                        </div>
                      </div>
                      <div className="bg-canvas p-2 rounded-lg border border-border text-center">
                        <div className="text-[10px] text-text-muted">Current</div>
                        <div className="text-xs font-mono font-bold text-[#19B99A]">
                          {calculatedTelemetry.currentMa} mA
                        </div>
                      </div>
                      <div className="bg-canvas p-2 rounded-lg border border-border text-center">
                        <div className="text-[10px] text-text-muted">Power</div>
                        <div className="text-xs font-mono font-bold text-amber-500">
                          {calculatedTelemetry.powerMw} mW
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-6 text-center text-xs text-text-muted">
                Click on any component on the workbench to inspect and tune its electrical parameters.
              </div>
            )}
          </div>

          {/* INTERACTIVE OHM'S LAW CALCULATOR */}
          <div className="p-4 border-b border-border">
            <div
              className="flex items-center justify-between cursor-pointer mb-2"
              onClick={() => setShowOhmCalculator(!showOhmCalculator)}
            >
              <div className="flex items-center gap-1.5 font-display font-semibold text-xs text-text-primary">
                <Sparkles className="w-3.5 h-3.5 text-[#19B99A]" />
                <span>Ohm's Law Calculator (V = I × R)</span>
              </div>
              {showOhmCalculator ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
            </div>

            {showOhmCalculator && (
              <div className="space-y-2.5 pt-1">
                {/* Triangular Formula Graphic */}
                <div className="bg-canvas p-2.5 rounded-lg border border-border text-center">
                  <div className="text-[11px] font-mono text-[#19B99A] font-bold">
                    V = {(calcCurrent * calcResistance).toFixed(2)} Volts
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    I = {(calcCurrent * 1000).toFixed(1)} mA &nbsp;|&nbsp; R = {calcResistance} Ω
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-text-muted flex justify-between mb-1">
                    <span>Voltage (V)</span>
                    <span className="font-mono text-[#19B99A] font-semibold">{calcVoltage} V</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    step="0.5"
                    value={calcVoltage}
                    onChange={(e) => handleOhmCalcChange('V', parseFloat(e.target.value))}
                    className="w-full accent-[#19B99A] h-1.5 bg-canvas rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-text-muted flex justify-between mb-1">
                    <span>Resistance (R)</span>
                    <span className="font-mono text-[#19B99A] font-semibold">{calcResistance} Ω</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={calcResistance}
                    onChange={(e) => handleOhmCalcChange('R', parseFloat(e.target.value))}
                    className="w-full accent-[#19B99A] h-1.5 bg-canvas rounded-lg cursor-pointer"
                  />
                </div>

                <div className="bg-[#DDF8EE]/50 dark:bg-[#0D2E26]/50 border border-[#19B99A]/30 p-2 rounded-lg text-[10px] text-text-primary">
                  Calculated Current:{' '}
                  <strong className="text-[#19B99A]">{(calcCurrent * 1000).toFixed(2)} mA</strong> (Power:{' '}
                  {(calcVoltage * calcCurrent).toFixed(3)} W)
                </div>
              </div>
            )}
          </div>

          {/* Educational Lab Guide & Formula Box */}
          <div className="p-4 flex-1">
            <div className="flex items-center gap-1.5 font-display font-semibold text-xs text-text-primary mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#19B99A]" />
              <span>Experiment Notes & Theory</span>
            </div>
            <div className="p-3 rounded-xl bg-canvas border border-border text-xs text-text-muted space-y-2">
              <div className="font-semibold text-text-primary">{activeExperiment.title}</div>
              <p className="text-[11px] leading-relaxed">{activeExperiment.theory}</p>
              <div className="p-1.5 rounded-lg bg-card font-mono text-[10px] text-amber-600 dark:text-amber-400 text-center border border-border font-semibold">
                {activeExperiment.formula}
              </div>

              <div className="pt-1">
                <span className="text-[10px] font-semibold text-text-primary uppercase tracking-wider block mb-1">
                  Procedure:
                </span>
                <ul className="text-[11px] space-y-1 list-disc pl-3 text-text-muted">
                  {activeExperiment.steps.slice(0, 3).map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>

      {/* 3. GUIDED EXPERIMENTS MODAL (10 FULL LABS) */}
      {showExperimentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-4xl max-h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-card">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#19B99A]" />
                <h2 className="font-display font-bold text-lg text-text-primary">
                  VidyaVerse Circuit Labs: 10 Guided Experiments
                </h2>
              </div>
              <button
                onClick={() => setShowExperimentModal(false)}
                className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-canvas transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {GUIDED_EXPERIMENTS.map((exp) => (
                <div
                  key={exp.id}
                  className={`card-interactive p-4 flex flex-col justify-between border ${
                    activeExperiment.id === exp.id
                      ? 'border-[#19B99A] bg-[#DDF8EE]/20 dark:bg-[#0D2E26]/20 ring-1 ring-[#19B99A]'
                      : 'border-border bg-card'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DDF8EE] text-[#19B99A] dark:bg-[#0D2E26]">
                        {exp.grade}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">{exp.category}</span>
                    </div>
                    <h3 className="font-bold text-sm text-text-primary mb-1">{exp.title}</h3>
                    <p className="text-xs text-text-muted line-clamp-2 mb-2">{exp.summary}</p>
                    <div className="bg-canvas px-2.5 py-1 rounded font-mono text-[11px] text-amber-600 dark:text-amber-400 border border-border inline-block mb-3 font-semibold">
                      {exp.formula}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleLoadExperiment(exp);
                      setShowExperimentModal(false);
                    }}
                    className="w-full py-1.5 text-xs font-semibold rounded-xl bg-[#19B99A] hover:bg-[#159F84] text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Load into Workbench</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircuitVersePage;
