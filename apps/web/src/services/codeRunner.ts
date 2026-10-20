/**
 * VidyaVerse Labs 2.0 - Code Runner Service
 * Executes code using the Piston public API with timeouts, output normalization,
 * test-case evaluation, and sandboxed iframe previews for web languages.
 */

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtimeMs: number;
  isError: boolean;
  statusMessage?: string;
}

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface TestResult {
  testCaseId: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  runtimeMs: number;
  error?: string;
}

export interface SubmissionVerdict {
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  results: TestResult[];
  message: string;
}

const PISTON_ENDPOINT = 'https://emkc.org/api/v2/piston/execute';

export const SUPPORTED_LANGUAGES: Record<
  string,
  {
    language: string;
    version: string;
    displayName: string;
    monacoId: string;
    extension: string;
  }
> = {
  python: {
    language: 'python',
    version: '3.10.0',
    displayName: 'Python 3.10',
    monacoId: 'python',
    extension: 'py',
  },
  javascript: {
    language: 'javascript',
    version: '18.15.0',
    displayName: 'JavaScript (Node 18)',
    monacoId: 'javascript',
    extension: 'js',
  },
  cpp: {
    language: 'c++',
    version: '10.2.0',
    displayName: 'C++ (GCC 10.2)',
    monacoId: 'cpp',
    extension: 'cpp',
  },
  c: {
    language: 'c',
    version: '10.2.0',
    displayName: 'C (GCC 10.2)',
    monacoId: 'c',
    extension: 'c',
  },
  java: {
    language: 'java',
    version: '15.0.2',
    displayName: 'Java (OpenJDK 15)',
    monacoId: 'java',
    extension: 'java',
  },
  html: {
    language: 'html',
    version: 'html5',
    displayName: 'HTML/CSS/JS (Live Preview)',
    monacoId: 'html',
    extension: 'html',
  },
};

/**
 * Normalizes output string by trimming trailing whitespace and line breaks
 */
export function normalizeOutput(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Execute single code snippet via Piston API with timeout
 */
export async function runWithPiston(
  language: string,
  code: string,
  stdin: string = '',
  timeoutMs: number = 10000
): Promise<ExecutionResult> {
  const langKey = language.toLowerCase();
  const spec = SUPPORTED_LANGUAGES[langKey];

  if (!spec) {
    return {
      stdout: '',
      stderr: `Language "${language}" is not supported for remote execution.`,
      exitCode: 1,
      runtimeMs: 0,
      isError: true,
      statusMessage: 'Unsupported Language',
    };
  }

  // HTML/CSS/JS handled locally in browser
  if (langKey === 'html') {
    return {
      stdout: 'Rendered in sandbox preview',
      stderr: '',
      exitCode: 0,
      runtimeMs: 5,
      isError: false,
      statusMessage: 'OK',
    };
  }

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(PISTON_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        language: spec.language,
        version: spec.version,
        files: [{ content: code }],
        stdin: stdin ?? '',
        compile_timeout: 10000,
        run_timeout: 5000,
      }),
    });

    clearTimeout(timeoutId);
    const runtimeMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      if (langKey === 'python') {
        const local = executeLocalPython(code, stdin);
        return { ...local, runtimeMs };
      }
      if (langKey === 'javascript') {
        const local = executeLocalJavaScript(code, stdin);
        return { ...local, runtimeMs };
      }
      const errText = await response.text();
      return {
        stdout: '',
        stderr: `Piston API returned HTTP ${response.status}: ${errText || 'Execution unavailable'}`,
        exitCode: response.status,
        runtimeMs,
        isError: true,
        statusMessage: 'Service Unavailable',
      };
    }

    const data = await response.json();
    const compileStderr = data.compile?.stderr || '';
    const runStderr = data.run?.stderr || '';
    const stdout = data.run?.stdout || '';
    const exitCode = data.run?.code ?? (compileStderr ? 1 : 0);
    const isError = exitCode !== 0 || !!compileStderr;

    return {
      stdout,
      stderr: compileStderr ? `Compilation Error:\n${compileStderr}` : runStderr,
      exitCode,
      runtimeMs,
      isError,
      statusMessage: isError ? (compileStderr ? 'Compilation Error' : 'Runtime Error') : 'Success',
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const runtimeMs = Math.round(performance.now() - startTime);
    const isAbort = err instanceof DOMException && err.name === 'AbortError';

    // If Piston is blocked or offline, attempt in-browser execution fallback
    if (langKey === 'python') {
      try {
        const localResult = executeLocalPython(code, stdin);
        return { ...localResult, runtimeMs };
      } catch (e: unknown) {
        return {
          stdout: '',
          stderr: String(e),
          exitCode: 1,
          runtimeMs,
          isError: true,
          statusMessage: 'Local Python Error',
        };
      }
    }

    if (langKey === 'javascript') {
      try {
        const localResult = executeLocalJavaScript(code, stdin);
        return {
          ...localResult,
          runtimeMs,
        };
      } catch (localErr: unknown) {
        return {
          stdout: '',
          stderr: String(localErr),
          exitCode: 1,
          runtimeMs,
          isError: true,
          statusMessage: 'Local JS Error',
        };
      }
    }

    return {
      stdout: '',
      stderr: isAbort
        ? 'Time Limit Exceeded (> 10s timeout)'
        : 'Execution unavailable: Unable to reach code execution server. Please check internet connection.',
      exitCode: isAbort ? 124 : -1,
      runtimeMs,
      isError: true,
      statusMessage: isAbort ? 'Time Limit Exceeded' : 'Execution Unavailable',
    };
  }
}

