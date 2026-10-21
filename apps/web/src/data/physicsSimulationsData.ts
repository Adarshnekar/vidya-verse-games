export type PhysicsCategory =
  | 'All'
  | 'Mechanics'
  | 'Optics'
  | 'Electricity'
  | 'Magnetism'
  | 'Fluids & Thermal'
  | 'Modern Physics';

export interface PhysicsSimulationItem {
  id: string;
  filename: string;
  title: string;
  subtitle: string;
  category: Exclude<PhysicsCategory, 'All'>;
  topicTag: string; // Conceptual domain tag, NO class/grade mentions
  description: string;
  learningObjectives: string[];
  formula?: string;
  theoryPath?: string;
  tags: string[];
}

export const PHYSICS_SIMULATIONS: PhysicsSimulationItem[] = [
  // ==========================================
  // OPTICS & LIGHT
  // ==========================================
  {
    id: 'optics-reflection',
    filename: 'Optics_Reflection_of_Light.html',
    title: 'Laws of Reflection',
    subtitle: 'Incident ray, normal vector, and angle of reflection equality',
    category: 'Optics',
    topicTag: 'Ray Optics',
    description:
      'Adjust the angle of incidence in 3D space to verify that the angle of incidence strictly equals the angle of reflection, and both rays lie in the exact same plane.',
    learningObjectives: [
      'Verify the fundamental law of reflection: θᵢ = θᵣ',
      'Understand the perpendicular normal vector to the reflecting surface',
      'Observe specular reflection geometry in three-dimensional space',
    ],
    formula: 'θᵢ = θᵣ',
    theoryPath: '/physics/Theory/Optics/Optics_Reflection_of_Light.html',
    tags: ['reflection', 'mirror', 'angle of incidence', 'optics', 'normal'],
  },
  {
    id: 'optics-converging-mirror',
    filename: 'Optics_Converging_Mirror.html',
    title: 'Concave Mirror Reflection',
    subtitle: 'Curved reflection, center of curvature, focus, and real/virtual images',
    category: 'Optics',
    topicTag: 'Spherical Mirrors',
    description:
      'Experiment with concave spherical mirrors. Move the object beyond C, at C, between C and F, and between F and P to observe real inverted and virtual magnified reflections.',
    learningObjectives: [
      'Verify the spherical mirror formula: 1/f = 1/v + 1/u',
      'Track focal point and center of curvature ray intersections',
      'Distinguish real focused images from enlarged upright virtual images',
    ],
    formula: '1/f = 1/v + 1/u',
    tags: ['concave mirror', 'reflection', 'focus', 'center of curvature'],
  },
  {
    id: 'optics-diverging-mirror',
    filename: 'Optics_Diverging_Mirror.html',
    title: 'Convex Mirror Reflection',
    subtitle: 'Wide field of view and diminished rear-view reflection',
    category: 'Optics',
    topicTag: 'Spherical Mirrors',
    description:
      'Discover why convex mirrors are deployed as rear-view mirrors. Observe how incident rays disperse outward, creating an upright virtual image across an expansive field of view.',
    learningObjectives: [
      'Demonstrate why convex mirrors always form virtual, erect, and diminished images',
      'Analyze the wide optical field of view angle compared to plane mirrors',
      'Apply sign conventions for positive focal length convex surfaces',
    ],
    formula: 'm = -v / u  (m < 1)',
    tags: ['convex mirror', 'rear view', 'virtual image', 'field of view'],
  },
  {
    id: 'optics-refraction',
    filename: 'Optics_Refraction_of_Light.html',
    title: 'Refraction & Snell’s Law',
    subtitle: 'Light bending across media boundaries and refractive index',
    category: 'Optics',
    topicTag: 'Refraction',
    description:
      'Direct light rays from air into glass, water, or oil. Measure angles of incidence and refraction to confirm Snell’s Law and calculate the medium’s optical density.',
    learningObjectives: [
      'Verify Snell’s Law: n₁ · sin(θ₁) = n₂ · sin(θ₂)',
      'Observe light rays bending toward the normal in denser optical media',
      'Understand wave speed slowing in media with higher refractive index',
    ],
    formula: 'n₁ · sin(θ₁) = n₂ · sin(θ₂)',
    theoryPath: '/physics/Theory/Optics/Optics_Refraction_of_Light.html',
    tags: ['refraction', 'snells law', 'optical density', 'refractive index'],
  },
  {
    id: 'optics-converging-lens',
    filename: 'Optics_Converging_Lens.html',
    title: 'Convex (Converging) Lens',
    subtitle: 'Focal points, real inverted images, and virtual magnification',
    category: 'Optics',
    topicTag: 'Thin Lenses',
    description:
      'Interact with an optical bench holding a convex lens. Drag the object along the principal axis to discover focal points, real inverted images, and virtual enlarged images.',
    learningObjectives: [
      'Verify the thin lens formula: 1/f = 1/v - 1/u',
      'Observe the transition from real inverted images to virtual magnified images',
      'Measure linear magnification: m = v / u',
    ],
    formula: '1/f = 1/v - 1/u',
    theoryPath: '/physics/Theory/Optics/Optics_Converging_Lens.html',
    tags: ['convex lens', 'focal point', 'lens formula', 'magnification', 'ray tracing'],
  },
  {
    id: 'optics-diverging-lens',
    filename: 'Optics_Diverging_Lens.html',
    title: 'Concave (Diverging) Lens',
    subtitle: 'Virtual, upright, and diminished image formation',
    category: 'Optics',
    topicTag: 'Thin Lenses',
    description:
      'Trace diverging light rays through a concave lens. Learn why concave lenses always form virtual, diminished, and erect images regardless of object position.',
    learningObjectives: [
      'Observe divergence of parallel rays from a virtual principal focus',
      'Verify virtual image formation for all finite object positions',
      'Apply Cartesian sign conventions with negative focal length',
    ],
    formula: '1/f = 1/v - 1/u  (f < 0)',
    theoryPath: '/physics/Theory/Optics/Optics_Diverging_Lens.html',
    tags: ['concave lens', 'diverging', 'virtual image', 'sign convention'],
  },
  {
    id: 'optics-tir',
    filename: 'Optics_Total_Internal_Reflection.html',
    title: 'Total Internal Reflection',
    subtitle: 'Critical angle, complete internal reflection, and fiber optics',
    category: 'Optics',
    topicTag: 'Wave & Ray Optics',
    description:
      'Increase the incident angle in a denser medium until light ceases to refract and undergoes 100% internal reflection. Fundamental to optical fiber telecommunication.',
    learningObjectives: [
      'Identify the critical angle condition: sin(θ_c) = n₂ / n₁',
      'Observe total boundary reflection with zero transmission loss',
      'Understand real-world applications in optical fibers and prisms',
    ],
    formula: 'sin(θ_c) = n₂ / n₁',
    tags: ['total internal reflection', 'critical angle', 'fiber optics', 'tir'],
  },
  {
    id: 'optics-telescope',
    filename: 'Optics_Astronomical_Telescope.html',
    title: 'Astronomical Telescope',
    subtitle: 'Objective and eyepiece lens arrangement for celestial observation',
    category: 'Optics',
    topicTag: 'Optical Instruments',
    description:
      'Explore ray tracing inside an astronomical telescope. Adjust focal lengths of objective and eyepiece, toggle ray diagrams, and observe angular magnification at normal adjustment.',
    learningObjectives: [
      'Understand how two converging lenses form a magnified celestial image',
      'Derive angular magnification: m = -fₒ / fₑ',
      'Analyze ray path through objective focal plane and eyepiece',
    ],
    formula: 'm = -fₒ / fₑ',
    theoryPath: '/physics/Theory/Optics/Optics_Astronomical_Telescope.html',
    tags: ['telescope', 'astronomy', 'optics', 'magnification', 'lenses'],
  },
  {
    id: 'optics-microscope',
    filename: 'Optics_Compound_Microscope.html',
    title: 'Compound Microscope',
    subtitle: 'Dual-lens magnification system for microscopic specimens',
    category: 'Optics',
    topicTag: 'Optical Instruments',
    description:
      'Investigate image formation in a compound microscope. See how the objective lens forms a real inverted intermediate image which is further magnified by the ocular eyepiece.',
    learningObjectives: [
      'Observe the intermediate real inverted image and final virtual image',
      'Calculate total magnification: M = m_objective × m_eyepiece',
      'Understand focal length constraints for high resolving power',
    ],
    formula: 'M = (L / fₒ) × (D / fₑ)',
    theoryPath: '/physics/Theory/Optics/Optics_Compound_Microscope.html',
    tags: ['microscope', 'magnification', 'objective', 'eyepiece', 'optics'],
  },
  {
    id: 'optics-youngs-slit',
    filename: 'Optics_Young\'s_Double_Slit_Experiment.html',
    title: 'Young’s Double Slit Experiment',
    subtitle: 'Wavefront division and alternating dark/bright fringe patterns',
    category: 'Optics',
    topicTag: 'Wave Optics',
    description:
      'Recreate Thomas Young’s historic experiment that proved the wave nature of light. Vary slit separation d, screen distance D, and wavelength λ to watch interference fringes shift.',
    learningObjectives: [
      'Observe constructive and destructive wave interference',
      'Measure fringe width: β = (λ · D) / d',
      'Understand the path difference condition: Δx = n · λ',
    ],
    formula: 'β = (λ · D) / d',
    tags: ['interference', 'double slit', 'wave optics', 'fringe width'],
  },

  // ==========================================
  // MECHANICS & MOTION
  // ==========================================
  {
    id: 'mech-kinematics-1d',
    filename: 'Mechanics_Motion_in_straight_line.html',
    title: 'Motion in a Straight Line',
    subtitle: 'Position, velocity, acceleration, and equations of motion',
    category: 'Mechanics',
    topicTag: 'Kinematics',
    description:
      'Control a body moving along a linear track. Inspect position-time, velocity-time, and acceleration-time relations under uniform and variable acceleration.',
    learningObjectives: [
      'Verify equations of motion: v = u + at, s = ut + ½at², v² = u² + 2as',
      'Interpret slope of x-t graph as velocity and v-t graph as acceleration',
      'Compute area under v-t graph to obtain total displacement',
    ],
    formula: 'v² = u² + 2as',
    tags: ['kinematics', 'velocity', 'acceleration', 'displacement', '1d motion'],
  },
  {
    id: 'mech-projectile',
    filename: 'Mechanics_Projectile_Motion.html',
    title: 'Projectile Motion Laboratory',
    subtitle: 'Parabolic trajectories, launch angles, and range calculation',
    category: 'Mechanics',
    topicTag: '2D Kinematics',
    description:
      'Fire projectile shells across a calibrated 3D field. Vary launch angle, initial speed, and platform elevation to measure flight time and horizontal range.',
    learningObjectives: [
      'Verify independence of horizontal and vertical velocity components',
      'Find optimal launch angle θ = 45° for maximum horizontal range',
      'Derive maximum flight height: H = (v₀ · sin θ)² / (2g)',
    ],
    formula: 'R = (v₀² · sin 2θ) / g',
    theoryPath: '/physics/Theory/Mechanics/Mechanics_Projectile_Motion.html',
    tags: ['projectile', 'parabola', 'kinematics', 'range', 'flight time'],
  },
  {
    id: 'mech-circular-motion',
    filename: 'Mechanics_Circular_Motion.html',
    title: 'Uniform Circular Motion & Loop',
    subtitle: 'Rollercoaster loop dynamics and centripetal acceleration',
    category: 'Mechanics',
    topicTag: 'Circular Dynamics',
    description:
      'Launch a 3D cart through a vertical rollercoaster loop. Toggle free body diagrams to inspect weight, normal force, and net centripetal acceleration vectors.',
    learningObjectives: [
      'Derive minimum velocity at top of vertical loop: v = √(g · R)',
      'Inspect centripetal force: F_c = (m · v²) / r along 3D track',
      'Analyze conservation of mechanical energy between loop heights',
    ],
    formula: 'F_c = (m · v²) / r',
    theoryPath: '/physics/Theory/Mechanics/Mechanics_Circular_Motion.html',
    tags: ['circular motion', 'centripetal force', 'rollercoaster', 'free body diagram'],
  },
  {
    id: 'mech-banking',
    filename: 'Mechanics_Banking_on_a_Road.html',
    title: 'Banking of Road Curves',
    subtitle: 'Centripetal friction and safe vehicle turning velocities',
    category: 'Mechanics',
    topicTag: 'Circular Dynamics',
    description:
      'Inspect a car negotiating an inclined banked curve. Adjust road angle θ and coefficient of friction μ to discover optimal non-skid speeds.',
    learningObjectives: [
      'Derive ideal safe velocity: v = √(R · g · tan θ) without friction',
      'Resolve normal force and friction components along inclined plane',
      'Determine safe turning speeds on dry vs wet banked highways',
    ],
    formula: 'v = √(R · g · tan θ)',
    theoryPath: '/physics/Theory/Mechanics/Mechanics_Banking_on_a_Road.html',
    tags: ['banking', 'circular motion', 'friction', 'roads', 'inclined plane'],
  },
  {
    id: 'mech-pendulum',
    filename: 'Mechanics_Simple_Pendulum.html',
    title: 'Simple Harmonic Pendulum',
    subtitle: 'Periodic oscillation, string length, and gravity verification',
    category: 'Mechanics',
    topicTag: 'Oscillations',
    description:
      'Release a pendulum bob from varying amplitudes. Measure oscillation period T, explore kinetic/potential energy transformations, and measure g.',
    learningObjectives: [
      'Confirm small-angle period: T = 2π · √(L / g)',
      'Verify independence of oscillation period from bob mass',
      'Track potential vs kinetic energy interchange curves',
    ],
    formula: 'T = 2π · √(L / g)',
    theoryPath: '/physics/Theory/Mechanics/Mechanics_Simple_Pendulum.html',
    tags: ['pendulum', 'shm', 'harmonic motion', 'gravity', 'period'],
  },
  {
    id: 'mech-spring',
    filename: 'Mechanics_Spring_Force.html',
    title: 'Hooke’s Law & Spring Oscillations',
    subtitle: 'Restoring force, spring stiffness k, and elastic energy',
    category: 'Mechanics',
    topicTag: 'Oscillations',
    description:
      'Attach calibrated weights to a vertical coil spring. Measure displacement x to verify F = -kx, measure spring stiffness, and observe simple harmonic vibration.',
    learningObjectives: [
      'Verify Hooke’s Law: F = -k · x',
      'Derive oscillation frequency: ω = √(k / m)',
      'Calculate stored elastic potential energy: U = ½ k · x²',
    ],
    formula: 'F = -k · x',
    theoryPath: '/physics/Theory/Mechanics/Mechanics_Spring_Force.html',
    tags: ['spring', 'hookes law', 'elasticity', 'shm', 'stiffness'],
  },
  {
    id: 'mech-gravitation-law',
    filename: 'Mechanics_Gravitation_Law.html',
    title: 'Universal Law of Gravitation',
    subtitle: 'Inverse square gravitational attraction between masses',
    category: 'Mechanics',
    topicTag: 'Gravitation',
    description:
      'Position two massive spheres in 3D coordinate space. Modify their masses M1, M2 and separation distance r to see real-time gravitational force vectors scale.',
    learningObjectives: [
      'Confirm Newton’s inverse square law: F ∝ 1 / r²',
      'Understand gravitational constant G = 6.674 × 10⁻¹¹ N·m²/kg²',
      'Observe Newton’s third law equal and opposite mutual attraction',
    ],
    formula: 'F = G · (m₁ · m₂) / r²',
    theoryPath: '/physics/Theory/Mechanics/Mechanics_Gravitation_Law.html',
    tags: ['gravitation', 'newton', 'inverse square', 'mass', 'orbits'],
  },
  {
    id: 'mech-torque',
    filename: 'Mechanics_Torque.html',
    title: 'Torque & Lever Arm',
    subtitle: 'Turning effect of force and rotational equilibrium',
    category: 'Mechanics',
    topicTag: 'Rotational Motion',
    description:
      'Apply forces at various points along a lever beam. Explore how perpendicular distance r and force angle θ govern the net turning effect τ = r × F.',
    learningObjectives: [
      'Calculate torque: τ = r · F · sin θ',
      'Distinguish clockwise vs counterclockwise rotational moments',
      'Establish conditions for static rotational equilibrium: Σ τ = 0',
    ],
    formula: 'τ = r · F · sin θ',
    tags: ['torque', 'lever', 'equilibrium', 'rotation', 'moment'],
  },
  {
    id: 'mech-angular-momentum',
    filename: 'Mechanics_Conservation_of_Angular_Momentum.html',
    title: 'Conservation of Angular Momentum',
    subtitle: 'Moment of inertia variation and rotational speedup',
    category: 'Mechanics',
    topicTag: 'Rotational Motion',
    description:
      'Observe rotating masses on an axle. Retract the weights inward to reduce moment of inertia I and observe instantaneous angular velocity ω spin surge.',
    learningObjectives: [
      'Verify conservation law: I₁ · ω₁ = I₂ · ω₂ when net external torque is zero',
      'Understand moment of inertia dependency on radial mass distribution',
      'Apply to planetary orbits, figure skating spins, and spinning wheels',
    ],
    formula: 'L = I · ω = constant',
    tags: ['angular momentum', 'inertia', 'rotation', 'torque', 'conservation'],
  },
  {
    id: 'mech-vector-algebra',
    filename: 'Mechanics_Vector_Algebra.html',
    title: '3D Vector Algebra',
    subtitle: 'Vector addition, dot products, and cross products in 3D',
    category: 'Mechanics',
    topicTag: 'Vector Analysis',
    description:
      'Manipulate 3D vector arrows in space. Perform graphical addition via parallelogram law, calculate scalar dot product A · B, and cross product vector A × B.',
    learningObjectives: [
      'Visualize 3D components: A_x, A_y, A_z',
      'Compute dot product: A · B = |A| |B| cos θ',
      'Determine direction of cross product A × B via right-hand rule',
    ],
    formula: '|A × B| = |A| |B| sin θ',
    tags: ['vectors', 'cross product', 'dot product', 'algebra', 'components'],
  },

  // ==========================================
  // ELECTRICITY & CIRCUITS
  // ==========================================
  {
    id: 'elec-coulomb',
    filename: 'Electricity_Coulomb\'s_Law.html',
    title: 'Coulomb’s Law of Electrostatics',
    subtitle: 'Mutual force between point charges and distance scaling',
    category: 'Electricity',
    topicTag: 'Electrostatics',
    description:
      'Position positive and negative electrostatic charges in 3D. Inspect mutual attractive and repulsive force vectors scaling with charge magnitudes and separation r.',
    learningObjectives: [
      'Verify electrostatic force: F = (1 / 4πε₀) · (q₁ · q₂) / r²',
      'Distinguish repulsive like charges from attractive opposite charges',
      'Observe Newton’s third law symmetry in electrostatic interactions',
    ],
    formula: 'F = (1 / 4πε₀) · (q₁ · q₂) / r²',
    tags: ['coulomb', 'electrostatics', 'charges', 'electric force', 'inverse square'],
  },
  {
    id: 'elec-field',
    filename: 'Electricity_The_Electric_Field.html',
    title: 'Electric Field Lines & Flux',
    subtitle: '3D vector field topology radiating from source charges',
    category: 'Electricity',
    topicTag: 'Electrostatics',
    description:
      'Place positive and negative charges to visualize emergent electric field vector lines, field line density, and test charge trajectory paths.',
    learningObjectives: [
      'Observe field lines originating at positive and terminating on negative charges',
      'Verify electric field strength: E = F / q',
      'Inspect field density representing the magnitude of electric field',
    ],
    formula: 'E = F / q',
    tags: ['electric field', 'flux', 'field lines', 'charge', 'vector field'],
  },
  {
    id: 'elec-capacitance',
    filename: 'Electricity_Understanding_Capacitance.html',
    title: 'Parallel Plate Capacitor',
    subtitle: 'Charge storage, plate geometry, and uniform electric field',
    category: 'Electricity',
    topicTag: 'Capacitors',
    description:
      'Charge parallel conductive plates connected to a DC source. Observe surface charge density, uniform internal electric field lines, and stored electric potential energy.',
    learningObjectives: [
      'Verify capacitance formula: C = (ε₀ · A) / d',
      'Understand relationship between voltage, charge, and capacitance: Q = C · V',
      'Calculate stored electrostatic energy: U = ½ C · V²',
    ],
    formula: 'C = (ε₀ · A) / d',
    tags: ['capacitor', 'capacitance', 'dielectric', 'energy', 'voltage'],
  },
  {
    id: 'elec-factors-capacitance',
    filename: 'Electricity_Factors_Effecting_Capacitance.html',
    title: 'Factors Affecting Capacitance',
    subtitle: 'Plate surface area, separation distance, and dielectric slab',
    category: 'Electricity',
    topicTag: 'Capacitors',
    description:
      'Dynamically change plate overlap area A, plate separation d, and insert dielectric slabs of dielectric constant κ to measure capacitance variations.',
    learningObjectives: [
      'Observe capacitance increase with dielectric constant κ',
      'Analyze effect of plate separation distance d on capacitance',
      'Examine charge vs voltage behavior with connected vs disconnected battery',
    ],
    formula: 'C = (κ · ε₀ · A) / d',
    tags: ['capacitance', 'dielectric', 'plate area', 'separation', 'permittivity'],
  },
  {
    id: 'elec-inductance',
    filename: 'Electricity_Understanding_Inductance.html',
    title: 'Inductance & Solenoids',
    subtitle: 'Magnetic flux linkage, solenoid coils, and Lenz back-EMF',
    category: 'Electricity',
    topicTag: 'Electromagnetism',
    description:
      'Drive currents through inductive solenoids. Visualize magnetic flux lines, back-EMF resisting current changes, and mutual inductive coupling.',
    learningObjectives: [
      'Verify induced EMF: ε = -L · (dI / dt)',
      'Calculate solenoid self-inductance: L = μ₀ · n² · A · l',
      'Understand magnetic energy storage in inductive coils: U = ½ L · I²',
    ],
    formula: 'ε = -L · (dI / dt)',
    tags: ['inductance', 'solenoid', 'magnetic flux', 'back emf', 'lenz law'],
  },
  {
    id: 'elec-lc-oscillator',
    filename: 'Electricity_LC_Oscillator.html',
    title: 'LC Resonant Circuit',
    subtitle: 'Harmonic energy oscillation between capacitor and inductor',
    category: 'Electricity',
    topicTag: 'AC Circuits',
    description:
      'Watch electric energy stored in capacitor plates surge into magnetic energy stored in an inductor coil and back, producing continuous electromagnetic oscillations.',
    learningObjectives: [
      'Derive resonant frequency: f₀ = 1 / (2π · √(L · C))',
      'Track 90-degree phase shift between circuit current and voltage',
      'Observe total electromagnetic energy conservation in ideal tank circuit',
    ],
    formula: 'f₀ = 1 / (2π · √(L · C))',
    tags: ['lc oscillator', 'resonance', 'tank circuit', 'ac circuits', 'frequency'],
  },

  // ==========================================
  // MAGNETISM & ELECTROMAGNETISM
  // ==========================================
  {
    id: 'mag-magnetic-effect',
    filename: 'Magnetism_Magnetic_Effect_due_to_Current.html',
    title: 'Magnetic Effect of Current',
    subtitle: 'Oersted’s experiment and compass deflection around conductors',
    category: 'Magnetism',
    topicTag: 'Electromagnetism',
    description:
      'Recreate Hans Christian Oersted’s discovery. Pass electric current through a straight wire and watch magnetic compass needles deflect perpendicular to the wire.',
    learningObjectives: [
      'Observe magnetic fields generated exclusively by moving electric charges',
      'Determine compass deflection direction using Ampere’s swimming rule',
      'Understand the link connecting electricity and magnetism',
    ],
    formula: 'B ∝ I / r',
    tags: ['oersted', 'compass', 'magnetic effect', 'current', 'wire'],
  },
  {
    id: 'mag-fleming-thumb',
    filename: 'Magnetism_Fleming\'s_Thumb_Rule.html',
    title: 'Right-Hand Thumb Rule',
    subtitle: 'Concentric circular magnetic field loops around straight wire',
    category: 'Magnetism',
    topicTag: 'Electromagnetism',
    description:
      'Grasp a straight current-carrying wire with your virtual right hand. See how thumb along current direction curls fingers into circular magnetic field loops.',
    learningObjectives: [
      'Determine magnetic field direction around straight conductors',
      'Verify Biot-Savart law field strength: B = (μ₀ · I) / (2π · r)',
      'Understand magnetic field superposition in multi-wire systems',
    ],
    formula: 'B = (μ₀ · I) / (2π · r)',
    tags: ['right hand rule', 'thumb rule', 'magnetic field', 'current wire'],
  },
  {
    id: 'mag-conductor-force',
    filename: 'Magnetism_Force_on_a_Current_Carrying_Conductor.html',
    title: 'Magnetic Force on Conductor',
    subtitle: 'Motor force on wires F = I(L × B) and Fleming’s Left-Hand Rule',
    category: 'Magnetism',
    topicTag: 'Magnetic Forces',
    description:
      'Suspend a flexible current-carrying wire between the poles of a horseshoe magnet. Reverse current direction or magnetic field to observe directional deflection.',
    learningObjectives: [
      'Verify magnetic force formula: F = I · L · B · sin θ',
      'Apply Fleming’s Left-Hand Rule for electric motor force direction',
      'Understand the foundational mechanism of electric motors and galvanometers',
    ],
    formula: 'F = I · L · B · sin θ',
    tags: ['motor force', 'flemings rule', 'conductor', 'magnetic field', 'lorentz'],
  },
  {
    id: 'mag-induction',
    filename: 'Magnetism_Electromagnetic_Induction.html',
    title: 'Electromagnetic Induction',
    subtitle: 'Moving bar magnet into solenoid coil with galvanometer deflection',
    category: 'Magnetism',
    topicTag: 'Induction',
    description:
      'Plunge a cylindrical bar magnet into a helical coil. Watch the galvanometer needle deflect proportional to relative speed, verifying Faraday’s and Lenz’s laws.',
    learningObjectives: [
      'Demonstrate Faraday’s law of induction: ε = -N · (dΦ / dt)',
      'Verify Lenz’s law: induced current creates magnetic field opposing motion',
      'Show that stationary magnets produce zero induced EMF regardless of field strength',
    ],
    formula: 'ε = -N · (dΦ / dt)',
    tags: ['induction', 'faradays law', 'lenzs law', 'galvanometer', 'solenoid'],
  },
  {
    id: 'mag-lorentz-force',
    filename: 'Magnetism_Understanding_Lorentz_Force.html',
    title: 'Lorentz Force on Charges',
    subtitle: 'Circular cyclotron orbits and helical motion in magnetic fields',
    category: 'Magnetism',
    topicTag: 'Charged Particles',
    description:
      'Inject charged particles into uniform electric and magnetic fields. Observe straight velocity selector trajectories, circular cyclotron orbits, and 3D helical spirals.',
    learningObjectives: [
      'Apply comprehensive Lorentz equation: F = q · (E + v × B)',
      'Calculate cyclotron radius: r = (m · v) / (q · B)',
      'Analyze helical pitch when velocity has a component parallel to B-field',
    ],
    formula: 'r = (m · v) / (q · B)',
    tags: ['lorentz force', 'cyclotron', 'helical motion', 'magnetic deflection'],
  },
  {
    id: 'mag-motional-emf',
    filename: 'Magnetism_Motional_EMF.html',
    title: 'Motional EMF on Rails',
    subtitle: 'Sliding conductor rod in uniform perpendicular magnetic field',
    category: 'Magnetism',
    topicTag: 'Induction',
    description:
      'Slide a conductive rod across parallel copper rails in a magnetic field. Measure induced voltage across the rails and mechanical force needed to sustain speed.',
    learningObjectives: [
      'Derive motional EMF: ε = B · v · l',
      'Calculate retarding magnetic force: F = (B² · l² · v) / R',
      'Verify conservation of mechanical energy transformed into electrical heat',
    ],
    formula: 'ε = B · v · l',
    tags: ['motional emf', 'rails', 'faraday', 'conductors', 'magnetic field'],
  },

  // ==========================================
  // FLUIDS & THERMAL PHYSICS
  // ==========================================
  {
    id: 'thermo-buoyancy',
    filename: 'Thermodynamics_Buoyant_Force.html',
    title: 'Archimedes’ Principle & Buoyancy',
    subtitle: 'Weight of displaced fluid, apparent weight loss, and floatation',
    category: 'Fluids & Thermal',
    topicTag: 'Fluid Statics',
    description:
      'Submerge blocks of various materials into liquid baths. Measure apparent weight loss and compare with the volume and weight of displaced liquid.',
    learningObjectives: [
      'Verify Archimedes’ principle: F_b = ρ_fluid · V · g',
      'Predict sinking versus floating from relative densities',
      'Measure apparent submerged weight: W_app = W_actual - F_b',
    ],
    formula: 'F_b = ρ_fluid · V_disp · g',
    theoryPath: '/physics/Theory/Thermodynamics/Thermodynamics_Buoyant_Force.html',
    tags: ['buoyancy', 'archimedes', 'fluids', 'density', 'floatation'],
  },
  {
    id: 'thermo-pascal',
    filename: 'Thermodynamics_Pascal\'s_Law.html',
    title: 'Pascal’s Law & Hydraulic Lift',
    subtitle: 'Undiminished pressure transmission lifting heavy vehicles',
    category: 'Fluids & Thermal',
    topicTag: 'Fluid Statics',
    description:
      'Operate an interactive 3D hydraulic car lift. Apply small input force on narrow piston A1 to generate immense lifting force on large piston A2 via liquid pressure.',
    learningObjectives: [
      'Verify Pascal’s principle: P₁ = P₂  =>  F₁ / A₁ = F₂ / A₂',
      'Calculate mechanical advantage: MA = A₂ / A₁',
      'Confirm conservation of work: F₁ · d₁ = F₂ · d₂',
    ],
    formula: 'F₁ / A₁ = F₂ / A₂',
    theoryPath: '/physics/Theory/Thermodynamics/Thermodynamics_Pascal\'s_Law.html',
    tags: ['pascals law', 'hydraulic lift', 'pressure', 'fluids', 'mechanics'],
  },
  {
    id: 'thermo-pressure',
    filename: 'Thermodynamics_Pressure.html',
    title: 'Hydrostatic Fluid Pressure',
    subtitle: 'Depth dependence and atmospheric pressure column',
    category: 'Fluids & Thermal',
    topicTag: 'Fluid Statics',
    description:
      'Submerge pressure sensors to different depths in various liquids. Confirm that pressure increases linearly with depth and is independent of container shape.',
    learningObjectives: [
      'Confirm pressure depth formula: P = P₀ + ρ · g · h',
      'Observe hydrostatic paradox (pressure depends on height, not volume)',
      'Measure gauge pressure versus absolute pressure',
    ],
    formula: 'P = P₀ + ρ · g · h',
    tags: ['pressure', 'hydrostatics', 'depth', 'fluids', 'density'],
  },
  {
    id: 'thermo-ideal-gas',
    filename: 'Thermodynamics_Ideal_Gas_Equation.html',
    title: 'Ideal Gas Law (PV = nRT)',
    subtitle: 'Interactive pressure, volume, temperature, and moles relations',
    category: 'Fluids & Thermal',
    topicTag: 'Thermodynamics',
    description:
      'Heat, compress, or pump gas molecules inside a sealed chamber. Watch pressure gauge, thermometer, and piston volume change in strict adherence to PV = nRT.',
    learningObjectives: [
      'Verify Boyle’s law: P ∝ 1/V at constant temperature',
      'Verify Charles’s law: V ∝ T at constant pressure',
      'Understand universal gas constant: R = 8.314 J/(mol·K)',
    ],
    formula: 'P · V = n · R · T',
    theoryPath: '/physics/Theory/Thermodynamics/Thermodynamics_Ideal_Gas_Equation.html',
    tags: ['ideal gas', 'pv=nrt', 'gas laws', 'pressure', 'temperature', 'volume'],
  },
  {
    id: 'thermo-kinetic-theory',
    filename: 'Thermodynamics_Kinetic_Theory_of_Gases.html',
    title: 'Kinetic Theory of Gases',
    subtitle: 'Molecular speeds, elastic collisions, and thermal energy',
    category: 'Fluids & Thermal',
    topicTag: 'Thermodynamics',
    description:
      'Peer inside a gas container to track individual molecular collisions with chamber walls. Observe how temperature directly dictates root-mean-square speed v_rms.',
    learningObjectives: [
      'Relate temperature to average translational kinetic energy: E_k = (3/2) k_B · T',
      'Calculate root-mean-square molecular speed: v_rms = √(3RT / M)',
      'Derive gas pressure from momentum transfer during elastic wall collisions',
    ],
    formula: 'v_rms = √(3 k_B · T / m)',
    theoryPath: '/physics/Theory/Thermodynamics/Thermodynamics_Kinetic_Theory_of_Gases.html',
    tags: ['kinetic theory', 'molecules', 'vrms', 'boltzmann', 'collisions'],
  },
  {
    id: 'thermo-hot-air-balloon',
    filename: 'Thermodynamics_Hot_Air_Balloon.html',
    title: 'Thermal Expansion & Buoyant Flight',
    subtitle: 'Hot air density reduction enabling aerial ascent',
    category: 'Fluids & Thermal',
    topicTag: 'Thermal Physics',
    description:
      'Fire the gas burner beneath a hot air balloon. Watch internal air temperature rise, density drop below surrounding atmospheric air, and generate net buoyant lift.',
    learningObjectives: [
      'Understand relationship between temperature and air density: ρ = P·M / (R·T)',
      'Calculate net lifting force: F_net = (ρ_cold - ρ_hot) · V · g - W_balloon',
      'Observe equilibrium hovering altitude conditions',
    ],
    formula: 'ρ = (P · M) / (R · T)',
    theoryPath: '/physics/Theory/Thermodynamics/Thermodynamics_hot_air_balloon.html',
    tags: ['hot air balloon', 'thermal expansion', 'buoyancy', 'density', 'lift'],
  },

  // ==========================================
  // MODERN & ATOMIC PHYSICS
  // ==========================================
  {
    id: 'quantum-photoelectric',
    filename: 'Quantum_Photoelectric_Effect.html',
    title: 'The Photoelectric Effect',
    subtitle: 'Photon packets, stopping potential, and threshold frequency',
    category: 'Modern Physics',
    topicTag: 'Quantum Physics',
    description:
      'Shine monochromatic light onto a metal cathode inside a vacuum tube. Adjust light wavelength λ, intensity, and retarding voltage to verify Einstein’s photon hypothesis.',
    learningObjectives: [
      'Confirm Einstein’s photoelectric equation: K_max = h · ν - Φ',
      'Observe instantaneous electron emission without wave-theory time lag',
      'Measure stopping potential V₀ and determine Planck’s constant h',
    ],
    formula: 'h · ν = Φ + e · V₀',
    theoryPath: '/physics/Theory/Quantum/Quantum_Photoelectric_Effect.html',
    tags: ['photoelectric', 'quantum', 'einstein', 'photon', 'stopping potential'],
  },
  {
    id: 'quantum-bohr-atom',
    filename: 'Quantum_The_Bohr_Atom.html',
    title: 'Bohr Model of the Atom',
    subtitle: 'Quantized electron orbits and angular momentum conditions',
    category: 'Modern Physics',
    topicTag: 'Atomic Structure',
    description:
      'Step through quantized circular orbits n = 1, 2, 3, 4 of an electron around the nucleus. Observe orbital radius scaling r_n ∝ n² and discrete orbital energy levels.',
    learningObjectives: [
      'Verify Bohr’s postulate of angular momentum: L = n · (h / 2π)',
      'Calculate orbital radius: r_n = 0.529 × n² Å',
      'Understand non-radiating stationary energy states in atoms',
    ],
    formula: 'L = n · (h / 2π)',
    tags: ['bohr model', 'hydrogen', 'energy levels', 'quantum orbits', 'planck'],
  },
  {
    id: 'quantum-hydrogen-spectrum',
    filename: 'Quantum_Hydrogen_Atom.html',
    title: 'Hydrogen Emission Spectra',
    subtitle: 'Spectral series emission lines (Lyman, Balmer, Paschen)',
    category: 'Modern Physics',
    topicTag: 'Atomic Spectra',
    description:
      'Trigger electron transitions between quantum shells. Watch emitted photons generate corresponding colored spectral lines on the emission spectrometer.',
    learningObjectives: [
      'Verify Rydberg formula: 1/λ = R_H · (1/n₁² - 1/n₂²)',
      'Identify visible Balmer series (n₁ = 2) emission lines (H-α, H-β)',
      'Relate photon wavelength directly to energy level gap: ΔE = h · c / λ',
    ],
    formula: '1/λ = R_H · (1/n₁² - 1/n₂²)',
    tags: ['spectral lines', 'balmer', 'lyman', 'rydberg', 'emission', 'hydrogen'],
  },
  {
    id: 'quantum-cathode-rays',
    filename: 'Quantum_Cathode_Rays_The_Electrons.html',
    title: 'Discovery of the Electron',
    subtitle: 'J.J. Thomson’s cathode ray deflection and e/m ratio experiment',
    category: 'Modern Physics',
    topicTag: 'Atomic Structure',
    description:
      'Fire high-velocity electron cathode rays through crossed electric and magnetic deflection plates. Balance electrostatic and magnetic forces to discover the electron.',
    learningObjectives: [
      'Trace cathode ray beam deflection in electric and magnetic fields',
      'Derive charge-to-mass ratio e/m from beam deflection angles',
      'Understand foundational experiments that established subatomic particle physics',
    ],
    formula: 'e / m = E / (B² · r)',
    tags: ['cathode ray', 'electron', 'thomson', 'e/m ratio', 'deflection'],
  },
];
