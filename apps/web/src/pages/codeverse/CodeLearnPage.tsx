import React, { useState } from 'react';
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
} from 'lucide-react';
import { runWithPiston, buildHtmlSrcdoc, normalizeOutput } from '../../services/codeRunner';
import { useProgressStore } from '../../stores/progressStore';
import { useAuthStore } from '../../stores/authStore';

export interface Lesson {
  id: string;
  title: string;
  class: string;
  duration: string;
  language: 'python' | 'javascript' | 'html';
  summary: string;
  explanation: string;
  exampleCode: string;
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
    summary: 'Learn dynamic variable declaration, standard primitive data types, and formatted print output.',
    explanation: `### Variables & Dynamic Typing in Python

In Python, **variables** are names that refer to values stored in computer memory. Unlike languages like C++ or Java, Python has no variable declaration keywords like \`int\` or \`var\`. A variable is created automatically the moment you assign a value to it using the assignment operator (\`=\`).

#### Primary Data Types:
- **String (\`str\`)**: Text enclosed in quotes, e.g., \`"Aarav"\`
- **Integer (\`int\`)**: Whole numbers, e.g., \`42\`
- **Float (\`float\`)**: Decimal numbers, e.g., \`3.14159\`
- **Boolean (\`bool\`)**: Logical \`True\` or \`False\`

#### Modern Print Formatting (f-strings):
Prefixing a string literal with \`f\` allows you to embed expressions directly inside curly braces \`{...}\`:
\`\`\`python
name = "Vidya"
score = 98.5
print(f"Student: {name} scored {score}%")
\`\`\`
`,
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
      'Print with: `print(f"Area of circle: {area:.2f}")` or `print("Area of circle:", area)`.',
    ],
  },
  {
    id: 'lesson-2',
    title: '2. Python: If/Else Conditionals',
    class: 'Class 9-10',
    duration: '15 mins',
    language: 'python',
    summary: 'Control program execution flow using Boolean decision branches, comparison operators, and indentation.',
    explanation: `### Conditional Statements in Python

Conditionals allow your code to make intelligent decisions based on runtime conditions.

#### Syntax & Structure:
\`\`\`python
if condition:
    # Executes if condition is True
elif alternative_condition:
    # Executes if previous was False and this is True
else:
    # Executes if all above conditions were False
\`\`\`

#### Important Rules:
1. **Indentation Matters**: Python uses 4 spaces (or 1 tab) of indentation to define a code block. Missing or uneven indentation results in an \`IndentationError\`.
2. **Comparison Operators**: \`==\` (equals), \`!=\` (not equals), \`<\`, \`>\`, \`<=\`, \`>=\`.
3. **Logical Operators**: \`and\` (both true), \`or\` (either true), \`not\` (inverts boolean).
`,
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
    exerciseGoal:
      'Given `temperature = 28`, write an if/elif/else block: If temp > 35, print "Hot Day". If temp is between 20 and 35 (inclusive), print "Pleasant Day". Otherwise print "Cold Day".',
    exerciseCode: `# Task: Classify the weather based on temperature
temperature = 28

# Write your if / elif / else logic below:
`,
    expectedOutput: 'Pleasant Day',
    hints: [
      'Check the hottest temperature first: `if temperature > 35: print("Hot Day")`.',
      'Check the middle range with: `elif temperature >= 20 and temperature <= 35: print("Pleasant Day")` or chained `elif 20 <= temperature <= 35:`.',
      'Fallback with `else: print("Cold Day")`.',
    ],
  },
  {
    id: 'lesson-3',
    title: '3. Python: For Loops',
    class: 'Class 9-10',
    duration: '15 mins',
    language: 'python',
    summary: 'Iterate over sequences, generate ranges, and perform repetitive mathematical calculations.',
    explanation: `### For Loops and the \`range()\` Function

A \`for\` loop in Python iterates over members of a sequence in order.

#### Using \`range()\`:
The built-in \`range(start, stop, step)\` function generates a sequence of numbers:
- \`range(5)\` => 0, 1, 2, 3, 4 (starts at 0, stops before 5)
- \`range(1, 6)\` => 1, 2, 3, 4, 5
- \`range(0, 10, 2)\` => 0, 2, 4, 6, 8 (steps by 2)

#### Accumulation Pattern:
To compute running sums or products, initialize an accumulator variable before the loop:
\`\`\`python
total = 0
for n in range(1, 11):
    total += n
print("Sum 1 to 10:", total)
\`\`\`
`,
    exampleCode: `# Calculate the sum of squares for numbers 1 to 5
total = 0

for i in range(1, 6):
    sq = i ** 2
    total += sq
    print(f"{i}^2 = {sq} (running total: {total})")

print(f"Final Sum of Squares: {total}")
`,
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
    explanation: `### Functions in Python

A **function** is an organized, reusable block of code used to perform a single, related action. Functions make programs modular, readable, and easy to maintain.

#### Defining Functions:
- Defined using the keyword \`def\`, followed by the function name, parentheses \`()\`, and a colon \`:\`.
- **Parameters**: Variables listed inside parentheses in the function definition.
- **Return Value**: The \`return\` statement exits the function and sends data back to the caller.

\`\`\`python
def calculate_area(length, width):
    area = length * width
    return area

room_area = calculate_area(12, 10)
print(f"Room area: {room_area} sq ft")
\`\`\`
`,
    exampleCode: `# Reusable Temperature Conversion Functions
def celsius_to_kelvin(celsius):
    return celsius + 273.15

def kelvin_to_celsius(kelvin):
    return kelvin - 273.15

room_temp = 25
print(f"{room_temp}°C in Kelvin is {celsius_to_kelvin(room_temp)}K")
`,
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
    summary: 'Interact dynamically with web pages by modifying HTML elements, styles, and handling click events.',
    explanation: `### Document Object Model (DOM) Manipulation

The **DOM** is a tree representation of the webpage. Using JavaScript, you can dynamically read, alter, style, and delete elements in real time.

#### Essential DOM APIs:
- \`document.getElementById("id")\`: Selects an element by unique ID.
- \`element.textContent = "..."\`: Modifies the inner text content.
- \`element.style.color = "..."\`: Changes CSS styles directly.
- \`element.addEventListener("click", callback)\`: Executes code when user clicks.

In this lesson, you can see your live HTML sandbox update directly in the browser!
`,
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

  // Exercise execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [exerciseOutput, setExerciseOutput] = useState<string>('');
  const [exercisePassed, setExercisePassed] = useState<boolean | null>(null);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Stores
  const { markCompleted, items } = useProgressStore();
  const { addXP } = useAuthStore();

  const currentLesson = LESSONS[activeLessonIndex];
  const isLessonCompleted = items.some(
    (i) => i.module === 'codeverse_learn' && i.itemId === currentLesson.id && i.completed
  );

  // Handle lesson change
  const handleSelectLesson = (index: number) => {
    setActiveLessonIndex(index);
    setActiveTab('explanation');
    setUserExerciseCode(LESSONS[index].exerciseCode);
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

  const handleCopyExample = () => {
    navigator.clipboard.writeText(currentLesson.exampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-surface-900 text-surface-100 font-sans overflow-hidden">
      {/* 1. LEFT SIDEBAR: CURRICULUM TREE */}
      <aside className="w-80 border-r border-surface-700 bg-surface-800 flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-surface-700 bg-surface-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-code-500/20 text-code-400 border border-code-500/30">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="font-display font-bold text-sm text-surface-100">Learn Mode Curriculum</span>
          </div>
          <p className="text-xs text-surface-400">Step-by-step NCERT & CBSE aligned interactive coding lessons.</p>
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
                    ? 'bg-code-500/15 border-code-500/80 shadow-glow-code'
                    : 'bg-surface-900/60 border-surface-700/60 hover:border-surface-600 hover:bg-surface-700/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="badge-code text-[10px]">{lesson.class}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-surface-400 font-mono">
                    <span>{lesson.duration}</span>
                    {completed && <CheckCircle2 className="w-3.5 h-3.5 text-circuit-400 fill-circuit-400/20" />}
                  </div>
                </div>

                <div className="text-xs font-semibold text-surface-100 mb-1">{lesson.title}</div>
                <div className="text-[11px] text-surface-400 line-clamp-1">{lesson.summary}</div>
              </div>
            );
          })}
        </div>

        {/* Curriculum Progress Footer */}
        <div className="p-3 border-t border-surface-700 bg-surface-900/40 text-xs">
          <div className="flex justify-between text-surface-400 mb-1 text-[11px]">
            <span>Course Progress</span>
            <span className="font-mono text-circuit-400 font-bold">
              {Math.round(
                (items.filter((i) => i.module === 'codeverse_learn' && i.completed).length / LESSONS.length) * 100
              )}
              %
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-circuit-500 rounded-full transition-all duration-300"
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
      <main className="flex-1 flex flex-col overflow-hidden bg-surface-950">
        {/* Top Lesson Header */}
        <div className="h-14 border-b border-surface-700 bg-surface-800 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-900 text-surface-300 border border-surface-700">
              {currentLesson.class}
            </span>
            <h1 className="font-display font-bold text-base text-surface-50">{currentLesson.title}</h1>
            {isLessonCompleted && (
              <span className="badge-circuit text-[10px] flex items-center gap-1">
                <Check className="w-3 h-3" /> Completed
              </span>
            )}
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-surface-900 p-0.5 rounded-lg border border-surface-700 text-xs">
            <button
              onClick={() => setActiveTab('explanation')}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                activeTab === 'explanation' ? 'bg-code-500 text-white shadow-sm' : 'text-surface-400 hover:text-white'
              }`}
            >
              📖 Concepts
            </button>
            <button
              onClick={() => setActiveTab('example')}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                activeTab === 'example' ? 'bg-code-500 text-white shadow-sm' : 'text-surface-400 hover:text-white'
              }`}
            >
              💻 Example Code
            </button>
            <button
              onClick={() => setActiveTab('exercise')}
              className={`px-3 py-1 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'exercise' ? 'bg-circuit-500 text-white shadow-sm' : 'text-surface-400 hover:text-white'
              }`}
            >
              <span>🧪 Practice Exercise</span>
              <span className="w-1.5 h-1.5 rounded-full bg-circuit-400" />
            </button>
          </div>
        </div>

        {/* Tab 1: Structured Explanation View */}
        {activeTab === 'explanation' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="p-4 rounded-2xl bg-code-950/20 border border-code-700/40 text-xs text-code-300 leading-relaxed">
              <strong>Learning Objective:</strong> {currentLesson.summary}
            </div>

            <div className="prose prose-invert max-w-none text-surface-300 text-sm leading-relaxed space-y-4">
              <div className="whitespace-pre-wrap font-sans">{currentLesson.explanation}</div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => setActiveTab('example')}
                className="btn-code px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2"
              >
                <span>View Example Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('exercise')}
                className="btn-circuit px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2"
              >
                <span>Try Exercise Directly</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Example Code View */}
        {activeTab === 'example' && (
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-surface-400">
                Explore the working sample code. Click "Try it in Exercise" to practice modifying it.
              </div>
              <button
                onClick={handleCopyExample}
                className="btn-ghost px-2.5 py-1 text-xs rounded-lg flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-circuit-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="flex-1 border border-surface-700 rounded-xl overflow-hidden shadow-xl">
              <Editor
                height="100%"
                theme="vs-dark"
                language={currentLesson.language === 'html' ? 'html' : 'python'}
                value={currentLesson.exampleCode}
                options={{
                  readOnly: true,
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
              <div className="h-48 mt-4 border border-surface-700 rounded-xl overflow-hidden bg-white">
                <iframe
                  srcDoc={buildHtmlSrcdoc(currentLesson.exampleCode)}
                  title="HTML Example Preview"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts"
                />
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setActiveTab('exercise')}
                className="btn-circuit px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2"
              >
                <span>Ready to Try the Exercise!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Practice Exercise */}
        {activeTab === 'exercise' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Goal Card */}
            <div className="p-4 bg-surface-900 border-b border-surface-700 shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-circuit-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Exercise Mission
                </span>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHints ? 'Hide Hints' : 'Need a Hint?'}</span>
                </button>
              </div>
              <p className="text-xs text-surface-200">{currentLesson.exerciseGoal}</p>

              {/* Hints Accordion */}
              {showHints && (
                <div className="mt-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-700/50 text-xs text-amber-200 space-y-1">
                  <div className="font-semibold text-amber-400 mb-1">Step-by-step Hints:</div>
                  <ul className="list-disc pl-4 space-y-1 text-surface-300">
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
                  theme="vs-dark"
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
                <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l border-surface-700 bg-white flex flex-col">
                  <div className="bg-surface-800 text-surface-400 px-3 py-1 text-[11px] border-b border-surface-700">
                    Live HTML / DOM Sandbox Preview
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
            <div className="p-3 border-t border-surface-700 bg-surface-900/95 flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUserExerciseCode(currentLesson.exerciseCode)}
                  className="btn-ghost px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 text-surface-400"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Starter</span>
                </button>

                <button
                  onClick={handleRunExercise}
                  disabled={isRunning}
                  className="btn-circuit px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-glow-circuit disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunning ? 'Executing...' : 'Run & Check Answer'}</span>
                </button>
              </div>

              {/* Result Badge */}
              {exercisePassed !== null && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    exercisePassed
                      ? 'bg-circuit-900/80 text-circuit-300 border border-circuit-500 shadow-glow-circuit'
                      : 'bg-red-900/80 text-red-300 border border-red-500'
                  }`}
                >
                  {exercisePassed ? <CheckCircle2 className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                  <span>{exercisePassed ? 'Mission Passed! +50 XP' : 'Incorrect Output - Check Hints'}</span>
                </div>
              )}
            </div>

            {/* Output Display */}
            {exerciseOutput && (
              <div className="h-28 border-t border-surface-700 bg-surface-950 p-3 overflow-y-auto text-xs font-mono">
                <div className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Standard Output:</div>
                <pre className="text-surface-200 whitespace-pre-wrap">{exerciseOutput}</pre>
              </div>
            )}
          </div>
        )}

        {/* 3. NAVIGATION FOOTER: NEXT / PREVIOUS */}
        <footer className="h-12 border-t border-surface-700/80 bg-surface-800 px-6 flex items-center justify-between shrink-0">
          <button
            onClick={() => handleSelectLesson(Math.max(0, activeLessonIndex - 1))}
            disabled={activeLessonIndex === 0}
            className="btn-ghost px-3 py-1 text-xs rounded-lg flex items-center gap-1 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Lesson</span>
          </button>

          <span className="text-xs text-surface-400 font-mono">
            Lesson {activeLessonIndex + 1} of {LESSONS.length}
          </span>

          <button
            onClick={() => handleSelectLesson(Math.min(LESSONS.length - 1, activeLessonIndex + 1))}
            disabled={activeLessonIndex === LESSONS.length - 1}
            className="btn-code px-3 py-1 text-xs rounded-lg flex items-center gap-1 disabled:opacity-30"
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
