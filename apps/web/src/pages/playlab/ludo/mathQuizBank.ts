import { MathQuestion, GradeCategory } from './types';

export const COMPREHENSIVE_QUESTIONS_BANK: MathQuestion[] = [
  // ----------------------------------------------------
  // CLASSES 1 - 4 (Primary & Foundational Math)
  // ----------------------------------------------------
  {
    id: 'p1',
    question: 'What is 15 + 28?',
    options: ['41', '43', '42', '45'],
    correctIndex: 1,
    grade: 'Class 3',
    topic: 'Addition',
    explanation: '15 + 28 = 15 + 20 + 8 = 35 + 8 = 43.',
  },
  {
    id: 'p2',
    question: 'What is 9 × 7?',
    options: ['54', '63', '72', '56'],
    correctIndex: 1,
    grade: 'Class 4',
    topic: 'Multiplication',
    explanation: '9 multiplied by 7 equals 63.',
  },
  {
    id: 'p3',
    question: 'How many sides does a hexagon have?',
    options: ['5', '6', '7', '8'],
    correctIndex: 1,
    grade: 'Class 3',
    topic: 'Geometry',
    explanation: 'A hexagon is a 2D geometric polygon that has 6 sides and 6 vertices.',
  },
  {
    id: 'p4',
    question: 'What is 100 - 37?',
    options: ['63', '73', '57', '67'],
    correctIndex: 0,
    grade: 'Class 3',
    topic: 'Subtraction',
    explanation: '100 - 37 = 63.',
  },
  {
    id: 'p5',
    question: 'Riya has 4 boxes. Each box has 6 mangoes. How many mangoes in total?',
    options: ['20', '24', '28', '22'],
    correctIndex: 1,
    grade: 'Class 4',
    topic: 'Word Problems',
    explanation: 'Total mangoes = 4 boxes × 6 mangoes = 24 mangoes.',
  },
  {
    id: 'p6',
    question: 'Which of these numbers is an even number?',
    options: ['17', '29', '34', '51'],
    correctIndex: 2,
    grade: 'Class 2',
    topic: 'Number Sense',
    explanation: '34 ends with digit 4, making it divisible by 2 and an even number.',
  },
  {
    id: 'p7',
    question: 'What is 84 ÷ 4?',
    options: ['21', '22', '19', '24'],
    correctIndex: 0,
    grade: 'Class 4',
    topic: 'Division',
    explanation: '80 ÷ 4 = 20, and 4 ÷ 4 = 1. Therefore, 20 + 1 = 21.',
  },
  {
    id: 'p8',
    question: 'How many minutes are there in 2 hours?',
    options: ['100 mins', '120 mins', '140 mins', '90 mins'],
    correctIndex: 1,
    grade: 'Class 3',
    topic: 'Time & Measurement',
    explanation: '1 hour = 60 minutes. 2 hours = 2 × 60 = 120 minutes.',
  },

  // ----------------------------------------------------
  // CLASSES 5 - 6 (Foundational Middle School)
  // ----------------------------------------------------
  {
    id: 'm1',
    question: 'What is the sum of 3/4 + 1/2 in simplest form?',
    options: ['4/6', '5/4', '1', '7/4'],
    correctIndex: 1,
    grade: 'Class 6',
    topic: 'Fractions',
    explanation: 'Find common denominator 4: 1/2 = 2/4. Then 3/4 + 2/4 = 5/4 (or 1 1/4).',
  },
  {
    id: 'm2',
    question: 'What is 25% of 160?',
    options: ['30', '40', '50', '45'],
    correctIndex: 1,
    grade: 'Class 6',
    topic: 'Percentages',
    explanation: '25% = 1/4. 1/4 of 160 = 160 ÷ 4 = 40.',
  },
  {
    id: 'm3',
    question: 'What is the LCM of 12 and 18?',
    options: ['24', '36', '72', '48'],
    correctIndex: 1,
    grade: 'Class 5',
    topic: 'Factors & Multiples',
    explanation: 'Multiples of 18 are 18, 36. 36 is also divisible by 12 (12 × 3 = 36). So LCM = 36.',
  },
  {
    id: 'm4',
    question: 'Calculate the perimeter of a rectangle with length 14 cm and breadth 6 cm.',
    options: ['20 cm', '40 cm', '84 cm', '28 cm'],
    correctIndex: 1,
    grade: 'Class 5',
    topic: 'Mensuration',
    explanation: 'Perimeter = 2 × (Length + Breadth) = 2 × (14 + 6) = 2 × 20 = 40 cm.',
  },
  {
    id: 'm5',
    question: 'What is (-15) + (-8)?',
    options: ['-7', '23', '-23', '7'],
    correctIndex: 2,
    grade: 'Class 6',
    topic: 'Integers',
    explanation: 'Adding two negative integers yields a negative result: -(15 + 8) = -23.',
  },
  {
    id: 'm6',
    question: 'Convert 0.75 into a fraction in lowest terms.',
    options: ['7/10', '3/4', '4/5', '15/20'],
    correctIndex: 1,
    grade: 'Class 6',
    topic: 'Decimals',
    explanation: '0.75 = 75/100. Dividing numerator and denominator by 25 gives 3/4.',
  },
  {
    id: 'm7',
    question: 'What is the HCF (GCD) of 36 and 48?',
    options: ['6', '8', '12', '16'],
    correctIndex: 2,
    grade: 'Class 5',
    topic: 'Factors & Multiples',
    explanation: 'Factors of 36: 1, 2, 3, 4, 6, 9, 12, 18, 36. Factors of 48: 1, 2, 3, 4, 6, 8, 12, 16, 24, 48. Greatest common factor is 12.',
  },

  // ----------------------------------------------------
  // CLASSES 7 - 8 (Middle School Advanced)
  // ----------------------------------------------------
  {
    id: 's1',
    question: 'Solve for x: 3x - 7 = 14',
    options: ['x = 5', 'x = 7', 'x = 8', 'x = 6'],
    correctIndex: 1,
    grade: 'Class 7',
    topic: 'Linear Equations',
    explanation: 'Add 7 to both sides: 3x = 21. Divide by 3: x = 7.',
  },
  {
    id: 's2',
    question: 'What is the value of √289?',
    options: ['13', '17', '19', '15'],
    correctIndex: 1,
    grade: 'Class 8',
    topic: 'Squares & Roots',
    explanation: '17 × 17 = 289. Therefore, √289 = 17.',
  },
  {
    id: 's3',
    question: 'If the angles of a triangle are in the ratio 2:3:4, find the largest angle.',
    options: ['60°', '80°', '90°', '75°'],
    correctIndex: 1,
    grade: 'Class 7',
    topic: 'Triangles',
    explanation: 'Total ratio parts = 2 + 3 + 4 = 9. 180° ÷ 9 = 20°. Largest angle = 4 × 20° = 80°.',
  },
  {
    id: 's4',
    question: 'Simplify: (2³ × 2⁴) ÷ 2⁵',
    options: ['2', '4', '8', '16'],
    correctIndex: 1,
    grade: 'Class 8',
    topic: 'Exponents',
    explanation: 'By law of indices: 2^(3 + 4 - 5) = 2^2 = 4.',
  },
  {
    id: 's5',
    question: 'Find the Simple Interest on ₹2000 at 5% per annum for 3 years.',
    options: ['₹250', '₹300', '₹350', '₹400'],
    correctIndex: 1,
    grade: 'Class 7',
    topic: 'Commercial Math',
    explanation: 'SI = (P × R × T) / 100 = (2000 × 5 × 3) / 100 = 30000 / 100 = ₹300.',
  },
  {
    id: 's6',
    question: 'A car travels 180 km in 3 hours. How far does it travel in 5 hours at the same speed?',
    options: ['280 km', '300 km', '320 km', '350 km'],
    correctIndex: 1,
    grade: 'Class 7',
    topic: 'Direct Proportion',
    explanation: 'Speed = 180 ÷ 3 = 60 km/h. Distance in 5 hours = 60 × 5 = 300 km.',
  },
  {
    id: 's7',
    question: 'What is the sum of interior angles of a pentagon?',
    options: ['360°', '540°', '720°', '450°'],
    correctIndex: 1,
    grade: 'Class 8',
    topic: 'Polygons',
    explanation: 'Formula: (n - 2) × 180° = (5 - 2) × 180° = 3 × 180° = 540°.',
  },

  // ----------------------------------------------------
  // CLASSES 9 - 10 (Secondary High School)
  // ----------------------------------------------------
  {
    id: 'h1',
    question: 'Find the roots of the quadratic equation: x² - 5x + 6 = 0',
    options: ['2 and 3', '-2 and -3', '1 and 6', '-1 and 6'],
    correctIndex: 0,
    grade: 'Class 10',
    topic: 'Quadratic Equations',
    explanation: 'Factorizing: (x - 2)(x - 3) = 0. Therefore, x = 2 and x = 3.',
  },
  {
    id: 'h2',
    question: 'If sin θ = 3/5, what is the value of cos θ (for acute angle θ)?',
    options: ['4/5', '3/4', '5/4', '5/3'],
    correctIndex: 0,
    grade: 'Class 10',
    topic: 'Trigonometry',
    explanation: 'Using identity sin²θ + cos²θ = 1: cos²θ = 1 - (9/25) = 16/25. Therefore cos θ = 4/5.',
  },
  {
    id: 'h3',
    question: 'What is the distance between the points (0, 0) and (6, 8)?',
    options: ['12', '10', '14', '9'],
    correctIndex: 1,
    grade: 'Class 10',
    topic: 'Coordinate Geometry',
    explanation: 'Distance = √((6 - 0)² + (8 - 0)²) = √(36 + 64) = √100 = 10 units.',
  },
  {
    id: 'h4',
    question: 'A fair die is rolled once. What is the probability of rolling a prime number?',
    options: ['1/3', '1/2', '2/3', '1/6'],
    correctIndex: 1,
    grade: 'Class 10',
    topic: 'Probability',
    explanation: 'The prime numbers on a die are {2, 3, 5} (3 outcomes out of 6). Probability = 3/6 = 1/2.',
  },
  {
    id: 'h5',
    question: 'Find the 10th term of the AP: 2, 7, 12, 17...',
    options: ['45', '47', '50', '52'],
    correctIndex: 1,
    grade: 'Class 10',
    topic: 'Arithmetic Progressions',
    explanation: 'a = 2, d = 5. a_10 = a + 9d = 2 + 9(5) = 2 + 45 = 47.',
  },
  {
    id: 'h6',
    question: 'If the radius of a sphere is doubled, its volume increases by how many times?',
    options: ['2 times', '4 times', '8 times', '16 times'],
    correctIndex: 2,
    grade: 'Class 9',
    topic: 'Surface Area & Volume',
    explanation: 'Volume V = (4/3)πr³. If r becomes 2r, new volume = (4/3)π(2r)³ = 8 × V (8 times).',
  },
  {
    id: 'h7',
    question: 'Simplify: (x + 3)(x - 3)',
    options: ['x² + 9', 'x² - 9', 'x² - 6x + 9', 'x² - 3'],
    correctIndex: 1,
    grade: 'Class 9',
    topic: 'Algebraic Identities',
    explanation: 'Using identity (a + b)(a - b) = a² - b²: (x + 3)(x - 3) = x² - 9.',
  },
  {
    id: 'p8',
    question: 'What is 45 ÷ 5?',
    options: ['7', '8', '9', '10'],
    correctIndex: 2,
    grade: 'Class 3',
    topic: 'Division',
    explanation: '45 divided by 5 equals 9 because 5 × 9 = 45.',
  },
  {
    id: 'p9',
    question: 'How many minutes are there in 2.5 hours?',
    options: ['120', '140', '150', '180'],
    correctIndex: 2,
    grade: 'Class 4',
    topic: 'Time & Measurements',
    explanation: '1 hour = 60 minutes. 2.5 hours = 2 × 60 + 30 = 150 minutes.',
  },
  {
    id: 'f8',
    question: 'What is the Lowest Common Multiple (LCM) of 12 and 18?',
    options: ['24', '36', '48', '72'],
    correctIndex: 1,
    grade: 'Class 6',
    topic: 'Factors & Multiples',
    explanation: 'Multiples of 18: 18, 36... Multiples of 12: 12, 24, 36. The smallest common multiple is 36.',
  },
  {
    id: 'm8',
    question: 'Solve for x: 2x - 7 = 15',
    options: ['10', '11', '12', '14'],
    correctIndex: 1,
    grade: 'Class 7',
    topic: 'Linear Equations',
    explanation: '2x = 15 + 7 = 22. Therefore x = 22 / 2 = 11.',
  },
  {
    id: 'h8',
    question: 'In a right triangle with perpendicular legs 6 cm and 8 cm, what is the hypotenuse?',
    options: ['9 cm', '10 cm', '12 cm', '14 cm'],
    correctIndex: 1,
    grade: 'Class 9',
    topic: 'Pythagorean Theorem',
    explanation: 'By Pythagoras theorem: c = √(6² + 8²) = √(36 + 64) = √100 = 10 cm.',
  },
];