/**
 * In-browser Python interpreter fallback for introductory lessons & challenges
 */
export function executeLocalPython(code: string, stdin: string = ''): ExecutionResult {
  const logs: string[] = [];

  try {
    // 1. Emulate print function
    const print = (...args: unknown[]) => {
      logs.push(
        args
          .map((a) => {
            if (typeof a === 'boolean') return a ? 'True' : 'False';
            if (a === null || a === undefined) return 'None';
            if (typeof a === 'object') return JSON.stringify(a);
            return String(a);
          })
          .join(' ')
      );
    };

    // 2. Emulate standard library builtins
    const round = (val: number, decimals: number = 0) => {
      const factor = Math.pow(10, decimals);
      return Math.round((val + Number.EPSILON) * factor) / factor;
    };
    const len = (obj: any) => obj?.length ?? 0;
    const type = (obj: any) => {
      if (typeof obj === 'string') return "<class 'str'>";
      if (typeof obj === 'number') return Number.isInteger(obj) ? "<class 'int'>" : "<class 'float'>";
      if (typeof obj === 'boolean') return "<class 'bool'>";
      return `<class '${typeof obj}'>`;
    };
    const range = (startOrStop: number, stop?: number, step: number = 1): number[] => {
      let start = 0;
      let end = startOrStop;
      if (stop !== undefined) {
        start = startOrStop;
        end = stop;
      }
      const res: number[] = [];
      if (step > 0) {
        for (let i = start; i < end; i += step) res.push(i);
      } else if (step < 0) {
        for (let i = start; i > end; i += step) res.push(i);
      }
      return res;
    };

    // 3. Emulate input / stdin
    const stdinTokens = (stdin || '').trim().split(/\s+/).filter(Boolean);
    let stdinIdx = 0;
    const input = (_prompt?: string) => stdinTokens[stdinIdx++] ?? '';

    // 4. Parse Python code to runnable JavaScript
    const lines = code.split('\n');
    let jsCode = '';
    const indentStack: number[] = [0];

    for (let rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Calculate leading spaces
      const match = rawLine.match(/^(\s*)/);
      const indent = match ? match[1].length : 0;

      // Handle un-indentation: close braces
      while (indent < indentStack[indentStack.length - 1]) {
        indentStack.pop();
        jsCode += '}\n';
      }

      let line = trimmed;

      // Convert f-strings: f"Hello {name} score {score:.2f}" -> `Hello ${name} score ${(score).toFixed(2)}`
      line = line.replace(/f"([^"]*)"/g, (_m, content) => {
        const transformed = content.replace(/\{([^}:]+)(?::\.(\d+)f)?\}/g, (_sm: string, expr: string, decimals?: string) => {
          if (decimals) {
            return `\${Number(${expr.trim()}).toFixed(${decimals})}`;
          }
          return `\${${expr.trim()}}`;
        });
        return `\`${transformed}\``;
      });
      line = line.replace(/f'([^']*)'/g, (_m, content) => {
        const transformed = content.replace(/\{([^}:]+)(?::\.(\d+)f)?\}/g, (_sm: string, expr: string, decimals?: string) => {
          if (decimals) {
            return `\${Number(${expr.trim()}).toFixed(${decimals})}`;
          }
          return `\${${expr.trim()}}`;
        });
        return `\`${transformed}\``;
      });

      // Syntax transforms
      line = line
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||')
        .replace(/\bnot\b/g, '!')
        .replace(/\bpass\b/g, '/* pass */');

      // Functions: def foo(a, b):
      if (/^def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*:/.test(line)) {
        line = line.replace(/^def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*:/, 'function $1($2) {');
        indentStack.push(indent + 1);
        jsCode += line + '\n';
        continue;
      }

      // For loops: for i in range(...):
      if (/^for\s+([a-zA-Z0-9_]+)\s+in\s+range\(([^)]*)\)\s*:/.test(line)) {
        line = line.replace(/^for\s+([a-zA-Z0-9_]+)\s+in\s+range\(([^)]*)\)\s*:/, 'for (let $1 of range($2)) {');
        indentStack.push(indent + 1);
        jsCode += line + '\n';
        continue;
      }

      // Conditionals: if / elif / else
      if (/^if\s+(.*):$/.test(line)) {
        line = line.replace(/^if\s+(.*):$/, 'if ($1) {');
        indentStack.push(indent + 1);
        jsCode += line + '\n';
        continue;
      }
      if (/^elif\s+(.*):$/.test(line)) {
        line = line.replace(/^elif\s+(.*):$/, '} else if ($1) {');
        jsCode += line + '\n';
        continue;
      }
      if (/^else\s*:$/.test(line)) {
        line = '} else {';
        jsCode += line + '\n';
        continue;
      }

      // Variable declaration helper: if variable assignment (x = ...), ensure variable is declared
      if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*/.test(line) && !line.startsWith('return ') && !line.startsWith('let ') && !line.startsWith('var ')) {
        line = 'var ' + line;
      }

      jsCode += line + ';\n';
    }

    // Close remaining open indent blocks
    while (indentStack.length > 1) {
      indentStack.pop();
      jsCode += '}\n';
    }

    // Execute generated function
    const fn = new Function('print', 'round', 'range', 'len', 'type', 'input', jsCode);
    fn(print, round, range, len, type, input);

    return {
      stdout: logs.join('\n'),
      stderr: '',
      exitCode: 0,
      runtimeMs: 8,
      isError: false,
      statusMessage: 'Success (Local Engine)',
    };
  } catch (err: unknown) {
    return {
      stdout: logs.join('\n'),
      stderr: err instanceof Error ? err.message : String(err),
      exitCode: 1,
      runtimeMs: 8,
      isError: true,
      statusMessage: 'Execution Error',
    };
  }
}

