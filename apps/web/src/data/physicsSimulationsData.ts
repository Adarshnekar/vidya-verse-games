export type PhysicsCategory =
  | 'All'
  | 'Mechanics'
  | 'Optics'
  | 'Electricity'
  | 'Magnetism'
  | 'Thermodynamics'
  | 'Quantum';

export interface PhysicsSimulationItem {
  id: string;
  filename: string;
  title: string;
  subtitle: string;
  category: Exclude<PhysicsCategory, 'All'>;
  classGrade: string; // e.g. "Class 11", "Class 12", "Class 9-10"
  description: string;
  learningObjectives: string[];
  formula?: string;
  theoryPath?: string;
  tags: string[];
}

export const PHYSICS_SIMULATIONS: PhysicsSimulationItem[] = [
  // --- OPTICS ---
  {
    id: 'optics-telescope',
    filename: 'Optics_Astronomical_Telescope.html',
    title: 'Astronomical Telescope',
    subtitle: 'Refracting telescope with objective and eyepiece lenses',
    category: 'Optics',
    classGrade: 'Class 12',
    description:
      'Explore ray tracing inside an astronomical telescope. Adjust focal lengths of objective and eyepiece, toggle ray diagrams, and observe angular magnification at normal adjustment.',
    learningObjectives: [
      'Understand how two converging lenses form a magnified celestial image',
      'Derive angular magnification m = -fo / fe',
      'Analyze ray path through objective focal plane and eyepiece',
    ],
    formula: 'm = -f_o / f_e',
    theoryPath: '/physics/Theory/Optics/Optics_Astronomical_Telescope.html',
    tags: ['telescope', 'astronomy', 'optics', 'magnification', 'lenses', 'refraction'],
  },
  {
    id: 'optics-microscope',
    filename: 'Optics_Compound_Microscope.html',
    title: 'Compound Microscope',
    subtitle: 'High magnification optical system for micro specimens',
    category: 'Optics',
    classGrade: 'Class 12',
    description:
      'Investigate image formation in a compound microscope. See how the objective lens forms a real, inverted intermediate image which is further magnified by the ocular eyepiece lens.',
    learningObjectives: [
      'Observe real inverted intermediate image and virtual final image',
      'Calculate total magnification M = m_objective * m_eyepiece',
      'Understand focal length constraints for high resolving power',
    ],
    formula: 'M = (L / f_o) \\times (D / f_e)',
    theoryPath: '/physics/Theory/Optics/Optics_Compound_Microscope.html',
    tags: ['microscope', 'magnification', 'objective', 'eyepiece', 'cells', 'optics'],
  },
  {
    id: 'optics-converging-lens',
    filename: 'Optics_Converging_Lens.html',
    title: 'Convex (Converging) Lens',
    subtitle: 'Principal focus, real and virtual image formation',
    category: 'Optics',
    classGrade: 'Class 10–12',
    description:
      'Interact with an optical bench holding a convex lens. Drag the object along the principal axis to discover focal points, real inverted images, and virtual enlarged images.',
    learningObjectives: [
      'Verify the thin lens formula 1/f = 1/v - 1/u',
      'Observe transitions between real inverted and virtual upright images',
      'Measure linear magnification m = v / u',
    ],
    formula: '1/f = 1/v - 1/u',
    theoryPath: '/physics/Theory/Optics/Optics_Converging_Lens.html',
    tags: ['convex lens', 'focal point', 'lens formula', 'magnification', 'ray tracing'],
  },
  {
    id: 'optics-diverging-lens',
    filename: 'Optics_Diverging_Lens.html',
    title: 'Concave (Diverging) Lens',
    subtitle: 'Virtual, upright and diminished image characteristics',
    category: 'Optics',
    classGrade: 'Class 10–12',
    description:
      'Trace diverging light rays through a concave lens. Learn why concave lenses always form virtual, diminished, and erect images regardless of object position.',
    learningObjectives: [
      'Observe divergence of parallel rays from virtual focus',
      'Verify virtual image formation for all finite object distances',
      'Apply Cartesian sign conventions with negative focal length',
    ],
    formula: '1/f = 1/v - 1/u \\quad (f < 0)',
    theoryPath: '/physics/Theory/Optics/Optics_Diverging_Lens.html',
    tags: ['concave lens', 'diverging', 'virtual image', 'sign convention'],
  },
  {
    id: 'optics-converging-mirror',
    filename: 'Optics_Converging_Mirror.html',
    title: 'Concave Mirror Reflection',
    subtitle: 'Curved reflection, center of curvature, and focal plane',
    category: 'Optics',
    classGrade: 'Class 10–12',
    description:
      'Experiment with concave spherical mirrors. Move the object beyond C, at C, between C and F, and between F and P to observe real and virtual image transitions.',
    learningObjectives: [
      'Verify mirror formula 1/f = 1/v + 1/u',
      'Distinguish real focused images from virtual enlarged reflections',
      'Understand applications in solar concentrators and headlamps',
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
    classGrade: 'Class 10–12',
    description:
      'Discover why convex mirrors are deployed as rear-view mirrors in vehicles. Observe how light rays disperse to provide an expansive field of view.',
    learningObjectives: [
      'Demonstrate why convex mirrors always yield virtual diminished images',
      'Calculate field of view angle compared to plane mirrors',
      'Apply mirror sign convention for positive focal length mirrors',
    ],
    formula: 'm = -v/u < 1',
    tags: ['convex mirror', 'rear view', 'virtual image', 'field of view'],
  },
  {
    id: 'optics-reflection',
    filename: 'Optics_Reflection_of_Light.html',
    title: 'Laws of Reflection',
    subtitle: 'Incident ray, normal vector, and reflected ray coplanarity',
    category: 'Optics',
    classGrade: 'Class 9–10',
    description:
      'Adjust the angle of incidence in 3D space to verify that the angle of incidence strictly equals the angle of reflection, and both lie in the same plane.',
    learningObjectives: [
      'Verify law of reflection: \\theta_i = \\theta_r',
      'Understand normal vector perpendicular to reflecting surface',
      'Observe specular versus diffuse reflection principles',
    ],
    formula: '\\theta_i = \\theta_r',
    tags: ['reflection', 'mirror', 'angle of incidence', 'optics'],
  },
  {
    id: 'optics-refraction',
    filename: 'Optics_Refraction_of_Light.html',
    title: 'Refraction & Snell’s Law',
    subtitle: 'Light speed variation and ray deviation across media',
    category: 'Optics',
    classGrade: 'Class 10–12',
    description:
      'Direct light rays from air into glass, water, or oil. Measure angles of incidence and refraction to confirm Snell’s Law and calculate refractive index.',
    learningObjectives: [
      'Verify Snell’s Law n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2)',
      'Observe light ray bending toward normal in denser medium',
      'Measure critical angle and refractive index',
    ],
    formula: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2',
    tags: ['refraction', 'snells law', 'optical density', 'refractive index'],
  },
  {
    id: 'optics-tir',
    filename: 'Optics_Total_Internal_Reflection.html',
    title: 'Total Internal Reflection',
    subtitle: 'Critical angle and complete boundary reflection',
    category: 'Optics',
    classGrade: 'Class 12',
    description:
      'Increase the incident angle in a denser medium until light ceases to refract and undergoes 100% internal reflection. Fundamental to optical fiber communications.',
    learningObjectives: [
      'Identify critical angle \\theta_c = \\arcsin(n_2 / n_1)',
      'Observe evanescent waves and boundary reflection',
      'Understand fiber optics and prism periscopes',
    ],
    formula: '\\sin\\theta_c = n_2 / n_1',
    tags: ['total internal reflection', 'critical angle', 'fiber optics', 'tir'],
  },
  {
    id: 'optics-youngs-slit',
    filename: 'Optics_Young\'s_Double_Slit_Experiment.html',
    title: 'Young’s Double Slit Experiment',
    subtitle: 'Wavefront division and alternating dark/bright fringe patterns',
    category: 'Optics',
    classGrade: 'Class 12',
    description:
      'Recreate Thomas Young’s historic 1801 experiment that proved the wave nature of light. Vary slit separation d, screen distance D, and wavelength \\lambda to watch interference fringes shift.',
    learningObjectives: [
      'Observe constructive and destructive wave interference',
      'Measure fringe width \\beta = \\lambda D / d',
      'Understand path difference condition \\Delta x = n \\lambda',
    ],
    formula: '\\beta = \\frac{\\lambda D}{d}',
    tags: ['interference', 'double slit', 'wave optics', 'fringe width'],
  },
  {
    id: 'optics-apparent-depth',
    filename: 'Optics_Apparent_depth.html',
    title: 'Apparent Depth & Normal Shift',
    subtitle: 'Why underwater objects appear shallower than reality',
    category: 'Optics',
    classGrade: 'Class 10–12',
    description:
      'Observe the virtual shallowing of submerged objects due to light refraction at the water-air interface. Calculate refractive index from apparent vs real depth.',
    learningObjectives: [
      'Calculate refractive index \\mu = \\text{Real Depth} / \\text{Apparent Depth}',
      'Measure normal shift \\Delta t = t(1 - 1/\\mu)',
      'Explain coin-in-beaker and pencil-in-water optical illusions',
    ],
    formula: '\\mu = \\frac{\\text{Real Depth}}{\\text{Apparent Depth}}',
    tags: ['apparent depth', 'refraction', 'normal shift', 'water index'],
  },
  {
    id: 'optics-waves',
    filename: 'Optics_Understanding_Waves.html',
    title: 'Wave Dynamics & Harmonics',
    subtitle: 'Wavelength, frequency, amplitude, and phase relationships',
    category: 'Optics',
    classGrade: 'Class 11',
    description:
      'Visualize 3D harmonic sine waves propagating through space. Tweak frequency, phase velocity, and amplitude to study wave mechanics.',
    learningObjectives: [
      'Relate wave speed v = f \\lambda',
      'Distinguish transverse versus longitudinal oscillations',
      'Analyze phase difference and wave energy transfer',
    ],
    formula: 'v = f \\lambda',
    tags: ['waves', 'frequency', 'wavelength', 'amplitude', 'phase'],
  },

  // --- MECHANICS ---
  {
    id: 'mech-circular-motion',
    filename: 'Mechanics_Circular_Motion.html',
    title: 'Uniform Circular Motion & Loop',
    subtitle: 'Rollercoaster loop dynamics and centripetal acceleration',
    category: 'Mechanics',
    classGrade: 'Class 11',
    description:
      'Launch a 3D cart through a vertical rollercoaster loop. Toggle free body diagrams to inspect weight, normal force, and net centripetal acceleration vectors.',
    learningObjectives: [
      'Derive minimum velocity at top of vertical loop v = \\sqrt{g R}',
      'Inspect centripetal force F_c = m v^2 / r along 3D track',
      'Analyze conservation of mechanical energy between loop heights',
    ],
    formula: 'F_c = \\frac{m v^2}{r}',
    theoryPath: '/physics/Theory/Mechanics/Mechanics_Circular_Motion.html',
    tags: ['circular motion', 'centripetal force', 'rollercoaster', 'free body diagram'],
  },
  {
    id: 'mech-projectile',
    filename: 'Mechanics_Projectile_Motion.html',
    title: 'Projectile Motion Laboratory',
    subtitle: 'Parabolic trajectories, launch angle, and range optimization',
    category: 'Mechanics',
    classGrade: 'Class 11',
    description:
      'Fire projectile shells across a calibrated 3D range. Vary elevation angle, initial velocity, and platform launch height to measure flight time and maximum range.',
    learningObjectives: [
      'Verify independence of horizontal and vertical velocity components',
      'Find optimal launch angle \\theta = 45^\\circ for maximum range',
      'Derive maximum height H = (v_0 \\sin\\theta)^2 / 2g',
    ],
    formula: 'R = \\frac{v_0^2 \\sin(2\\theta)}{g}',
    theoryPath: '/physics/Theory/Mechanics/Mechanics_Projectile_Motion.html',
    tags: ['projectile', 'parabola', 'kinematics', 'range', 'flight time'],
  },
  {
    id: 'mech-banking',
    filename: 'Mechanics_Banking_on_a_Road.html',
    title: 'Banking of Road Curves',
    subtitle: 'Centripetal friction and safe vehicle turning velocities',
    category: 'Mechanics',
    classGrade: 'Class 11',
    description:
      'Inspect a car negotiating an inclined banked curve. Adjust road angle \\theta and coefficient of friction \\mu to discover optimal non-skid speeds.',
    learningObjectives: [
      'Derive safe velocity v = \\sqrt{R g \\tan\\theta} without friction',
      'Resolve normal force and friction components along inclined plane',
      'Determine minimum and maximum speed limits on wet vs dry roads',
    ],
    formula: 'v = \\sqrt{R g \\tan\\theta}',
    theoryPath: '/physics/Theory/Mechanics/Mechanics_Banking_on_a_Road.html',
    tags: ['banking', 'circular motion', 'friction', 'roads', 'inclined plane'],
  },
  {
    id: 'mech-pendulum',
    filename: 'Mechanics_Simple_Pendulum.html',
    title: 'Simple Harmonic Pendulum',
    subtitle: 'Oscillation period, string length, and gravity verification',
    category: 'Mechanics',
    classGrade: 'Class 11',
    description:
      'Release a pendulum bob from varying amplitudes. Measure oscillation period T, explore kinetic/potential energy transformations, and measure g.',
    learningObjectives: [
      'Confirm small-angle period T = 2\\pi \\sqrt{L / g}',
      'Verify independence of period from bob mass',
      'Track potential vs kinetic energy interchange curves',
    ],
    formula: 'T = 2\\pi \\sqrt{\\frac{L}{g}}',
    theoryPath: '/physics/Theory/Mechanics/Mechanics_Simple_Pendulum.html',
    tags: ['pendulum', 'shm', 'harmonic motion', 'gravity', 'period'],
  },
  {
    id: 'mech-spring',
    filename: 'Mechanics_Spring_Force.html',
    title: 'Hooke’s Law & Spring Oscillations',
    subtitle: 'Restoring force, spring stiffness k, and elastic energy',
    category: 'Mechanics',
    classGrade: 'Class 11',
    description:
      'Attach calibrated weights to a vertical coil spring. Measure displacement x to verify F = -kx, measure spring stiffness, and observe simple harmonic vibration.',
    learningObjectives: [
      'Verify Hooke’s Law F = -k x',
      'Derive oscillation frequency \\omega = \\sqrt{k / m}',
      'Calculate stored elastic potential energy U = \\frac{1}{2} k x^2',
    ],
    formula: 'F = -k x',
    theoryPath: '/physics/Theory/Mechanics/Mechanics_Spring_Force.html',
    tags: ['spring', 'hookes law', 'elasticity', 'shm', 'stiffness'],
  },
  {
    id: 'mech-gravitation-law',
    filename: 'Mechanics_Gravitation_Law.html',
    title: 'Universal Law of Gravitation',
    subtitle: 'Inverse square gravitational attraction between masses',
    category: 'Mechanics',
    classGrade: 'Class 9–11',
    description:
      'Position two massive spheres in 3D coordinate space. Modify their masses M1, M2 and separation distance r to see real-time gravitational force vectors scale.',
    learningObjectives: [
      'Confirm Newton’s inverse square law F \\propto 1/r^2',
      'Understand gravitational constant G = 6.674 \\times 10^{-11} \\text{ N m}^2/\\text{kg}^2',
      'Observe Newton’s third law equal and opposite mutual attraction',
    ],
    formula: 'F = G \\frac{m_1 m_2}{r^2}',
    theoryPath: '/physics/Theory/Mechanics/Mechanics_Gravitation_Law.html',
    tags: ['gravitation', 'newton', 'inverse square', 'mass', 'orbits'],
  },
  {
    id: 'mech-angular-momentum',
    filename: 'Mechanics_Conservation_of_Angular_Momentum.html',
    title: 'Conservation of Angular Momentum',
    subtitle: 'Moment of inertia variation and rotational speedup',
    category: 'Mechanics',
    classGrade: 'Class 11',
    description:
      'Observe rotating masses on an axle. Retract the weights inward to reduce moment of inertia I and observe instantaneous angular velocity \\omega spin surge.',
    learningObjectives: [
      'Verify conservation law I_1 \\omega_1 = I_2 \\omega_2 when net torque is zero',
      'Understand moment of inertia dependency on mass radial distribution',
      'Apply to planetary orbits, figure skating spins, and neutron stars',
    ],
    formula: 'L = I \\omega = \\text{constant}',
    tags: ['angular momentum', 'inertia', 'rotation', 'torque', 'conservation'],
  },
  {
    id: 'mech-torque',
    filename: 'Mechanics_Torque.html',
    title: 'Torque & Rotational Equilibrium',
    subtitle: 'Moment of force, lever arm length, and mechanical advantage',
    category: 'Mechanics',
    classGrade: 'Class 11',
    description:
      'Apply forces at various points along a lever beam. Explore how perpendicular distance r and force angle \\theta govern the net turning effect \\tau = r \\times F.',
    learningObjectives: [
      'Calculate torque \\tau = r F \\sin\\theta',
      'Distinguish clockwise vs counterclockwise rotational moments',
      'Establish conditions for static rotational equilibrium \\sum \\tau = 0',
    ],
    formula: '\\tau = r F \\sin\\theta',
    tags: ['torque', 'lever', 'equilibrium', 'rotation', 'moment'],
  },
  {
    id: 'mech-vector-algebra',
    filename: 'Mechanics_Vector_Algebra.html',
    title: '3D Vector Algebra & Operations',
    subtitle: 'Vector addition, dot products, and cross products in 3D',
    category: 'Mechanics',
    classGrade: 'Class 11',
    description:
      'Manipulate 3D vector arrows in space. Perform graphical addition via parallelogram law, calculate scalar dot product A · B, and cross product vector A × B.',
    learningObjectives: [
      'Visualize 3D components A_x, A_y, A_z',
      'Compute dot product \\vec{A} \\cdot \\vec{B} = |A||B| \\cos\\theta',
      'Determine direction of cross product \\vec{A} \\times \\vec{B} via right-hand rule',
    ],
    formula: '\\vec{A} \\times \\vec{B} = |A||B|\\sin\\theta \\,\\hat{n}',
    tags: ['vectors', 'cross product', 'dot product', 'algebra', 'components'],
  },
  {
    id: 'mech-kinematics-1d',
    filename: 'Mechanics_Motion_in_straight_line.html',
    title: '1D Kinematics & Acceleration',
    subtitle: 'Position, velocity, acceleration and equations of motion',
    category: 'Mechanics',
    classGrade: 'Class 9–11',
    description:
      'Control a particle moving along a linear track. Plot position-time, velocity-time, and acceleration-time curves under uniform and variable acceleration.',
    learningObjectives: [
      'Verify equations of motion v = u + at, s = ut + \\frac{1}{2}at^2, v^2 = u^2 + 2as',
      'Interpret slope of x-t graph as velocity and v-t graph as acceleration',
      'Compute area under v-t graph to obtain total displacement',
    ],
    formula: 'v^2 = u^2 + 2as',
    tags: ['kinematics', 'velocity', 'acceleration', 'displacement', '1d motion'],
  },

  // --- ELECTRICITY ---
  {
    id: 'elec-coulomb',
    filename: 'Electricity_Coulomb\'s_Law.html',
    title: 'Coulomb’s Law of Electrostatics',
    subtitle: 'Mutual force between point charges and distance scaling',
    category: 'Electricity',
    classGrade: 'Class 12',
    description:
      'Position positive and negative electrostatic charges in 3D. Inspect mutual attractive and repulsive force vectors scaling with charge magnitudes and separation r.',
    learningObjectives: [
      'Verify inverse-square electrostatic force F = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q_1 q_2}{r^2}',
      'Distinguish repulsive like charges from attractive opposite charges',
      'Observe Newton’s third law symmetry in electrostatic interactions',
    ],
    formula: 'F = \\frac{1}{4\\pi \\varepsilon_0} \\frac{q_1 q_2}{r^2}',
    tags: ['coulomb', 'electrostatics', 'charges', 'electric force', 'inverse square'],
  },
  {
    id: 'elec-field',
    filename: 'Electricity_The_Electric_Field.html',
    title: 'Electric Field Lines & Flux',
    subtitle: '3D vector field topology radiating from source charges',
    category: 'Electricity',
    classGrade: 'Class 12',
    description:
      'Place positive and negative charges to visualize emergent electric field vector lines, field line density, and test charge trajectory paths.',
    learningObjectives: [
      'Observe field lines originating at positive and terminating on negative charges',
      'Verify electric field strength E = F / q',
      'Inspect field density representing magnitude of electric field',
    ],
    formula: '\\vec{E} = \\frac{\\vec{F}}{q}',
    tags: ['electric field', 'flux', 'field lines', 'charge', 'vector field'],
  },
  {
    id: 'elec-capacitance',
    filename: 'Electricity_Understanding_Capacitance.html',
    title: 'Parallel Plate Capacitor',
    subtitle: 'Charge storage, plate geometry, and uniform E-field',
    category: 'Electricity',
    classGrade: 'Class 12',
    description:
      'Charge parallel conductive plates connected to a DC source. Observe surface charge density, uniform internal electric field lines, and stored electric potential energy.',
    learningObjectives: [
      'Verify capacitance formula C = \\varepsilon_0 A / d',
      'Understand relationship between voltage, charge, and capacitance Q = CV',
      'Calculate stored electrostatic energy U = \\frac{1}{2} C V^2',
    ],
    formula: 'C = \\frac{\\varepsilon_0 A}{d}',
    tags: ['capacitor', 'capacitance', 'dielectric', 'energy', 'voltage'],
  },
  {
    id: 'elec-factors-capacitance',
    filename: 'Electricity_Factors_Effecting_Capacitance.html',
    title: 'Factors Affecting Capacitance',
    subtitle: 'Plate surface area, separation distance, and dielectric slab',
    category: 'Electricity',
    classGrade: 'Class 12',
    description:
      'Dynamically change plate overlap area A, plate separation d, and insert dielectric slabs of dielectric constant \\kappa to measure capacitance variations.',
    learningObjectives: [
      'Observe capacitance increase with dielectric constant \\kappa',
      'Analyze effect of plate separation distance d on capacitance',
      'Examine charge vs voltage behavior with connected vs disconnected battery',
    ],
    formula: 'C = \\frac{\\kappa \\varepsilon_0 A}{d}',
    tags: ['capacitance', 'dielectric', 'plate area', 'separation', 'permittivity'],
  },
  {
    id: 'elec-inductance',
    filename: 'Electricity_Understanding_Inductance.html',
    title: 'Self & Mutual Inductance',
    subtitle: 'Magnetic flux linkage, solenoid coils, and Lenz back-EMF',
    category: 'Electricity',
    classGrade: 'Class 12',
    description:
      'Drive alternating currents through inductive solenoids. Visualize magnetic flux lines, back-EMF resisting current changes, and mutual inductive coupling.',
    learningObjectives: [
      'Verify Faraday’s and Lenz’s law for induced EMF \\mathcal{E} = -L \\frac{dI}{dt}',
      'Calculate solenoid self-inductance L = \\mu_0 n^2 A l',
      'Understand magnetic energy storage in inductive coils U = \\frac{1}{2} L I^2',
    ],
    formula: '\\mathcal{E} = -L \\frac{dI}{dt}',
    tags: ['inductance', 'solenoid', 'magnetic flux', 'back emf', 'lenz law'],
  },
  {
    id: 'elec-lc-oscillator',
    filename: 'Electricity_LC_Oscillator.html',
    title: 'LC Resonant Tank Circuit',
    subtitle: 'Harmonic energy oscillation between capacitor and inductor',
    category: 'Electricity',
    classGrade: 'Class 12',
    description:
      'Watch electric energy stored in capacitor plates surge into magnetic energy stored in an inductor coil and back, producing continuous electromagnetic oscillations.',
    learningObjectives: [
      'Derive resonant frequency \\omega_0 = 1 / \\sqrt{L C}',
      'Track 90-degree phase shift between circuit current and voltage',
      'Observe total electromagnetic energy conservation in ideal tank circuit',
    ],
    formula: 'f_0 = \\frac{1}{2\\pi \\sqrt{LC}}',
    tags: ['lc oscillator', 'resonance', 'tank circuit', 'ac circuits', 'frequency'],
  },
  {
    id: 'elec-three-charges-line',
    filename: 'Electricity_Three_Point_Charges_in_a_Line.html',
    title: 'Collinear Three-Charge System',
    subtitle: 'Superposition principle and electrostatic equilibrium points',
    category: 'Electricity',
    classGrade: 'Class 12',
    description:
      'Arrange three charges along a straight axis. Slide the central charge to find zero-net-force equilibrium null points and analyze stable vs unstable equilibrium.',
    learningObjectives: [
      'Apply principle of superposition for collinear electrostatic forces',
      'Identify null points where net electric field vector E_net = 0',
      'Distinguish stable and unstable equilibrium for perturbed test charges',
    ],
    formula: '\\vec{F}_{\\text{net}} = \\sum \\vec{F}_i',
    tags: ['superposition', 'equilibrium', 'null point', 'charges', 'electrostatics'],
  },

  // --- MAGNETISM ---
  {
    id: 'mag-hall-effect',
    filename: 'Magnetism_Hall_Effect.html',
    title: 'Hall Effect & Drift Velocity',
    subtitle: 'Transverse voltage generation across current-carrying slab',
    category: 'Magnetism',
    classGrade: 'Class 12',
    description:
      'Immerse a semiconductor conducting slab into a magnetic field. Watch mobile charge carriers deflect toward the slab edge, producing measurable transverse Hall voltage.',
    learningObjectives: [
      'Observe magnetic Lorentz force \\vec{F} = q(\\vec{v}_d \\times \\vec{B})',
      'Measure Hall voltage V_H = I B / (n q t)',
      'Determine majority charge carrier type (electrons vs holes) from sign of V_H',
    ],
    formula: 'V_H = \\frac{I B}{n q t}',
    theoryPath: '/physics/Theory/Magnetism/Magnetism_Hall_Effect.html',
    tags: ['hall effect', 'lorentz force', 'drift velocity', 'magnetism', 'carriers'],
  },
  {
    id: 'mag-conductor-force',
    filename: 'Magnetism_Force_on_a_Current_Carrying_Conductor.html',
    title: 'Magnetic Force on Current Wire',
    subtitle: 'Lorentz force on conductors F = I(L × B)',
    category: 'Magnetism',
    classGrade: 'Class 10–12',
    description:
      'Suspend a flexible current-carrying wire between the poles of a horseshoe magnet. Reverse current direction or magnetic field to observe directional deflection.',
    learningObjectives: [
      'Verify magnetic force formula F = I L B \\sin\\theta',
      'Apply Fleming’s Left Hand Rule for motors',
      'Understand the foundational principle of electric motors and galvanometers',
    ],
    formula: '\\vec{F} = I (\\vec{L} \\times \\vec{B})',
    tags: ['motor force', 'flemings rule', 'conductor', 'magnetic field', 'lorentz'],
  },
  {
    id: 'mag-fleming-thumb',
    filename: 'Magnetism_Fleming\'s_Thumb_Rule.html',
    title: 'Right-Hand Thumb Rule',
    subtitle: 'Concentric magnetic field circles around straight wire',
    category: 'Magnetism',
    classGrade: 'Class 10–12',
    description:
      'Grasp a straight current-carrying wire with your virtual right hand. See how thumb along current direction curl fingers into circular magnetic field loops.',
    learningObjectives: [
      'Determine magnetic field direction around straight conductors',
      'Verify Biot-Savart law field strength B = \\mu_0 I / (2\\pi r)',
      'Understand magnetic field superposition in multi-wire systems',
    ],
    formula: 'B = \\frac{\\mu_0 I}{2\\pi r}',
    tags: ['right hand rule', 'thumb rule', 'magnetic field', 'current wire'],
  },
  {
    id: 'mag-induction',
    filename: 'Magnetism_Electromagnetic_Induction.html',
    title: 'Electromagnetic Induction',
    subtitle: 'Moving bar magnet into solenoid coil with galvanometer',
    category: 'Magnetism',
    classGrade: 'Class 10–12',
    description:
      'Plunge a cylindrical bar magnet into a helical coil. Watch the galvanometer needle deflect proportional to relative speed, verifying Faraday’s and Lenz’s laws.',
    learningObjectives: [
      'Demonstrate Faraday’s law of induction \\mathcal{E} = -N \\frac{d\\Phi_B}{dt}',
      'Verify Lenz’s law: induced current opposes magnetic motion',
      'Show that stationary magnets produce zero induced EMF regardless of field strength',
    ],
    formula: '\\mathcal{E} = -N \\frac{d\\Phi_B}{dt}',
    tags: ['induction', 'faradays law', 'lenzs law', 'galvanometer', 'solenoid'],
  },
  {
    id: 'mag-lorentz-force',
    filename: 'Magnetism_Understanding_Lorentz_Force.html',
    title: 'Lorentz Force & Helical Motion',
    subtitle: 'Trajectory of charged particles in crossed electric & magnetic fields',
    category: 'Magnetism',
    classGrade: 'Class 12',
    description:
      'Inject charged particles into uniform electric and magnetic fields. Observe straight velocity selector trajectories, circular cyclotron orbits, and 3D helical spirals.',
    learningObjectives: [
      'Apply comprehensive Lorentz equation \\vec{F} = q(\\vec{E} + \\vec{v} \\times \\vec{B})',
      'Calculate cyclotron radius r = m v / (q B)',
      'Analyze helical pitch when velocity has component parallel to B-field',
    ],
    formula: 'r = \\frac{m v}{q B}',
    tags: ['lorentz force', 'cyclotron', 'helical motion', 'magnetic deflection'],
  },
  {
    id: 'mag-motional-emf',
    filename: 'Magnetism_Motional_EMF.html',
    title: 'Motional EMF on Conducting Rails',
    subtitle: 'Sliding conductor rod in uniform perpendicular B-field',
    category: 'Magnetism',
    classGrade: 'Class 12',
    description:
      'Slide a conductive rod across parallel copper rails in a magnetic field. Measure induced voltage across the rails and mechanical force needed to sustain speed.',
    learningObjectives: [
      'Derive motional EMF \\mathcal{E} = B v l',
      'Calculate retarding magnetic force F = B^2 l^2 v / R',
      'Verify conservation of mechanical energy transformed into electrical Joule heat',
    ],
    formula: '\\mathcal{E} = B v l',
    tags: ['motional emf', 'rails', 'faraday', 'conductors', 'magnetic field'],
  },

  // --- THERMODYNAMICS & FLUIDS ---
  {
    id: 'thermo-pascal',
    filename: 'Thermodynamics_Pascal\'s_Law.html',
    title: 'Pascal’s Law & Hydraulic Lift',
    subtitle: 'Undiminished pressure transmission lifting heavy vehicles',
    category: 'Thermodynamics',
    classGrade: 'Class 11',
    description:
      'Operate an interactive 3D hydraulic car lift. Apply small input force on narrow piston A1 to generate immense lifting force on large piston A2 via liquid pressure.',
    learningObjectives: [
      'Verify Pascal’s principle: P_1 = P_2 \\implies F_1 / A_1 = F_2 / A_2',
      'Calculate mechanical advantage MA = A_2 / A_1',
      'Confirm conservation of work: F_1 d_1 = F_2 d_2',
    ],
    formula: '\\frac{F_1}{A_1} = \\frac{F_2}{A_2}',
    theoryPath: '/physics/Theory/Thermodynamics/Thermodynamics_Pascal\'s_Law.html',
    tags: ['pascals law', 'hydraulic lift', 'pressure', 'fluids', 'mechanics'],
  },
  {
    id: 'thermo-buoyancy',
    filename: 'Thermodynamics_Buoyant_Force.html',
    title: 'Archimedes’ Principle & Buoyancy',
    subtitle: 'Weight of displaced fluid and floatation equilibrium',
    category: 'Thermodynamics',
    classGrade: 'Class 9–11',
    description:
      'Submerge blocks of various materials (wood, aluminium, lead) into liquid baths. Measure apparent weight loss and compare with volume of displaced liquid.',
    learningObjectives: [
      'Verify Archimedes’ principle: F_b = \\rho_{\\text{fluid}} V g',
      'Predict sinking versus floating from relative densities \\rho_{\\text{body}} / \\rho_{\\text{fluid}}',
      'Measure apparent submerged weight W_{\\text{app}} = W_{\\text{actual}} - F_b',
    ],
    formula: 'F_b = \\rho_{\\text{fluid}} V_{\\text{disp}} g',
    theoryPath: '/physics/Theory/Thermodynamics/Thermodynamics_Buoyant_Force.html',
    tags: ['buoyancy', 'archimedes', 'fluids', 'density', 'floatation'],
  },
  {
    id: 'thermo-ideal-gas',
    filename: 'Thermodynamics_Ideal_Gas_Equation.html',
    title: 'Ideal Gas Law PV = nRT',
    subtitle: 'Interactive pressure, volume, temperature and particle count',
    category: 'Thermodynamics',
    classGrade: 'Class 11',
    description:
      'Heat, compress, or pump gas molecules inside a sealed chamber. Watch pressure gauge, thermometer, and piston volume change in strict adherence to PV = nRT.',
    learningObjectives: [
      'Verify Boyle’s law (P \\propto 1/V at constant T)',
      'Verify Charles’s law (V \\propto T at constant P)',
      'Understand universal gas constant R = 8.314 \\text{ J/(mol K)}',
    ],
    formula: 'P V = n R T',
    theoryPath: '/physics/Theory/Thermodynamics/Thermodynamics_Ideal_Gas_Equation.html',
    tags: ['ideal gas', 'pv=nrt', 'gas laws', 'pressure', 'temperature', 'volume'],
  },
  {
    id: 'thermo-kinetic-theory',
    filename: 'Thermodynamics_Kinetic_Theory_of_Gases.html',
    title: 'Kinetic Theory of Gases',
    subtitle: 'Molecular speeds, elastic collisions, and thermal energy',
    category: 'Thermodynamics',
    classGrade: 'Class 11',
    description:
      'Peer inside a gas container to track individual molecular collisions with chamber walls. Observe how temperature directly dictates root-mean-square speed v_rms.',
    learningObjectives: [
      'Relate temperature to average translational kinetic energy E_k = \\frac{3}{2} k_B T',
      'Calculate root-mean-square molecular speed v_{\\text{rms}} = \\sqrt{3RT / M}',
      'Derive pressure from momentum transfer during wall collisions',
    ],
    formula: 'v_{\\text{rms}} = \\sqrt{\\frac{3 k_B T}{m}}',
    theoryPath: '/physics/Theory/Thermodynamics/Thermodynamics_Kinetic_Theory_of_Gases.html',
    tags: ['kinetic theory', 'molecules', 'vrms', 'boltzmann', 'collisions'],
  },
  {
    id: 'thermo-torricelli',
    filename: 'Thermodynamics_Torricellis_Law.html',
    title: 'Torricelli’s Law of Efflux',
    subtitle: 'Liquid exit velocity and horizontal jet trajectory',
    category: 'Thermodynamics',
    classGrade: 'Class 11',
    description:
      'Puncture an orifice at depth h below the water surface of a tank. Measure efflux stream velocity and track parabolic water jet trajectory landing distance.',
    learningObjectives: [
      'Derive Torricelli efflux velocity v = \\sqrt{2 g h} from Bernoulli’s theorem',
      'Calculate range of effluent water jet R = 2 \\sqrt{h (H - h)}',
      'Observe maximum horizontal trajectory when orifice is at tank mid-height H/2',
    ],
    formula: 'v = \\sqrt{2 g h}',
    tags: ['torricelli', 'efflux', 'bernoulli', 'fluids', 'orifice'],
  },
  {
    id: 'thermo-hot-air-balloon',
    filename: 'Thermodynamics_Hot_Air_Balloon.html',
    title: 'Thermal Expansion & Buoyant Flight',
    subtitle: 'Hot air density reduction enabling aerial ascent',
    category: 'Thermodynamics',
    classGrade: 'Class 11',
    description:
      'Fire the gas burner beneath a hot air balloon. Watch internal air temperature rise, density drop below surrounding atmospheric air, and generate net buoyant lift.',
    learningObjectives: [
      'Understand relationship between air temperature and density \\rho = P M / (R T)',
      'Calculate net lifting force F_{\\text{net}} = (\\rho_{\\text{cold}} - \\rho_{\\text{hot}}) V g - W_{\\text{balloon}}',
      'Observe equilibrium hovering altitude conditions',
    ],
    formula: '\\rho = \\frac{P M}{R T}',
    theoryPath: '/physics/Theory/Thermodynamics/Thermodynamics_hot_air_balloon.html',
    tags: ['hot air balloon', 'thermal expansion', 'buoyancy', 'density', 'lift'],
  },

  // --- QUANTUM & MODERN PHYSICS ---
  {
    id: 'quantum-photoelectric',
    filename: 'Quantum_Photoelectric_Effect.html',
    title: 'The Photoelectric Effect',
    subtitle: 'Photon packets, stopping potential, and threshold frequency',
    category: 'Quantum',
    classGrade: 'Class 12',
    description:
      'Shine monochromatic light onto a metal cathode inside a vacuum tube. Adjust light wavelength \\lambda, intensity, and retarding voltage to verify Einstein’s photon hypothesis.',
    learningObjectives: [
      'Confirm Einstein’s photoelectric equation K_{\\text{max}} = h \\nu - \\Phi',
      'Observe immediate electron emission without wave-theory time lag',
      'Measure stopping potential V_0 and determine Planck’s constant h',
    ],
    formula: 'h \\nu = \\Phi + e V_0',
    theoryPath: '/physics/Theory/Quantum/Quantum_Photoelectric_Effect.html',
    tags: ['photoelectric', 'quantum', 'einstein', 'photon', 'stopping potential'],
  },
  {
    id: 'quantum-bohr-atom',
    filename: 'Quantum_The_Bohr_Atom.html',
    title: 'Bohr Model of Hydrogen Atom',
    subtitle: 'Quantized electron orbits and angular momentum conditions',
    category: 'Quantum',
    classGrade: 'Class 12',
    description:
      'Step through quantized circular orbits n = 1, 2, 3, 4 of a hydrogen electron. Observe orbital radius scaling r_n \\propto n^2 and discrete orbital energy levels.',
    learningObjectives: [
      'Verify Bohr postulate of angular momentum L = n \\frac{h}{2\\pi}',
      'Calculate orbital radius r_n = 0.529 \\times n^2 \\text{ Å}',
      'Understand non-radiating stationary energy states',
    ],
    formula: 'L = n \\frac{h}{2\\pi}, \\quad E_n = -\\frac{13.6}{n^2} \\text{ eV}',
    tags: ['bohr model', 'hydrogen', 'energy levels', 'quantum orbits', 'planck'],
  },
  {
    id: 'quantum-hydrogen-spectrum',
    filename: 'Quantum_Hydrogen_Atom.html',
    title: 'Hydrogen Emission Spectra',
    subtitle: 'Lyman, Balmer, and Paschen spectral series emission lines',
    category: 'Quantum',
    classGrade: 'Class 12',
    description:
      'Trigger electron transitions between quantum shells. Watch emitted photons generate corresponding colored spectral lines on the Rydberg emission spectrometer.',
    learningObjectives: [
      'Verify Rydberg formula 1/\\lambda = R_H (1/n_1^2 - 1/n_2^2)',
      'Identify visible Balmer series (n_1 = 2) emission lines (H-\\alpha, H-\\beta)',
      'Relate photon wavelength directly to energy level gap \\Delta E = h c / \\lambda',
    ],
    formula: '\\frac{1}{\\lambda} = R_H \\left( \\frac{1}{n_1^2} - \\frac{1}{n_2^2} \\right)',
    tags: ['spectral lines', 'balmer', 'lyman', 'rydberg', 'emission', 'hydrogen'],
  },
  {
    id: 'quantum-cathode-rays',
    filename: 'Quantum_Cathode_Rays_The_Electrons.html',
    title: 'Cathode Rays & Electron Discovery',
    subtitle: 'J.J. Thomson’s e/m charge-to-mass ratio experiment',
    category: 'Quantum',
    classGrade: 'Class 12',
    description:
      'Fire high-velocity electron cathode rays through crossed electric and magnetic deflection plates. Balance electrostatic and magnetic forces to discover the electron.',
    learningObjectives: [
      'Trace cathode ray beam deflection in electric and magnetic fields',
      'Derive charge-to-mass ratio e/m from beam deflection angles',
      'Understand foundational experiments that established subatomic particle physics',
    ],
    formula: '\\frac{e}{m} = \\frac{E}{B^2 r}',
    tags: ['cathode ray', 'electron', 'thomson', 'e/m ratio', 'deflection'],
  },
];