/**
 * Filters question bank based on selected NCERT grade category.
 */
export function getFilteredQuestions(gradeCategory: GradeCategory): MathQuestion[] {
  if (gradeCategory === 'primary') {
    return COMPREHENSIVE_QUESTIONS_BANK.filter(
      (q) => q.grade === 'Class 2' || q.grade === 'Class 3' || q.grade === 'Class 4'
    );
  }
  if (gradeCategory === 'foundational') {
    return COMPREHENSIVE_QUESTIONS_BANK.filter(
      (q) => q.grade === 'Class 5' || q.grade === 'Class 6'
    );
  }
  if (gradeCategory === 'middle') {
    return COMPREHENSIVE_QUESTIONS_BANK.filter(
      (q) => q.grade === 'Class 7' || q.grade === 'Class 8'
    );
  }
  if (gradeCategory === 'high') {
    return COMPREHENSIVE_QUESTIONS_BANK.filter(
      (q) => q.grade === 'Class 9' || q.grade === 'Class 10'
    );
  }
  return COMPREHENSIVE_QUESTIONS_BANK;
}

/**
 * Selects a random question from the filtered grade pool.
 */
export function getRandomQuestion(
  gradeCategory: GradeCategory,
  previousQuestionId?: string
): MathQuestion {
  const pool = getFilteredQuestions(gradeCategory);
  if (pool.length === 0) return COMPREHENSIVE_QUESTIONS_BANK[0];
  if (pool.length === 1) return pool[0];

  // Try picking a different question than previous if possible
  let chosen = pool[Math.floor(Math.random() * pool.length)];
  let attempts = 0;
  while (chosen.id === previousQuestionId && attempts < 5) {
    chosen = pool[Math.floor(Math.random() * pool.length)];
    attempts++;
  }

  return chosen;
}