/**
 * Fallback browser evaluation for simple JavaScript challenges
 */
function executeLocalJavaScript(code: string, stdin: string): ExecutionResult {
  const logs: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;

  try {
    console.log = (...args: unknown[]) => {
      logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    };
    console.error = (...args: unknown[]) => {
      logs.push('[ERR] ' + args.join(' '));
    };

    // Provide readline-like stdin emulation
    const stdinLines = (stdin || '').split('\n');
    let lineIdx = 0;
    const readline = () => stdinLines[lineIdx++] ?? '';

    // Run code inside Function closure
    const fn = new Function('readline', 'stdin', code);
    fn(readline, stdin);

    return {
      stdout: logs.join('\n'),
      stderr: '',
      exitCode: 0,
      runtimeMs: 12,
      isError: false,
      statusMessage: 'Success (Local Engine)',
    };
  } catch (e: unknown) {
    return {
      stdout: logs.join('\n'),
      stderr: e instanceof Error ? e.message : String(e),
      exitCode: 1,
      runtimeMs: 12,
      isError: true,
      statusMessage: 'Runtime Error',
    };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

/**
 * Execute code against multiple test cases and return full verdict
 */
export async function executeTestCases(
  language: string,
  code: string,
  testCases: TestCase[],
  onProgress?: (completed: number, total: number) => void
): Promise<SubmissionVerdict> {
  const results: TestResult[] = [];
  let totalRuntime = 0;
  let hasCompilationError = false;
  let compilationMessage = '';

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const execRes = await runWithPiston(language, code, tc.input);

    totalRuntime += execRes.runtimeMs;

    if (execRes.statusMessage === 'Compilation Error') {
      hasCompilationError = true;
      compilationMessage = execRes.stderr;
      results.push({
        testCaseId: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: '',
        passed: false,
        runtimeMs: execRes.runtimeMs,
        error: execRes.stderr,
      });
      break;
    }

    const normActual = normalizeOutput(execRes.stdout);
    const normExpected = normalizeOutput(tc.expectedOutput);
    const passed = !execRes.isError && normActual === normExpected;

    results.push({
      testCaseId: tc.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: execRes.stdout,
      passed,
      runtimeMs: execRes.runtimeMs,
      error: execRes.stderr || undefined,
    });

    if (onProgress) {
      onProgress(i + 1, testCases.length);
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = testCases.length;

  let status: SubmissionVerdict['status'] = 'Accepted';
  let message = 'All test cases passed!';

  if (hasCompilationError) {
    status = 'Compilation Error';
    message = compilationMessage || 'Code failed to compile.';
  } else if (results.some((r) => r.error && r.error.includes('Time Limit Exceeded'))) {
    status = 'Time Limit Exceeded';
    message = 'Your solution exceeded the time limit.';
  } else if (results.some((r) => r.error && !r.passed)) {
    status = 'Runtime Error';
    message = 'A runtime error occurred during test execution.';
  } else if (passedCount < totalCount) {
    status = 'Wrong Answer';
    message = `${passedCount} of ${totalCount} test cases passed.`;
  }

  return {
    status,
    passedCount,
    totalCount,
    runtimeMs: totalRuntime,
    results,
    message,
  };
}

/**
 * Builds sandboxed HTML srcdoc for live interactive web preview
 */
export function buildHtmlSrcdoc(html: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 16px;
      color: #111827;
      background: #ffffff;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}
