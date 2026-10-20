import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Award,
  Terminal,
  ExternalLink,
  Layers,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  FileCode,
  Zap,
  RefreshCw,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { runWithPiston, buildHtmlSrcdoc, normalizeOutput } from '../../services/codeRunner';
import { useProgressStore } from '../../stores/progressStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

export interface LessonSection {
  title: string;
  icon?: string;
  badge?: string;
  body: string;
  codeSnippet?: string;
  takeaway?: string;
}

export interface LessonQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  class: string;
  duration: string;
  language: 'python' | 'javascript' | 'html';
  summary: string;
  sections: LessonSection[];
  quiz: LessonQuiz;
  exampleCode: string;
  exampleExplanation?: string;
  exerciseGoal: string;
  exerciseCode: string;
  expectedOutput: string;
  hints: string[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    title: '1. Python Basics: Variables and Print',
    class: 'Class 6-8',
    duration: '10 mins',
    language: 'python',
    summary: 'Master dynamic variable declaration, standard primitive data types, and formatted print output with f-strings.',
    sections: [
      {
        title: 'Dynamic Variables & Memory Assignment',
        icon: '📦',
        badge: 'Core Concept',
        body: 'In Python, a variable is an intuitive label pointing to a value stored in computer memory. Unlike C++ or Java, Python does not require variable type declarations like "int" or "var". Variables spring to life the exact moment you assign a value to them using the assignment operator (=).',
        codeSnippet: `# Assigning values dynamically
student_name = "Aarav"
grade = 8
is_active = True`,
        takeaway: 'Variable names must start with a letter (a-z, A-Z) or underscore (_). They can never start with a digit!',
      },
      {
        title: 'Fundamental Primitive Data Types',
        icon: '🏷️',
        badge: 'Types & Schema',
        body: 'Python automatically infers data types based on the literal value you write. The four standard primitives used across all CBSE programs are String (str) for text, Integer (int) for whole numbers, Float (float) for decimals, and Boolean (bool) for True/False decisions.',
        codeSnippet: `name = "Vidya"     # str (string)
score = 98.5       # float (floating point decimal)
roll_no = 24       # int (integer)
enrolled = True    # bool (boolean)`,
        takeaway: 'Use type(variable_name) anytime in Python to inspect the underlying data type.',
      },
      {
        title: 'Modern Print Formatting with f-strings',
        icon: '⚡',
        badge: 'Output Engine',
        body: 'Formatted string literals (f-strings) are the gold standard for output in modern Python. By prefixing your quotation marks with "f", you can seamlessly inject variables and calculations directly inside curly brackets {expression}.',
        codeSnippet: `item = "Notebook"
price = 45.0
qty = 3
print(f"Total cost for {qty} {item}s: Rs {price * qty}")`,
        takeaway: 'Inside {value:.2f}, the ".2f" specifier formats decimal numbers rounded to exactly two decimal places.',
      },
    ],
    quiz: {
      question: 'Which of the following is an INVALID variable name in Python?',
      options: ['user_score', '2nd_student', '_counter', 'totalScore'],
      correctIndex: 1,
      explanation: 'Variable names in Python cannot begin with a number (0-9). They must start with a letter or an underscore.',
    },
    exampleCode: `# Python Variables and Print Formatting
student_name = "Aarav"
grade = 8
score = 94.5
is_enrolled = True

# Formatted output with f-strings
print(f"Student Name: {student_name}")
print(f"Class/Grade : {grade}")
print(f"Exam Score  : {score}%")
print(f"Enrolled    : {is_enrolled}")
`,
    exampleExplanation: 'Notice how f-strings cleanly concatenate text and variables without messy string conversions or plus signs.',
    exerciseGoal:
      'Given radius = 7 and pi = 3.14159, calculate the area of the circle using the formula (pi * radius^2). Print exactly: "Area of circle: 153.94" rounded to 2 decimal places.',
    exerciseCode: `# Task: Calculate and print the area of the circle
radius = 7
pi = 3.14159

# Calculate area (formula: pi * radius ** 2)
# Print exactly: "Area of circle: 153.94"
`,
    expectedOutput: 'Area of circle: 153.94',
    hints: [
      'In Python, the exponentiation operator is `**`. Example: `radius ** 2`.',
      'Use the built-in round function: `area = round(pi * (radius ** 2), 2)`.',
      'Print with: `print(f"Area of circle: {area:.2f}")` or `print(f"Area of circle: {round(area, 2)}")`.',
    ],
  },
  {
    id: 'lesson-2',
    title: '2. Python: If/Else Conditionals',
    class: 'Class 9-10',
    duration: '15 mins',
    language: 'python',
    summary: 'Control program execution flow using Boolean decision branches, comparison operators, and indentation.',
    sections: [
      {
        title: 'Decision Branching & Indentation Rules',
        icon: '🔀',
        badge: 'Flow Control',
        body: 'Programs need to make decisions based on changing conditions. Python uses "if", "elif" (else if), and "else" keywords. Unlike languages that use curly braces, Python relies strictly on 4 spaces of indentation to define code blocks.',
        codeSnippet: `score = 82
if score >= 90:
    print("Grade: A+")
elif score >= 75:
    print("Grade: A")
else:
    print("Grade: B or below")`,
        takeaway: 'Uneven or missing indentation produces an IndentationError. Always indent 4 spaces inside branches.',
      },
      {
        title: 'Comparison & Logical Operators',
        icon: '⚖️',
        badge: 'Logic & Predicates',
        body: 'Conditions evaluate to True or False. Use == (equality), != (not equal), <, >, <=, and >=. Combine multiple conditions using "and" (both true), "or" (at least one true), and "not" (inverts boolean).',
        codeSnippet: `age = 16
has_id = True
if age >= 16 and has_id:
    print("Eligible for student pass")`,
        takeaway: 'In Python, chained comparisons like 20 <= temperature <= 35 are valid and encouraged for cleaner code!',
      },
    ],
    quiz: {
      question: 'What output is produced by: x = 15; if x > 20: print("A"); elif x > 10: print("B"); else: print("C")?',
      options: ['A', 'B', 'C', 'Both B and C'],
      correctIndex: 1,
      explanation: 'Python evaluates conditions from top to bottom. Since x > 20 is False and x > 10 (15 > 10) is True, "B" is printed and the remaining else block is skipped.',
    },
    exampleCode: `# Grade classification system
marks = 85

if marks >= 90:
    grade = "A+"
elif marks >= 75:
    grade = "A"
elif marks >= 60:
    grade = "B"
else:
    grade = "C"

print(f"Marks: {marks} => Assigned Grade: {grade}")
`,
    exampleExplanation: 'Experiment by changing `marks` above and running the code to see different branches execute in real time.',
    exerciseGoal:
      'Given `temperature = 28`, write an if/elif/else block: If temp > 35, print "Hot Day". If temp is between 20 and 35 (inclusive), print "Pleasant Day". Otherwise print "Cold Day".',
    exerciseCode: `# Task: Classify the weather based on temperature
temperature = 28

# Write your if / elif / else logic below:
# Print: "Pleasant Day"
`,
    expectedOutput: 'Pleasant Day',
    hints: [
      'Check the hottest temperature first: `if temperature > 35: print("Hot Day")`.',
      'Check the middle range with: `elif 20 <= temperature <= 35: print("Pleasant Day")`.',
      'Fallback with `else: print("Cold Day")`.',
    ],
  },
  {
    id: 'lesson-3',
    title: '3. Python: For Loops',
    class: 'Class 9-10',
    duration: '15 mins',
    language: 'python',
    summary: 'Iterate over sequences, generate arithmetic ranges, and master the accumulator calculation pattern.',
    sections: [
      {
        title: 'Iterating with the range() Function',
        icon: '🔄',
        badge: 'Loops & Sequences',
        body: 'A "for" loop in Python iterates over members of a sequence in order. The built-in range(start, stop, step) generates an arithmetic progression. Crucially, the "stop" value is strictly exclusive.',
        codeSnippet: `# range(start, stop)
for num in range(1, 5):
    print(num)  # Prints: 1, 2, 3, 4 (5 is excluded)`,
        takeaway: 'range(5) starts at 0 and stops before 5: 0, 1, 2, 3, 4.',
      },
      {
        title: 'The Accumulator Pattern',
        icon: '➕',
        badge: 'Algorithm Pattern',
        body: 'To compute running sums, factorials, or aggregates, initialize an accumulator variable before entering the loop. During each iteration, update the accumulator with += or *=.',
        codeSnippet: `total = 0
for n in range(1, 6):
    total += n
print(f"Sum of 1 to 5: {total}")  # 15`,
        takeaway: 'Never re-initialize the accumulator inside the loop body, or it will reset on every iteration!',
      },
    ],
    quiz: {
      question: 'How many times does the loop "for i in range(2, 7):" execute?',
      options: ['7 times', '5 times (numbers: 2, 3, 4, 5, 6)', '6 times', '4 times'],
      correctIndex: 1,
      explanation: 'The loop starts at 2 and stops strictly before 7. The values generated are 2, 3, 4, 5, and 6, which totals 5 iterations.',
    },
    exampleCode: `# Calculate the sum of squares for numbers 1 to 5
total = 0

for i in range(1, 6):
    sq = i ** 2
    total += sq
    print(f"{i}^2 = {sq} (running total: {total})")

print(f"Final Sum of Squares: {total}")
`,
    exampleExplanation: 'Observe how `total` accumulates the square of each index across 5 loop cycles.',
    exerciseGoal:
      'Use a for loop to calculate the factorial of 5 (1 * 2 * 3 * 4 * 5 = 120). Print exactly: "Factorial: 120".',
    exerciseCode: `# Task: Compute factorial of 5 using a for loop
factorial = 1

# Write your for loop from 1 to 5:

# Print: "Factorial: 120"
`,
    expectedOutput: 'Factorial: 120',
    hints: [
      'Use `for i in range(1, 6):` to iterate from 1 up to 5.',
      'Inside the loop, multiply `factorial *= i`.',
      'After the loop finishes, print `print(f"Factorial: {factorial}")`.',
    ],
  },
  {
    id: 'lesson-4',
    title: '4. Python: Functions',
    class: 'Class 11-12',
    duration: '20 mins',
    language: 'python',
    summary: 'Package reusable blocks of logic with parameters, return statements, and local scopes.',
    sections: [
      {
        title: 'Defining & Invoking Functions',
        icon: '🧩',
        badge: 'Modularity',
        body: 'A function is an organized, reusable block of code designed to perform a distinct calculation. Functions make programs modular, readable, and testable. They are declared with the "def" keyword.',
        codeSnippet: `def greet_student(name, school="VidyaVerse"):
    return f"Welcome {name} to {school}!"

msg = greet_student("Priya")
print(msg)`,
        takeaway: 'Functions only run when they are called. Always include parentheses () when calling.',
      },
      {
        title: 'Return Values vs Print Output',
        icon: '📤',
        badge: 'Scope & Return',
        body: 'A critical distinction for students: print() outputs text to the screen, but return transmits data back to the calling statement so it can be stored in variables and used in further math calculations.',
        codeSnippet: `def square(x):
    return x * x

res = square(5) + square(3)  # 25 + 9 = 34
print(f"Sum of squares: {res}")`,
        takeaway: 'If a function finishes without an explicit return statement, it implicitly returns None.',
      },
    ],
    quiz: {
      question: 'What does a Python function return if there is no explicit return statement?',
      options: ['0', 'None', 'SyntaxError', 'False'],
      correctIndex: 1,
      explanation: 'In Python, all functions implicitly return the special "None" object if they terminate without hitting a return statement.',
    },
    exampleCode: `# Reusable Temperature Conversion Functions
def celsius_to_kelvin(celsius):
    return celsius + 273.15

def kelvin_to_celsius(kelvin):
    return kelvin - 273.15

room_temp = 25
print(f"{room_temp}°C in Kelvin is {celsius_to_kelvin(room_temp)}K")
`,
    exampleExplanation: 'The helper functions return raw numerical numbers that can be plugged into formulas or formatted cleanly.',
    exerciseGoal:
      'Define a function `celsius_to_fahrenheit(celsius)` using the formula `(celsius * 9/5) + 32`. Call it with celsius = 25 and print exactly: "Temperature in F: 77.0".',
    exerciseCode: `# Task: Define and call celsius_to_fahrenheit function
def celsius_to_fahrenheit(celsius):
    # Calculate and return Fahrenheit
    pass

# Call function with 25 and print "Temperature in F: 77.0"
`,
    expectedOutput: 'Temperature in F: 77.0',
    hints: [
      'Inside the function, write: `return (celsius * 9 / 5) + 32`.',
      'Call the function: `f_temp = celsius_to_fahrenheit(25)`.',
      'Print with: `print(f"Temperature in F: {f_temp:.1f}")`.',
    ],
  },
  {
    id: 'lesson-5',
    title: '5. JavaScript: DOM Manipulation',
    class: 'Class 11-12',
    duration: '20 mins',
    language: 'html',
    summary: 'Interact dynamically with web pages by modifying HTML elements, CSS styles, and click event listeners.',
    sections: [
      {
        title: 'The Document Object Model (DOM) Tree',
        icon: '🌳',
        badge: 'Web Standard',
        body: 'The DOM is a structured tree representing every HTML tag on a webpage. Using JavaScript, your code can inspect, style, add, or delete elements in real time without refreshing the page.',
        codeSnippet: `const heading = document.getElementById("title");
heading.textContent = "Welcome to VidyaVerse!";
heading.style.color = "#6541F5";`,
        takeaway: 'document.getElementById() retrieves a single unique element node by its ID attribute.',
      },
      {
        title: 'Event Listeners & User Interaction',
        icon: '🖱️',
        badge: 'Interactivity',
        body: 'To make webpages respond when students click buttons or type, use element.addEventListener("click", callback). When the event fires, the browser runs your callback function automatically.',
        codeSnippet: `const btn = document.getElementById("submit-btn");
btn.addEventListener("click", () => {
    alert("Button was pressed!");
});`,
        takeaway: 'addEventListener enables clean separation of logic without mixing JavaScript inside HTML onclick attributes.',
      },
    ],
    quiz: {
      question: 'Which DOM method correctly attaches an event handler without overwriting existing listeners?',
      options: ['element.onClick = fn', 'element.addEventListener("click", fn)', 'element.attachListener(fn)', 'element.bind("click", fn)'],
      correctIndex: 1,
      explanation: 'addEventListener() is the standard W3C DOM method to attach one or more listeners to an element.',
    },
    exampleCode: `<div style="font-family: sans-serif; text-align: center; padding: 24px; background: #111827; color: white; border-radius: 12px;">
  <h2 id="heading" style="color: #38bdf8;">VidyaVerse Interactive DOM</h2>
  <p id="status-text">Button clicks: <strong id="counter">0</strong></p>
  <button id="counter-btn" style="background: #8b5cf6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">
    Click to Increment
  </button>
</div>

<script>
  let count = 0;
  const btn = document.getElementById('counter-btn');
  const display = document.getElementById('counter');
  const heading = document.getElementById('heading');

  btn.addEventListener('click', () => {
    count++;
    display.textContent = count;
    heading.style.color = count % 2 === 0 ? '#38bdf8' : '#4ade80';
  });
</script>
`,
    exampleExplanation: 'Click the button in the live interactive sandbox preview below to watch the counter increment and color toggle!',
    exerciseGoal:
      'Modify the JavaScript to handle the button click: When clicked, change the heading text to "Success!" and color to "#22c55e" (green).',
    exerciseCode: `<div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: white; border-radius: 10px;">
  <h3 id="target-heading" style="color: #f59e0b;">Waiting for Click...</h3>
  <button id="solve-btn" style="padding: 8px 16px; background: #0ea5e9; color: white; border: none; border-radius: 6px; cursor: pointer;">
    Activate
  </button>
</div>

<script>
  const btn = document.getElementById('solve-btn');
  const heading = document.getElementById('target-heading');

  btn.addEventListener('click', () => {
    // Set heading text to "Success!" and heading.style.color to "#22c55e"
    heading.textContent = "Success!";
    heading.style.color = "#22c55e";
  });
</script>
`,
    expectedOutput: 'Success!',
    hints: [
      'Inside the click listener, write `heading.textContent = "Success!";`.',
      'Set the color with `heading.style.color = "#22c55e";`.',
      'Click the "Activate" button in the live preview to verify!',
    ],
  },
];

