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

    // If Piston is blocked or offline, attempt in-browser JavaScript execution fallback
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
