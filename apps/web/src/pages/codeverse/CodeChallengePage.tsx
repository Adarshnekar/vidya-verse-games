import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  HardDrive,
  Trophy,
  Search,
  Filter,
  Check,
  ChevronRight,
  Code,
  Terminal,
  Layers,
  Sparkles,
  HelpCircle,
  History,
  ExternalLink,
} from 'lucide-react';
import {
  runWithPiston,
  executeTestCases,
  SUPPORTED_LANGUAGES,
  TestCase,
  TestResult,
  SubmissionVerdict,
} from '../../services/codeRunner';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';
import { useUIStore } from '../../stores/uiStore';

export interface ChallengeProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  points: number;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: Record<string, string>;
  testCases: TestCase[];
  hiddenTestCases: TestCase[];
}

export interface SubmissionRecord {
  id: string;
  problemId: string;
  problemTitle: string;
  language: string;
  status: SubmissionVerdict['status'];
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  timestamp: string;
}

// 10 Comprehensive Built-in Problems
export const CHALLENGE_PROBLEMS: ChallengeProblem[] = [
  {
    id: 'prob-1',
    title: '1. Hello World',
    difficulty: 'Easy',
    topics: ['Basics', 'Strings'],
    points: 50,
    description:
      'Write a program that prints the iconic greeting `"Hello, World!"` (without quotation marks) followed by a newline to standard output.',
    constraints: ['No input required.', 'Exact string matching is required.'],
    examples: [
      {
        input: '(None)',
        output: 'Hello, World!',
        explanation: 'Prints standard greeting message.',
      },
    ],
    starterCode: {
      python: `# Write your solution below\nprint("Hello, World!")\n`,
      javascript: `// Write your solution below\nconsole.log("Hello, World!");\n`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n`,
      c: `#include <stdio.h>\n\nint main() {\n    // Write your solution below\n    printf("Hello, World!\\n");\n    return 0;\n}\n`,
      java: `public class Main {\n    public static void main(String[] args) {\n        // Write your solution below\n        System.out.println("Hello, World!");\n    }\n}\n`,
    },
    testCases: [
      { id: 1, input: '', expectedOutput: 'Hello, World!' },
    ],
    hiddenTestCases: [
      { id: 2, input: '', expectedOutput: 'Hello, World!' },
    ],
  },
  {
    id: 'prob-2',
    title: '2. Sum of Two Numbers',
    difficulty: 'Easy',
    topics: ['Basics', 'Math'],
    points: 50,
    description:
      'Given two space-separated integers `a` and `b` on a single line from standard input, calculate and print their sum `a + b`.',
    constraints: ['-10^6 <= a, b <= 10^6'],
    examples: [
      {
        input: '3 5',
        output: '8',
        explanation: '3 + 5 = 8',
      },
      {
        input: '12 8',
        output: '20',
      },
    ],
    starterCode: {
      python: `import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    a = int(data[0])\n    b = int(data[1])\n    # Calculate and print sum\n    print(a + b)\n\nif __name__ == '__main__':\n    main()\n`,
      javascript: `const fs = require('fs');\n\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n    if (input.length < 2) return;\n    const a = parseInt(input[0], 10);\n    const b = parseInt(input[1], 10);\n    console.log(a + b);\n}\n\nmain();\n`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    long long a, b;\n    if (cin >> a >> b) {\n        cout << a + b << endl;\n    }\n    return 0;\n}\n`,
      c: `#include <stdio.h>\n\nint main() {\n    long long a, b;\n    if (scanf("%lld %lld", &a, &b) == 2) {\n        printf("%lld\\n", a + b);\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLong()) {\n            long a = sc.nextLong();\n            long b = sc.nextLong();\n            System.out.println(a + b);\n        }\n    }\n}\n`,
    },
    testCases: [
      { id: 1, input: '3 5', expectedOutput: '8' },
      { id: 2, input: '10 25', expectedOutput: '35' },
    ],
    hiddenTestCases: [
      { id: 3, input: '-4 9', expectedOutput: '5' },
      { id: 4, input: '1000 2500', expectedOutput: '3500' },
    ],
  },
  {
    id: 'prob-3',
    title: '3. FizzBuzz',
    difficulty: 'Easy',
    topics: ['Math', 'Logic'],
    points: 75,
    description:
      'Given an integer `n` from standard input, print numbers from 1 to `n` on separate lines. For multiples of 3, print `"Fizz"`. For multiples of 5, print `"Buzz"`. For multiples of both 3 and 5, print `"FizzBuzz"`.',
    constraints: ['1 <= n <= 100'],
    examples: [
      {
        input: '5',
        output: '1\n2\nFizz\n4\nBuzz',
        explanation: '3 is divisible by 3 (Fizz), 5 is divisible by 5 (Buzz).',
      },
    ],
    starterCode: {
      python: `import sys\n\ndef fizzbuzz(n):\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            print("FizzBuzz")\n        elif i % 3 == 0:\n            print("Fizz")\n        elif i % 5 == 0:\n            print("Buzz")\n        else:\n            print(i)\n\nif __name__ == '__main__':\n    raw = sys.stdin.read().strip()\n    if raw:\n        fizzbuzz(int(raw))\n`,
      javascript: `const fs = require('fs');\n\nfunction fizzbuzz(n) {\n    for (let i = 1; i <= n; i++) {\n        if (i % 15 === 0) console.log("FizzBuzz");\n        else if (i % 3 === 0) console.log("Fizz");\n        else if (i % 5 === 0) console.log("Buzz");\n        else console.log(i);\n    }\n}\n\nconst raw = fs.readFileSync(0, 'utf-8').trim();\nif (raw) fizzbuzz(parseInt(raw, 10));\n`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) cout << "FizzBuzz\\n";\n            else if (i % 3 == 0) cout << "Fizz\\n";\n            else if (i % 5 == 0) cout << "Buzz\\n";\n            else cout << i << "\\n";\n        }\n    }\n    return 0;\n}\n`,
      c: `#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) printf("FizzBuzz\\n");\n            else if (i % 3 == 0) printf("Fizz\\n");\n            else if (i % 5 == 0) printf("Buzz\\n");\n            else printf("%d\\n", i);\n        }\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            for (int i = 1; i <= n; i++) {\n                if (i % 15 == 0) System.out.println("FizzBuzz");\n                else if (i % 3 == 0) System.out.println("Fizz");\n                else if (i % 5 == 0) System.out.println("Buzz");\n                else System.out.println(i);\n            }\n        }\n    }\n}\n`,
    },
    testCases: [
      { id: 1, input: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz' },
      { id: 2, input: '3', expectedOutput: '1\n2\nFizz' },
    ],
    hiddenTestCases: [
      { id: 3, input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' },
    ],
  },
  {
    id: 'prob-4',
    title: '4. Fibonacci',
    difficulty: 'Easy',
    topics: ['Math', 'Dynamic Programming', 'Recursion'],
    points: 100,
    description:
      'Given an integer `n` from standard input, calculate the `n`-th Fibonacci number. Assume `F(0) = 0`, `F(1) = 1`, and `F(n) = F(n-1) + F(n-2)` for `n >= 2`.',
    constraints: ['0 <= n <= 30'],
    examples: [
      {
        input: '6',
        output: '8',
        explanation: 'F(0)=0, F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5, F(6)=8.',
      },
      {
        input: '0',
        output: '0',
      },
    ],
    starterCode: {
      python: `import sys\n\ndef fib(n):\n    if n <= 0: return 0\n    if n == 1: return 1\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\nif __name__ == '__main__':\n    raw = sys.stdin.read().strip()\n    if raw:\n        print(fib(int(raw)))\n`,
      javascript: `const fs = require('fs');\n\nfunction fib(n) {\n    if (n <= 0) return 0;\n    if (n === 1) return 1;\n    let a = 0, b = 1;\n    for (let i = 2; i <= n; i++) {\n        const c = a + b;\n        a = b;\n        b = c;\n    }\n    return b;\n}\n\nconst raw = fs.readFileSync(0, 'utf-8').trim();\nif (raw) console.log(fib(parseInt(raw, 10)));\n`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        if (n <= 0) { cout << 0 << endl; return 0; }\n        if (n == 1) { cout << 1 << endl; return 0; }\n        long long a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            long long c = a + b;\n            a = b;\n            b = c;\n        }\n        cout << b << endl;\n    }\n    return 0;\n}\n`,
      c: `#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        if (n <= 0) { printf("0\\n"); return 0; }\n        if (n == 1) { printf("1\\n"); return 0; }\n        long long a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            long long c = a + b;\n            a = b;\n            b = c;\n        }\n        printf("%lld\\n", b);\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            if (n <= 0) { System.out.println(0); return; }\n            if (n == 1) { System.out.println(1); return; }\n            long a = 0, b = 1;\n            for (int i = 2; i <= n; i++) {\n                long c = a + b;\n                a = b;\n                b = c;\n            }\n            System.out.println(b);\n        }\n    }\n}\n`,
    },
    testCases: [
      { id: 1, input: '6', expectedOutput: '8' },
      { id: 2, input: '10', expectedOutput: '55' },
    ],
    hiddenTestCases: [
      { id: 3, input: '0', expectedOutput: '0' },
      { id: 4, input: '12', expectedOutput: '144' },
    ],
  },
  {
    id: 'prob-5',
    title: '5. Palindrome Check',
    difficulty: 'Medium',
    topics: ['Strings', 'Two Pointers'],
    points: 150,
    description:
      'Given a string `s` from standard input, print `"true"` if the string is a palindrome (reads identical forwards and backwards), otherwise print `"false"`. The check is case-sensitive.',
    constraints: ['1 <= length(s) <= 10^5', 'String contains alphanumeric characters.'],
    examples: [
      {
        input: 'racecar',
        output: 'true',
        explanation: 'racecar reversed is racecar.',
      },
      {
        input: 'vidyaverse',
        output: 'false',
        explanation: 'vidyaverse reversed is esrewaydiv.',
      },
    ],
    starterCode: {
      python: `import sys\n\ndef is_palindrome(s):\n    return "true" if s == s[::-1] else "false"\n\nif __name__ == '__main__':\n    s = sys.stdin.read().strip()\n    if s:\n        print(is_palindrome(s))\n`,
      javascript: `const fs = require('fs');\n\nfunction isPalindrome(s) {\n    const rev = s.split('').reverse().join('');\n    return s === rev ? 'true' : 'false';\n}\n\nconst s = fs.readFileSync(0, 'utf-8').trim();\nif (s) console.log(isPalindrome(s));\n`,
      cpp: `#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        string r = s;\n        reverse(r.begin(), r.end());\n        cout << (s == r ? "true" : "false") << endl;\n    }\n    return 0;\n}\n`,
      c: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if (scanf("%s", s) == 1) {\n        int len = strlen(s);\n        int pal = 1;\n        for (int i = 0; i < len / 2; i++) {\n            if (s[i] != s[len - 1 - i]) {\n                pal = 0;\n                break;\n            }\n        }\n        printf("%s\\n", pal ? "true" : "false");\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            String r = new StringBuilder(s).reverse().toString();\n            System.out.println(s.equals(r) ? "true" : "false");\n        }\n    }\n}\n`,
    },
    testCases: [
      { id: 1, input: 'racecar', expectedOutput: 'true' },
      { id: 2, input: 'vidyaverse', expectedOutput: 'false' },
    ],
    hiddenTestCases: [
      { id: 3, input: 'madam', expectedOutput: 'true' },
      { id: 4, input: 'a', expectedOutput: 'true' },
    ],
  },
  {
    id: 'prob-6',
    title: '6. Array Maximum',
    difficulty: 'Easy',
    topics: ['Arrays', 'Algorithms'],
    points: 50,
    description:
      'Given an integer `n` followed by `n` space-separated integers, find and print the maximum value in the array.',
    constraints: ['1 <= n <= 10^5', '-10^9 <= element <= 10^9'],
    examples: [
      {
        input: '5\n12 45 7 89 23',
        output: '89',
        explanation: '89 is the maximum value.',
      },
    ],
    starterCode: {
      python: `import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    nums = [int(x) for x in data[1:n+1]]\n    print(max(nums))\n\nif __name__ == '__main__':\n    main()\n`,
      javascript: `const fs = require('fs');\n\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n    if (input.length < 2) return;\n    const n = parseInt(input[0], 10);\n    let maxVal = -Infinity;\n    for (let i = 1; i <= n; i++) {\n        const val = parseInt(input[i], 10);\n        if (val > maxVal) maxVal = val;\n    }\n    console.log(maxVal);\n}\n\nmain();\n`,
      cpp: `#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n && n > 0) {\n        long long maxVal, val;\n        cin >> maxVal;\n        for (int i = 1; i < n; i++) {\n            cin >> val;\n            if (val > maxVal) maxVal = val;\n        }\n        cout << maxVal << endl;\n    }\n    return 0;\n}\n`,
      c: `#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1 && n > 0) {\n        long long maxVal, val;\n        scanf("%lld", &maxVal);\n        for (int i = 1; i < n; i++) {\n            scanf("%lld", &val);\n            if (val > maxVal) maxVal = val;\n        }\n        printf("%lld\\n", maxVal);\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            long maxVal = sc.nextLong();\n            for (int i = 1; i < n; i++) {\n                long val = sc.nextLong();\n                if (val > maxVal) maxVal = val;\n            }\n            System.out.println(maxVal);\n        }\n    }\n}\n`,
    },
    testCases: [
      { id: 1, input: '5\n12 45 7 89 23', expectedOutput: '89' },
      { id: 2, input: '4\n-10 -5 -20 -1', expectedOutput: '-1' },
    ],
    hiddenTestCases: [
      { id: 3, input: '3\n100 200 50', expectedOutput: '200' },
      { id: 4, input: '1\n42', expectedOutput: '42' },
    ],
  },
  {
    id: 'prob-7',
    title: '7. Count Vowels',
    difficulty: 'Easy',
    topics: ['Strings', 'Basics'],
    points: 50,
    description:
      'Given a string `s`, count the total number of vowels (`a, e, i, o, u`, case-insensitive) present in the string.',
    constraints: ['1 <= length(s) <= 10^5'],
    examples: [
      {
        input: 'education',
        output: '5',
        explanation: 'Vowels: e, u, a, i, o = 5 vowels.',
      },
      {
        input: 'rhythm',
        output: '0',
      },
    ],
    starterCode: {
      python: `import sys\n\ndef count_vowels(s):\n    vowels = set("aeiouAEIOU")\n    return sum(1 for ch in s if ch in vowels)\n\nif __name__ == '__main__':\n    s = sys.stdin.read().strip()\n    print(count_vowels(s))\n`,
      javascript: `const fs = require('fs');\n\nfunction countVowels(s) {\n    const matches = s.match(/[aeiou]/gi);\n    return matches ? matches.length : 0;\n}\n\nconst s = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(countVowels(s));\n`,
      cpp: `#include <iostream>\n#include <string>\n#include <cctype>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        int cnt = 0;\n        for (char c : s) {\n            char l = tolower(c);\n            if (l == 'a' || l == 'e' || l == 'i' || l == 'o' || l == 'u') cnt++;\n        }\n        cout << cnt << endl;\n    }\n    return 0;\n}\n`,
      c: `#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n\nint main() {\n    char s[100005];\n    if (scanf("%s", s) == 1) {\n        int cnt = 0;\n        for (int i = 0; s[i]; i++) {\n            char l = tolower(s[i]);\n            if (l == 'a' || l == 'e' || l == 'i' || l == 'o' || l == 'u') cnt++;\n        }\n        printf("%d\\n", cnt);\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            int cnt = 0;\n            for (char c : s.toLowerCase().toCharArray()) {\n                if ("aeiou".indexOf(c) != -1) cnt++;\n            }\n            System.out.println(cnt);\n        }\n    }\n}\n`,
    },
    testCases: [
      { id: 1, input: 'education', expectedOutput: '5' },
      { id: 2, input: 'rhythm', expectedOutput: '0' },
    ],
    hiddenTestCases: [
      { id: 3, input: 'VidyaVerse', expectedOutput: '4' },
      { id: 4, input: 'AEIOU', expectedOutput: '5' },
    ],
  },
  {
    id: 'prob-8',
    title: '8. Reverse String',
    difficulty: 'Easy',
    topics: ['Strings', 'Algorithms'],
    points: 50,
    description:
      'Given a single word or string `s`, print the characters in reverse order.',
    constraints: ['1 <= length(s) <= 10^5'],
    examples: [
      {
        input: 'vidyaverse',
        output: 'esrevaydiv',
      },
      {
        input: 'hello',
        output: 'olleh',
      },
    ],
    starterCode: {
      python: `import sys\n\ns = sys.stdin.read().strip()\nprint(s[::-1])\n`,
      javascript: `const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(s.split('').reverse().join(''));\n`,
      cpp: `#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        reverse(s.begin(), s.end());\n        cout << s << endl;\n    }\n    return 0;\n}\n`,
      c: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if (scanf("%s", s) == 1) {\n        int len = strlen(s);\n        for (int i = len - 1; i >= 0; i--) {\n            putchar(s[i]);\n        }\n        putchar('\\n');\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            System.out.println(new StringBuilder(s).reverse().toString());\n        }\n    }\n}\n`,
    },
    testCases: [
      { id: 1, input: 'vidyaverse', expectedOutput: 'esrevaydiv' },
      { id: 2, input: 'hello', expectedOutput: 'olleh' },
    ],
    hiddenTestCases: [
      { id: 3, input: 'abcde', expectedOutput: 'edcba' },
      { id: 4, input: 'code', expectedOutput: 'edoc' },
    ],
  },
  {
    id: 'prob-9',
    title: '9. Prime Check',
    difficulty: 'Medium',
    topics: ['Math', 'Number Theory'],
    points: 150,
    description:
      'Given an integer `n` (> 1) from standard input, print `"true"` if `n` is a prime number (has only two factors: 1 and itself), otherwise print `"false"`.',
    constraints: ['2 <= n <= 10^9'],
    examples: [
      {
        input: '29',
        output: 'true',
        explanation: '29 has no divisors other than 1 and 29.',
      },
      {
        input: '15',
        output: 'false',
        explanation: '15 is divisible by 3 and 5.',
      },
    ],
    starterCode: {
      python: `import sys\nimport math\n\ndef is_prime(n):\n    if n < 2: return "false"\n    if n in (2, 3): return "true"\n    if n % 2 == 0 or n % 3 == 0: return "false"\n    i = 5\n    while i * i <= n:\n        if n % i == 0 or n % (i + 2) == 0:\n            return "false"\n        i += 6\n    return "true"\n\nif __name__ == '__main__':\n    raw = sys.stdin.read().strip()\n    if raw:\n        print(is_prime(int(raw)))\n`,
      javascript: `const fs = require('fs');\n\nfunction isPrime(n) {\n    if (n < 2) return 'false';\n    if (n === 2 || n === 3) return 'true';\n    if (n % 2 === 0 || n % 3 === 0) return 'false';\n    for (let i = 5; i * i <= n; i += 6) {\n        if (n % i === 0 || n % (i + 2) === 0) return 'false';\n    }\n    return 'true';\n}\n\nconst raw = fs.readFileSync(0, 'utf-8').trim();\nif (raw) console.log(isPrime(parseInt(raw, 10)));\n`,
      cpp: `#include <iostream>\nusing namespace std;\n\nbool isPrime(long long n) {\n    if (n < 2) return false;\n    if (n == 2 || n == 3) return true;\n    if (n % 2 == 0 || n % 3 == 0) return false;\n    for (long long i = 5; i * i <= n; i += 6) {\n        if (n % i == 0 || n % (i + 2) == 0) return false;\n    }\n    return true;\n}\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        cout << (isPrime(n) ? "true" : "false") << endl;\n    }\n    return 0;\n}\n`,
      c: `#include <stdio.h>\n#include <stdbool.h>\n\nbool isPrime(long long n) {\n    if (n < 2) return false;\n    if (n == 2 || n == 3) return true;\n    if (n % 2 == 0 || n % 3 == 0) return false;\n    for (long long i = 5; i * i <= n; i += 6) {\n        if (n % i == 0 || n % (i + 2) == 0) return false;\n    }\n    return true;\n}\n\nint main() {\n    long long n;\n    if (scanf("%lld", &n) == 1) {\n        printf("%s\\n", isPrime(n) ? "true" : "false");\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    static boolean isPrime(long n) {\n        if (n < 2) return false;\n        if (n == 2 || n == 3) return true;\n        if (n % 2 == 0 || n % 3 == 0) return false;\n        for (long i = 5; i * i <= n; i += 6) {\n            if (n % i == 0 || n % (i + 2) == 0) return false;\n        }\n        return true;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLong()) {\n            long n = sc.nextLong();\n            System.out.println(isPrime(n) ? "true" : "false");\n        }\n    }\n}\n`,
    },
    testCases: [
      { id: 1, input: '29', expectedOutput: 'true' },
      { id: 2, input: '15', expectedOutput: 'false' },
    ],
    hiddenTestCases: [
      { id: 3, input: '2', expectedOutput: 'true' },
      { id: 4, input: '97', expectedOutput: 'true' },
    ],
  },
  {
    id: 'prob-10',
    title: '10. Binary Search',
    difficulty: 'Medium',
    topics: ['Searching', 'Algorithms'],
    points: 150,
    description:
      'Given an integer `n` (array length) and a `target` on line 1, followed by `n` sorted integers on line 2, find the 0-based index of `target` in O(log n) time. If `target` is not present, print `-1`.',
    constraints: ['1 <= n <= 10^5', 'Array is strictly sorted in ascending order.'],
    examples: [
      {
        input: '5 30\n10 20 30 40 50',
        output: '2',
        explanation: '30 is at index 2 (10=0, 20=1, 30=2).',
      },
      {
        input: '4 25\n10 20 30 40',
        output: '-1',
        explanation: '25 is not in array.',
      },
    ],
    starterCode: {
      python: `import sys\n\ndef binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if data:\n        n = int(data[0])\n        target = int(data[1])\n        nums = [int(x) for x in data[2:n+2]]\n        print(binary_search(nums, target))\n`,
      javascript: `const fs = require('fs');\n\nfunction binarySearch(nums, target) {\n    let left = 0, right = nums.length - 1;\n    while (left <= right) {\n        const mid = Math.floor((left + right) / 2);\n        if (nums[mid] === target) return mid;\n        else if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}\n\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    const n = parseInt(input[0], 10);\n    const target = parseInt(input[1], 10);\n    const nums = input.slice(2, n + 2).map(x => parseInt(x, 10));\n    console.log(binarySearch(nums, target));\n}\n`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    long long target;\n    if (cin >> n >> target) {\n        vector<long long> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        int l = 0, r = n - 1, ans = -1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (a[mid] == target) { ans = mid; break; }\n            else if (a[mid] < target) l = mid + 1;\n            else r = mid - 1;\n        }\n        cout << ans << endl;\n    }\n    return 0;\n}\n`,
      c: `#include <stdio.h>\n\nint main() {\n    int n;\n    long long target;\n    if (scanf("%d %lld", &n, &target) == 2) {\n        long long a[100005];\n        for (int i = 0; i < n; i++) scanf("%lld", &a[i]);\n        int l = 0, r = n - 1, ans = -1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (a[mid] == target) { ans = mid; break; }\n            else if (a[mid] < target) l = mid + 1;\n            else r = mid - 1;\n        }\n        printf("%d\\n", ans);\n    }\n    return 0;\n}\n`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            long target = sc.nextLong();\n            long[] a = new long[n];\n            for (int i = 0; i < n; i++) a[i] = sc.nextLong();\n            int l = 0, r = n - 1, ans = -1;\n            while (l <= r) {\n                int mid = l + (r - l) / 2;\n                if (a[mid] == target) { ans = mid; break; }\n                else if (a[mid] < target) l = mid + 1;\n                else r = mid - 1;\n            }\n            System.out.println(ans);\n        }\n    }\n}\n`,
    },
    testCases: [
      { id: 1, input: '5 30\n10 20 30 40 50', expectedOutput: '2' },
      { id: 2, input: '4 25\n10 20 30 40', expectedOutput: '-1' },
    ],
    hiddenTestCases: [
      { id: 3, input: '6 1\n1 3 5 7 9 11', expectedOutput: '0' },
      { id: 4, input: '5 50\n10 20 30 40 50', expectedOutput: '4' },
    ],
  },
];