export const CodeLearnPage: React.FC = () => {
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'explanation' | 'example' | 'exercise'>('explanation');
  const [userExerciseCode, setUserExerciseCode] = useState<string>(LESSONS[0].exerciseCode);

  // Example runner state
  const [sampleCode, setSampleCode] = useState<string>(LESSONS[0].exampleCode);
  const [sampleRunning, setSampleRunning] = useState<boolean>(false);
  const [sampleOutput, setSampleOutput] = useState<string>('');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Exercise execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [exerciseOutput, setExerciseOutput] = useState<string>('');
  const [exercisePassed, setExercisePassed] = useState<boolean | null>(null);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [copiedExample, setCopiedExample] = useState<boolean>(false);

  // Quiz state: lessonId -> selected option index
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Stores
  const { markCompleted, items } = useProgressStore();
  const { addXP } = useAuthStore();
  const { theme } = useUIStore();

  const currentLesson = LESSONS[activeLessonIndex];
  const isLessonCompleted = items.some(
    (i) => i.module === 'codeverse_learn' && i.itemId === currentLesson.id && i.completed
  );

  // Synchronize state when switching lessons
  const handleSelectLesson = (index: number) => {
    setActiveLessonIndex(index);
    setActiveTab('explanation');
    setUserExerciseCode(LESSONS[index].exerciseCode);
    setSampleCode(LESSONS[index].exampleCode);
    setSampleOutput('');
    setExerciseOutput('');
    setExercisePassed(null);
    setShowHints(false);
  };

  // Run student exercise code
  const handleRunExercise = async () => {
    setIsRunning(true);
    setExercisePassed(null);

    try {
      if (currentLesson.language === 'html') {
        // HTML is executed via live preview
        setExerciseOutput('Rendered in live sandbox preview below.');
        setExercisePassed(true);
        markCompleted('codeverse_learn', currentLesson.id, 100);
        addXP(50);
        setIsRunning(false);
        return;
      }

      const res = await runWithPiston(currentLesson.language, userExerciseCode);
      const cleanOut = normalizeOutput(res.stdout);
      const cleanExp = normalizeOutput(currentLesson.expectedOutput);

      setExerciseOutput(res.stdout || (res.stderr ? `Error: ${res.stderr}` : 'No output'));

      const passed = !res.isError && cleanOut === cleanExp;
      setExercisePassed(passed);

      if (passed) {
        markCompleted('codeverse_learn', currentLesson.id, 100);
        addXP(50);
      }
    } catch (err: unknown) {
      setExerciseOutput(String(err));
      setExercisePassed(false);
    } finally {
      setIsRunning(false);
    }
  };

  // Run example sample code
  const handleRunSample = async () => {
    setSampleRunning(true);
    try {
      if (currentLesson.language === 'html') {
        setSampleOutput('DOM active in preview sandbox frame.');
        setSampleRunning(false);
        return;
      }

      const res = await runWithPiston(currentLesson.language, sampleCode);
      setSampleOutput(res.stdout || (res.stderr ? `Error:\n${res.stderr}` : 'Executed with 0 exit code (no stdout).'));
    } catch (err: unknown) {
      setSampleOutput(String(err));
    } finally {
      setSampleRunning(false);
    }
  };

  const handleCopyExample = () => {
    navigator.clipboard.writeText(sampleCode);
    setCopiedExample(true);
    setTimeout(() => setCopiedExample(false), 2000);
  };

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleSelectQuizOption = (optionIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [currentLesson.id]: optionIdx }));
    setQuizSubmitted((prev) => ({ ...prev, [currentLesson.id]: true }));

    if (optionIdx === currentLesson.quiz.correctIndex) {
      // Award XP for answering correctly
      addXP(25);
    }
  };

  const selectedAnswer = quizAnswers[currentLesson.id];
  const isQuizDone = quizSubmitted[currentLesson.id];
  const isAnswerCorrect = selectedAnswer === currentLesson.quiz.correctIndex;

  return (
    <div className="flex h-full w-full rounded-2xl border border-border bg-card text-text-primary font-sans overflow-hidden shadow-soft">
      {/* 1. LEFT SIDEBAR: CURRICULUM TREE */}
      <aside className="w-80 border-r border-border bg-card flex flex-col z-10 shrink-0 text-text-primary">
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-[#EAE7FF] text-[#6541F5] dark:bg-[#26233E] dark:text-[#C4B5FD]">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="font-display font-bold text-sm text-text-primary">Learn Mode Curriculum</span>
          </div>
          <p className="text-xs text-text-muted">Step-by-step NCERT & CBSE aligned interactive coding lessons.</p>
        </div>

        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {LESSONS.map((lesson, idx) => {
            const isSelected = activeLessonIndex === idx;
            const completed = items.some(
              (i) => i.module === 'codeverse_learn' && i.itemId === lesson.id && i.completed
            );

            return (
              <div
                key={lesson.id}
                onClick={() => handleSelectLesson(idx)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#6541F5]/10 border-[#6541F5] shadow-sm'
                    : 'bg-canvas border-border hover:border-[#6541F5]/40 hover:bg-[#6541F5]/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAE7FF] text-[#6541F5] dark:bg-[#26233E] dark:text-[#C4B5FD]">
                    {lesson.class}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono">
                    <span>{lesson.duration}</span>
                    {completed && <CheckCircle2 className="w-3.5 h-3.5 text-[#19B99A]" />}
                  </div>
                </div>

                <div className="text-xs font-semibold text-text-primary mb-1">{lesson.title}</div>
                <div className="text-[11px] text-text-muted line-clamp-1">{lesson.summary}</div>
              </div>
            );
          })}
        </div>

        {/* Curriculum Progress Footer */}
        <div className="p-3 border-t border-border bg-canvas/40 text-xs">
          <div className="flex justify-between text-text-muted mb-1 text-[11px]">
            <span>Course Progress</span>
            <span className="font-mono text-[#6541F5] dark:text-[#C4B5FD] font-bold">
              {Math.round(
                (items.filter((i) => i.module === 'codeverse_learn' && i.completed).length / LESSONS.length) * 100
              )}
              %
            </span>
          </div>
          <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden border border-border">
            <div
              className="h-full bg-[#6541F5] rounded-full transition-all duration-300"
              style={{
                width: `${
                  (items.filter((i) => i.module === 'codeverse_learn' && i.completed).length / LESSONS.length) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </aside>

      {/* 2. MAIN LESSON VIEWER */}
      <main className="flex-1 flex flex-col overflow-hidden bg-canvas">
        {/* Top Lesson Header */}
        <div className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-canvas text-text-muted border border-border">
              {currentLesson.class}
            </span>
            <h1 className="font-display font-bold text-base text-text-primary">{currentLesson.title}</h1>
            {isLessonCompleted && (
              <span className="px-2 py-0.5 rounded-full bg-[#DDF8EE] text-[#19B99A] dark:bg-[#0D2E26] text-[10px] font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Completed (+50 XP)
              </span>
            )}
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-canvas p-0.5 rounded-xl border border-border text-xs">
            <button
              onClick={() => setActiveTab('explanation')}
              className={`px-3 py-1 font-semibold rounded-lg transition-all ${
                activeTab === 'explanation'
                  ? 'bg-[#6541F5] text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              📖 Concepts
            </button>
            <button
              onClick={() => setActiveTab('example')}
              className={`px-3 py-1 font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'example'
                  ? 'bg-[#6541F5] text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>💻 Example Code</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#42A5E8]" />
            </button>
            <button
              onClick={() => setActiveTab('exercise')}
              className={`px-3 py-1 font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'exercise'
                  ? 'bg-[#19B99A] text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>🧪 Practice Exercise</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#19B99A] animate-pulse" />
            </button>
          </div>
        </div>

        {/* Tab 1: Structured Explanation & Interactive Concept Reader */}
        {activeTab === 'explanation' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
            {/* Learning Objective Hero Banner */}
            <div className="p-4 rounded-2xl bg-[#EAE7FF]/60 dark:bg-[#26233E]/60 border border-[#6541F5]/30 flex items-start gap-3 shadow-sm">
              <span className="text-xl mt-0.5">🎯</span>
              <div>
                <div className="text-xs font-bold text-[#6541F5] dark:text-[#C4B5FD] uppercase tracking-wider mb-0.5">
                  Pedagogical Objective
                </div>
                <p className="text-xs sm:text-sm text-text-primary font-medium leading-relaxed">
                  {currentLesson.summary}
                </p>
              </div>
            </div>

            {/* Concept Cards Breakdown */}
            <div className="space-y-4">
              {currentLesson.sections.map((sec, sIdx) => (
                <div
                  key={sIdx}
                  className="card p-5 sm:p-6 bg-card border border-border rounded-2xl shadow-soft space-y-3.5 transition-all hover:border-[#6541F5]/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{sec.icon || '📌'}</span>
                      <h3 className="text-sm sm:text-base font-bold font-display text-text-primary">
                        {sec.title}
                      </h3>
                    </div>
                    {sec.badge && (
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-canvas border border-border text-text-muted">
                        {sec.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                    {sec.body}
                  </p>

                  {/* Code Snippet Box (if provided) */}
                  {sec.codeSnippet && (
                    <div className="relative rounded-xl overflow-hidden border border-border bg-[#181824] dark:bg-[#0E0E17]">
                      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#202030] dark:bg-[#151522] border-b border-white/5 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-[#6541F5]" />
                          <span>Syntax Demonstration</span>
                        </span>
                        <button
                          onClick={() => handleCopySnippet(sec.codeSnippet!, `snip-${sIdx}`)}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedSnippet === `snip-${sIdx}` ? (
                            <>
                              <Check className="w-3 h-3 text-[#19B99A]" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3.5 text-xs font-mono text-emerald-400 dark:text-emerald-300 overflow-x-auto">
                        <code>{sec.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Takeaway / Exam Tip Alert */}
                  {sec.takeaway && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                      <Lightbulb className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Curriculum Tip: </strong>
                        <span>{sec.takeaway}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Interactive "Check Your Understanding" Mini Quiz */}
            <div className="card p-6 bg-card border-2 border-[#6541F5]/30 rounded-2xl shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EAE7FF] text-[#6541F5] dark:bg-[#26233E] flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Check Your Understanding</h3>
                    <p className="text-[11px] text-text-muted">Earn +25 XP by validating your knowledge</p>
                  </div>
                </div>
                {isQuizDone && isAnswerCorrect && (
                  <span className="px-2.5 py-1 rounded-full bg-[#DDF8EE] text-[#19B99A] dark:bg-[#0D2E26] text-xs font-bold flex items-center gap-1 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5" /> Correct! +25 XP
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-sm font-semibold text-text-primary pt-1">
                {currentLesson.quiz.question}
              </div>

              {/* Multiple Choice Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {currentLesson.quiz.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswer === optIdx;
                  const isCorrect = optIdx === currentLesson.quiz.correctIndex;

                  let btnStyle = 'border-border bg-canvas hover:border-[#6541F5]/60 hover:bg-[#6541F5]/5 text-text-primary';
                  if (isQuizDone) {
                    if (isCorrect) {
                      btnStyle = 'border-[#19B99A] bg-[#DDF8EE]/60 dark:bg-[#0D2E26]/60 text-[#19B99A] font-semibold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold';
                    }
                  } else if (isSelected) {
                    btnStyle = 'border-[#6541F5] bg-[#6541F5]/10 text-[#6541F5] font-semibold';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectQuizOption(optIdx)}
                      className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isQuizDone && isCorrect && <Check className="w-4 h-4 text-[#19B99A]" />}
                      {isQuizDone && isSelected && !isCorrect && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {/* Quiz Feedback Explanation */}
              {isQuizDone && (
                <div
                  className={`p-3.5 rounded-xl text-xs space-y-1 ${
                    isAnswerCorrect
                      ? 'bg-[#DDF8EE]/40 border border-[#19B99A]/40 text-text-primary'
                      : 'bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-900/50 text-text-primary'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {isAnswerCorrect ? (
                      <span className="text-[#19B99A]">🎉 Spot On!</span>
                    ) : (
                      <span className="text-red-500">❌ Not Quite Right</span>
                    )}
                  </div>
                  <p className="text-text-muted leading-relaxed">
                    {currentLesson.quiz.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 pb-6 flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveTab('example')}
                className="btn-primary px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm"
              >
                <span>Run Example Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('exercise')}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 bg-[#19B99A] hover:bg-[#159F84] text-white transition-all shadow-sm"
              >
                <span>Jump to Practice Exercise</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Example Code View with Live Runner */}
        {activeTab === 'example' && (
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div>
                <div className="text-xs font-semibold text-text-primary">Interactive Code Sandbox</div>
                <div className="text-[11px] text-text-muted">
                  Run the working sample code, experiment with values, and view the live console output.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSampleCode(currentLesson.exampleCode);
                    setSampleOutput('');
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-xl flex items-center gap-1.5 border border-border text-text-muted hover:text-text-primary hover:bg-canvas transition-colors"
                  title="Reset Sample Code to original"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                <button
                  onClick={handleCopyExample}
                  className="px-2.5 py-1.5 text-xs rounded-xl flex items-center gap-1.5 border border-border text-text-muted hover:text-text-primary hover:bg-canvas transition-colors"
                >
                  {copiedExample ? <Check className="w-3.5 h-3.5 text-[#19B99A]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedExample ? 'Copied!' : 'Copy Code'}</span>
                </button>

                {/* RUN SAMPLE BUTTON */}
                <button
                  onClick={handleRunSample}
                  disabled={sampleRunning}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-2 bg-[#6541F5] hover:bg-[#5230E8] text-white shadow-sm transition-all disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${sampleRunning ? 'animate-spin' : ''}`} />
                  <span>{sampleRunning ? 'Executing...' : 'Run Sample Code'}</span>
                </button>
              </div>
            </div>

            {/* Monaco Editor Frame */}
            <div className="flex-1 border border-border rounded-2xl overflow-hidden shadow-soft flex flex-col min-h-[220px]">
              <Editor
                height="100%"
                theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                language={currentLesson.language === 'html' ? 'html' : 'python'}
                value={sampleCode}
                onChange={(val) => setSampleCode(val || '')}
                options={{
                  readOnly: false,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  automaticLayout: true,
                  wordWrap: 'on',
                }}
              />
            </div>

            {/* If HTML, live preview frame */}
            {currentLesson.language === 'html' && (
              <div className="h-44 mt-3 border border-border rounded-xl overflow-hidden bg-white shadow-soft shrink-0 flex flex-col">
                <div className="bg-canvas px-3 py-1 text-[11px] font-semibold text-text-muted border-b border-border flex items-center justify-between">
                  <span>Interactive HTML Sandbox</span>
                  <span className="text-[10px] text-[#19B99A]">Live DOM Render</span>
                </div>
                <iframe
                  srcDoc={buildHtmlSrcdoc(sampleCode)}
                  title="HTML Example Preview"
                  className="w-full flex-1 border-none"
                  sandbox="allow-scripts"
                />
              </div>
            )}

            {/* Live Terminal Output Drawer */}
            {sampleOutput && (
              <div className="mt-3 rounded-xl border border-border bg-[#0E0E17] text-slate-100 p-3 shrink-0 overflow-y-auto max-h-36 font-mono text-xs shadow-soft">
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#42A5E8]">
                    <Terminal className="w-3.5 h-3.5" /> Output Console
                  </span>
                  <span className="text-emerald-400">Exit Code: 0</span>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed text-slate-200">{sampleOutput}</pre>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between shrink-0">
              <span className="text-xs text-text-muted">
                Tip: You can modify any number or string in the editor above and hit "Run Sample Code"!
              </span>
              <button
                onClick={() => setActiveTab('exercise')}
                className="px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 bg-[#19B99A] hover:bg-[#159F84] text-white transition-all shadow-sm"
              >
                <span>Ready to Try the Exercise!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Practice Exercise & Auto-Grader */}
        {activeTab === 'exercise' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Goal Card */}
            <div className="p-4 bg-card border-b border-border shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-[#19B99A] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Exercise Mission
                </span>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:opacity-80 flex items-center gap-1 font-semibold"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHints ? 'Hide Hints' : 'Need a Hint?'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-text-primary font-medium leading-relaxed">
                {currentLesson.exerciseGoal}
              </p>

              {/* Hints Accordion */}
              {showHints && (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <div className="font-semibold text-amber-700 dark:text-amber-400 mb-1">Step-by-step Hints:</div>
                  <ul className="list-disc pl-4 space-y-1 text-text-muted">
                    {currentLesson.hints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Editor & Live Preview Area */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="flex-1 relative min-h-[220px]">
                <Editor
                  height="100%"
                  theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                  language={currentLesson.language === 'html' ? 'html' : 'python'}
                  value={userExerciseCode}
                  onChange={(val) => setUserExerciseCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    automaticLayout: true,
                    wordWrap: 'on',
                  }}
                />
              </div>

              {/* If HTML, live preview frame */}
              {currentLesson.language === 'html' && (
                <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l border-border bg-white flex flex-col">
                  <div className="bg-canvas text-text-muted px-3 py-1.5 text-[11px] font-semibold border-b border-border flex items-center justify-between">
                    <span>Live Interactive HTML Sandbox</span>
                    <span className="text-[#19B99A]">Realtime</span>
                  </div>
                  <iframe
                    srcDoc={buildHtmlSrcdoc(userExerciseCode)}
                    title="Live HTML Sandbox"
                    className="flex-1 w-full border-none"
                    sandbox="allow-scripts"
                  />
                </div>
              )}
            </div>

            {/* Exercise Action Bar & Feedback */}
            <div className="p-3 border-t border-border bg-card flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUserExerciseCode(currentLesson.exerciseCode)}
                  className="px-3 py-1.5 text-xs rounded-xl flex items-center gap-1.5 border border-border text-text-muted hover:text-text-primary hover:bg-canvas transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Starter</span>
                </button>

                <button
                  onClick={handleRunExercise}
                  disabled={isRunning}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-2 bg-[#19B99A] hover:bg-[#159F84] text-white shadow-sm transition-all disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Grading Answer...' : 'Run & Check Answer'}</span>
                </button>
              </div>

              {/* Result Badge / Next Action */}
              {exercisePassed !== null && (
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      exercisePassed
                        ? 'bg-[#DDF8EE] text-[#19B99A] dark:bg-[#0D2E26] border border-[#19B99A]/40'
                        : 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-500/40'
                    }`}
                  >
                    {exercisePassed ? <CheckCircle2 className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                    <span>{exercisePassed ? 'Mission Passed! +50 XP' : 'Incorrect Output - Check Hints'}</span>
                  </div>

                  {exercisePassed && activeLessonIndex < LESSONS.length - 1 && (
                    <button
                      onClick={() => handleSelectLesson(activeLessonIndex + 1)}
                      className="px-3.5 py-1 text-xs font-semibold rounded-xl bg-[#6541F5] hover:bg-[#5230E8] text-white flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Next Lesson</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Side-by-side Output Diff Comparison */}
            {exerciseOutput && (
              <div className="border-t border-border bg-canvas p-3 shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono max-h-36 overflow-y-auto">
                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">
                    Your Actual Output:
                  </div>
                  <pre
                    className={`whitespace-pre-wrap ${
                      exercisePassed ? 'text-[#19B99A] font-semibold' : 'text-red-500'
                    }`}
                  >
                    {exerciseOutput}
                  </pre>
                </div>

                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">
                    Expected Target Output:
                  </div>
                  <pre className="whitespace-pre-wrap text-[#19B99A] font-semibold">
                    {currentLesson.expectedOutput}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. NAVIGATION FOOTER: NEXT / PREVIOUS */}
        <footer className="h-12 border-t border-border bg-card px-6 flex items-center justify-between shrink-0">
          <button
            onClick={() => handleSelectLesson(Math.max(0, activeLessonIndex - 1))}
            disabled={activeLessonIndex === 0}
            className="px-3 py-1.5 text-xs rounded-xl flex items-center gap-1.5 border border-border text-text-muted hover:text-text-primary hover:bg-canvas transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Lesson</span>
          </button>

          <span className="text-xs text-text-muted font-mono font-medium">
            Lesson {activeLessonIndex + 1} of {LESSONS.length}
          </span>

          <button
            onClick={() => handleSelectLesson(Math.min(LESSONS.length - 1, activeLessonIndex + 1))}
            disabled={activeLessonIndex === LESSONS.length - 1}
            className="px-3.5 py-1.5 text-xs rounded-xl flex items-center gap-1.5 bg-[#6541F5] hover:bg-[#5230E8] text-white shadow-sm transition-colors disabled:opacity-30"
          >
            <span>Next Lesson</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </main>
    </div>
  );
};

export default CodeLearnPage;