export const CodeChallengePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { problemId } = useParams<{ problemId?: string }>();
  const initialId = problemId || searchParams.get('id') || 'prob-1';
  const initialLang = searchParams.get('lang') || 'python';

  // State
  const [selectedProblem, setSelectedProblem] = useState<ChallengeProblem>(() => {
    return CHALLENGE_PROBLEMS.find((p) => p.id === initialId) || CHALLENGE_PROBLEMS[0];
  });
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    SUPPORTED_LANGUAGES[initialLang] ? initialLang : 'python'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');

  // Editor code
  const [editorCode, setEditorCode] = useState<string>(() => {
    const p = CHALLENGE_PROBLEMS.find((prob) => prob.id === initialId) || CHALLENGE_PROBLEMS[0];
    return p.starterCode[initialLang] || p.starterCode.python;
  });

  // Execution & Output state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'console' | 'history'>('tests');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<{ stdout: string; stderr: string; runtimeMs: number }>({
    stdout: '',
    stderr: '',
    runtimeMs: 0,
  });
  const [verdict, setVerdict] = useState<SubmissionVerdict | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('vidyaverse_submissions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Stores
  const { markCompleted } = useProgressStore();
  const { addXP } = useAuthStore();
  const { theme } = useUIStore();

  // Load starter code when problem or language changes (unless user has edits)
  const handleProblemSelect = (prob: ChallengeProblem) => {
    setSelectedProblem(prob);
    setVerdict(null);
    setTestResults([]);
    const code = prob.starterCode[selectedLanguage] || prob.starterCode.python || '';
    setEditorCode(code);
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setVerdict(null);
    setTestResults([]);
    const code = selectedProblem.starterCode[lang] || selectedProblem.starterCode.python || '';
    setEditorCode(code);
  };

  const handleResetCode = () => {
    const code = selectedProblem.starterCode[selectedLanguage] || selectedProblem.starterCode.python || '';
    setEditorCode(code);
  };

  // Run visible test cases
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab('tests');
    setVerdict(null);

    try {
      const results: TestResult[] = [];
      let allStdout = '';
      let allStderr = '';
      let totalRuntime = 0;

      for (const tc of selectedProblem.testCases) {
        const res = await runWithPiston(selectedLanguage, editorCode, tc.input);
        totalRuntime += res.runtimeMs;
        allStdout += res.stdout ? `[TC ${tc.id} STDOUT]\n${res.stdout}\n` : '';
        if (res.stderr) allStderr += `[TC ${tc.id} STDERR]\n${res.stderr}\n`;

        const normActual = res.stdout.trim();
        const normExpected = tc.expectedOutput.trim();
        const passed = !res.isError && normActual === normExpected;

        results.push({
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: res.stdout,
          passed,
          runtimeMs: res.runtimeMs,
          error: res.stderr || undefined,
        });
      }

      setTestResults(results);
      setConsoleOutput({
        stdout: allStdout || 'Execution completed without standard output.',
        stderr: allStderr,
        runtimeMs: totalRuntime,
      });
    } catch (err: unknown) {
      setConsoleOutput({
        stdout: '',
        stderr: String(err),
        runtimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit against all visible + hidden test cases
  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setActiveTab('tests');

    const allTestCases = [...selectedProblem.testCases, ...selectedProblem.hiddenTestCases];

    try {
      const result = await executeTestCases(selectedLanguage, editorCode, allTestCases);
      setVerdict(result);
      setTestResults(result.results.filter((r) => !selectedProblem.hiddenTestCases.some((h) => h.id === r.testCaseId)));

      // Save submission record
      const record: SubmissionRecord = {
        id: `sub_${Date.now()}`,
        problemId: selectedProblem.id,
        problemTitle: selectedProblem.title,
        language: selectedLanguage,
        status: result.status,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        runtimeMs: result.runtimeMs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      const newHistory = [record, ...submissionHistory.slice(0, 19)];
      setSubmissionHistory(newHistory);
      localStorage.setItem('vidyaverse_submissions', JSON.stringify(newHistory));

      // Award XP and complete progress on Accepted
      if (result.status === 'Accepted') {
        markCompleted('codeverse', selectedProblem.id, 100);
        addXP(selectedProblem.points);
      }
    } catch (err: unknown) {
      setVerdict({
        status: 'Runtime Error',
        passedCount: 0,
        totalCount: allTestCases.length,
        runtimeMs: 0,
        results: [],
        message: 'Execution unavailable: ' + String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter problems
  const filteredProblems = CHALLENGE_PROBLEMS.filter((p) => {
    const matchesTopic = topicFilter === 'All' || p.topics.includes(topicFilter);
    const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTopic && matchesDiff && matchesSearch;
  });

  return (
    <div className="flex h-full w-full rounded-2xl border border-border bg-card text-text-primary font-sans overflow-hidden shadow-soft">
      {/* 1. LEFT PANEL: 1/3 WIDTH PROBLEM LIST & PROBLEM DESCRIPTION */}
      <aside className="w-1/3 min-w-[340px] max-w-[480px] border-r border-border bg-card flex flex-col z-10 text-text-primary">
        {/* Search & Topic Filters */}
        <div className="p-3 border-b border-border bg-card space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#EAE7FF] text-[#6541F5] dark:bg-[#26233E] dark:text-[#C4B5FD]">
              <Code className="w-4 h-4" />
            </span>
            <span className="font-display font-bold text-sm text-text-primary">Code Challenge Arena</span>
            <span className="badge-purple text-[10px] ml-auto">10 Problems</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search problems or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-canvas border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[#6541F5]"
            />
          </div>

          {/* Difficulty & Topic Filter Pills */}
          <div className="flex items-center justify-between gap-1 text-[10px]">
            <div className="flex items-center gap-1">
              {(['All', 'Easy', 'Medium'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-2 py-0.5 rounded-full font-semibold transition-colors ${
                    difficultyFilter === diff
                      ? 'bg-[#6541F5] text-white shadow-sm'
                      : 'bg-canvas text-text-muted hover:text-text-primary border border-border'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="bg-canvas border border-border rounded px-2 py-0.5 text-text-primary text-[10px] focus:outline-none focus:border-[#6541F5]"
            >
              <option value="All">All Topics</option>
              <option value="Basics">Basics</option>
              <option value="Math">Math</option>
              <option value="Strings">Strings</option>
              <option value="Arrays">Arrays</option>
              <option value="Searching">Searching</option>
            </select>
          </div>
        </div>

        {/* Scrollable Problem List & Selected Problem Details */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Quick Problem Selector Bar */}
          <div className="p-2 border-b border-border bg-canvas/40 flex gap-1.5 overflow-x-auto shrink-0">
            {filteredProblems.map((p) => {
              const isSelected = selectedProblem.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleProblemSelect(p)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono shrink-0 flex items-center gap-1 border transition-all ${
                    isSelected
                      ? 'bg-[#6541F5]/10 text-[#6541F5] dark:text-[#C4B5FD] border-[#6541F5] font-semibold shadow-sm'
                      : 'bg-card text-text-muted border-border hover:border-[#6541F5]/40'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      p.difficulty === 'Easy'
                        ? 'bg-[#19B99A]'
                        : p.difficulty === 'Medium'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span>P{p.id.replace('prob-', '')}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Problem Description & Specifications */}
          <div className="p-4 flex-1 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                    selectedProblem.difficulty === 'Easy'
                      ? 'bg-[#DDF8EE] text-[#19B99A] dark:bg-[#0D2E26]'
                      : selectedProblem.difficulty === 'Medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                  }`}
                >
                  {selectedProblem.difficulty}
                </span>
                <span className="text-[11px] font-mono text-[#6541F5] dark:text-[#C4B5FD] font-semibold">
                  +{selectedProblem.points} XP
                </span>
              </div>
              <h2 className="text-lg font-display font-bold text-text-primary">{selectedProblem.title}</h2>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {selectedProblem.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-canvas text-text-muted border border-border"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Problem Statement */}
            <div className="text-xs text-text-muted leading-relaxed bg-canvas p-3 rounded-xl border border-border">
              {selectedProblem.description}
            </div>

            {/* Constraints */}
            <div>
              <div className="text-[11px] font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Constraints
              </div>
              <ul className="text-xs space-y-1 text-text-muted font-mono bg-canvas p-2.5 rounded-lg border border-border">
                {selectedProblem.constraints.map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-text-muted/60" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Examples */}
            <div>
              <div className="text-[11px] font-semibold text-text-primary uppercase tracking-wider mb-2">
                Examples
              </div>
              <div className="space-y-2.5">
                {selectedProblem.examples.map((ex, idx) => (
                  <div key={idx} className="bg-canvas p-3 rounded-xl border border-border text-xs">
                    <div className="text-[11px] font-semibold text-text-primary mb-1">Example {idx + 1}</div>
                    <div className="space-y-1 font-mono">
                      <div className="text-text-muted">
                        <span className="text-text-muted/70">Input:</span> {ex.input}
                      </div>
                      <div className="text-[#19B99A] font-semibold">
                        <span className="text-text-muted/70">Output:</span> {ex.output}
                      </div>
                    </div>
                    {ex.explanation && (
                      <div className="text-[11px] text-text-muted mt-1.5 pt-1.5 border-t border-border">
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. RIGHT PANEL: 2/3 WIDTH MONACO CODE EDITOR & OUTPUT/TEST PANEL */}
      <main className="flex-1 flex flex-col overflow-hidden bg-canvas">
        {/* Editor Top Bar */}
        <div className="h-12 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-muted font-medium">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-canvas border border-border rounded-lg px-2.5 py-1 text-xs font-semibold text-text-primary focus:outline-none focus:border-[#6541F5] cursor-pointer"
              >
                <option value="python">Python 3.10</option>
                <option value="javascript">JavaScript (Node 18)</option>
                <option value="cpp">C++ (GCC 10.2)</option>
                <option value="c">C (GCC 10.2)</option>
                <option value="java">Java (OpenJDK 15)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCode}
              className="px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 text-text-muted hover:text-text-primary border border-border hover:bg-canvas transition-colors"
              title="Reset code to original starter template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Run Button */}
            <button
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-border text-text-primary hover:bg-canvas transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 text-[#19B99A] fill-current" />
              <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
            </button>

            {/* Submit Button */}
            <button
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 bg-[#6541F5] hover:bg-[#5230E8] text-white shadow-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div className="flex-1 relative min-h-[300px]">
          <Editor
            height="100%"
            theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            language={SUPPORTED_LANGUAGES[selectedLanguage]?.monacoId || 'python'}
            value={editorCode}
            onChange={(val) => setEditorCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 4,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </div>

        {/* OUTPUT & TEST RESULTS PANEL (HEIGHT ADJUSTABLE) */}
        <div className="h-64 border-t border-border bg-card flex flex-col shrink-0 text-text-primary">
          {/* Output Panel Header Tabs */}
          <div className="h-10 border-b border-border px-4 bg-card flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('tests')}
                className={`py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'tests'
                    ? 'border-[#6541F5] text-[#6541F5] dark:text-[#C4B5FD]'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Test Cases {testResults.length > 0 && `(${testResults.filter((r) => r.passed).length}/${testResults.length})`}</span>
              </button>

              <button
                onClick={() => setActiveTab('console')}
                className={`py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'console'
                    ? 'border-[#6541F5] text-[#6541F5] dark:text-[#C4B5FD]'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Console Output</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'history'
                    ? 'border-[#6541F5] text-[#6541F5] dark:text-[#C4B5FD]'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Submissions ({submissionHistory.length})</span>
              </button>
            </div>

            {/* Verdict Badge in Header */}
            {verdict && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  verdict.status === 'Accepted'
                    ? 'bg-[#DDF8EE] text-[#19B99A] dark:bg-[#0D2E26] border border-[#19B99A]/40'
                    : 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-500/40'
                }`}
              >
                {verdict.status === 'Accepted' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>{verdict.status}</span>
                <span className="font-mono text-[10px] text-text-muted">({verdict.runtimeMs}ms)</span>
              </div>
            )}
          </div>

          {/* Output Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
            {activeTab === 'tests' && (
              <div>
                {testResults.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-text-muted py-6">
                    <Terminal className="w-8 h-8 mb-2 opacity-30" />
                    <p>Click "Run Tests" or "Submit" to execute your solution against test cases.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testResults.map((tc) => (
                      <div
                        key={tc.testCaseId}
                        className={`p-3 rounded-xl border ${
                          tc.passed
                            ? 'bg-[#DDF8EE]/20 dark:bg-[#0D2E26]/20 border-[#19B99A]/40'
                            : 'bg-red-50 dark:bg-red-950/20 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {tc.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#19B99A]" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-semibold text-text-primary">
                              Test Case #{tc.testCaseId}: {tc.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          <span className="text-[10px] text-text-muted font-mono">{tc.runtimeMs} ms</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                          <div className="bg-card p-2 rounded-lg border border-border">
                            <span className="text-text-muted block mb-0.5">Input:</span>
                            <span className="text-text-primary whitespace-pre-wrap">{tc.input || '(empty)'}</span>
                          </div>
                          <div className="bg-card p-2 rounded-lg border border-border">
                            <span className="text-text-muted block mb-0.5">Expected:</span>
                            <span className="text-[#19B99A] font-semibold whitespace-pre-wrap">{tc.expectedOutput}</span>
                          </div>
                          <div className="bg-card p-2 rounded-lg border border-border">
                            <span className="text-text-muted block mb-0.5">Your Output:</span>
                            <span
                              className={`whitespace-pre-wrap ${
                                tc.passed ? 'text-[#19B99A] font-semibold' : 'text-red-500 font-semibold'
                              }`}
                            >
                              {tc.actualOutput || (tc.error ? `[Error]: ${tc.error}` : '(empty)')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'console' && (
              <div className="space-y-2">
                {consoleOutput.stderr && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-500/40 rounded-xl text-red-600 dark:text-red-400 whitespace-pre-wrap">
                    {consoleOutput.stderr}
                  </div>
                )}
                <div className="p-3 bg-canvas border border-border rounded-xl text-text-primary whitespace-pre-wrap min-h-[80px]">
                  {consoleOutput.stdout || 'No standard output recorded.'}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {submissionHistory.length === 0 ? (
                  <div className="text-center text-text-muted py-6">No previous submissions recorded yet.</div>
                ) : (
                  <div className="space-y-2">
                    {submissionHistory.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-canvas border border-border text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              sub.status === 'Accepted'
                                ? 'bg-[#DDF8EE] text-[#19B99A] dark:bg-[#0D2E26]'
                                : 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                            }`}
                          >
                            {sub.status}
                          </span>
                          <span className="text-text-primary font-medium">{sub.problemTitle}</span>
                          <span className="text-text-muted font-mono text-[11px]">{sub.language}</span>
                        </div>
                        <div className="flex items-center gap-4 text-text-muted text-[11px]">
                          <span>
                            {sub.passedCount} / {sub.totalCount} passed
                          </span>
                          <span>{sub.runtimeMs} ms</span>
                          <span className="text-text-muted/60">{sub.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodeChallengePage;
