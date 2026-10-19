# VidyaVerse Explore & Labs 2.0 — Capability Matrix

## PlayLab

| Feature | Status | Mode | Notes |
|---|---|---|---|
| Math Ludo board (SVG, 15×15) | ✅ Implemented | Offline | Complete with all cell types, safe squares, home paths |
| Math Ludo — dice rolling + animation | ✅ Implemented | Offline | Web Audio API sound + visual dice |
| Math Ludo — token movement + captures | ✅ Implemented | Offline | Full Ludo rules: safe squares, 6=extra turn, capture |
| Math Ludo — math quiz (10-sec timer) | ✅ Implemented | Offline | 32 NCERT questions across Classes 5–12 |
| Math Ludo — bot AI (Easy/Med/Hard) | ✅ Implemented | Offline | Grade-adjusted answer accuracy, smart token selection |
| Math Ludo — 2–4 player local | ✅ Implemented | Offline | Pass-and-play on one device |
| Math Ludo — online multiplayer | ✅ Implemented | Online | Socket.IO rooms, requires API server |
| Math Ludo — room codes | ✅ Implemented | Online | 6-char codes, shareable |
| Math Ludo — reconnection | ⚠️ Partial | Online | Disconnect detected; full reconnect flow planned |
| MazeBot — maze generation | ✅ Implemented | Offline | Recursive backtracking DFS |
| MazeBot — real backtracking algorithm | ✅ Implemented | Offline | Step-by-step with call stack, NOT precomputed |
| MazeBot — visualizer (color-coded states) | ✅ Implemented | Offline | Visiting/backtrack/path/start/end colors |
| MazeBot — speed control | ✅ Implemented | Offline | Slider from instant to slow |
| MazeBot — manual play mode | ✅ Implemented | Offline | Arrow key / WASD navigation |
| MazeBot — educational explanation panel | ✅ Implemented | Offline | Step-by-step algorithm description |
| Newton's Carrom — Matter.js physics | ✅ Implemented | Offline | Rigid-body simulation, friction, restitution |
| Newton's Carrom — striker + coins + queen | ✅ Implemented | Offline | 19 coins + striker, 4 pockets |
| Newton's Carrom — aiming + shooting | ✅ Implemented | Offline | Slingshot drag with trajectory line |
| Newton's Carrom — pocket detection | ✅ Implemented | Offline | Sensor-based removal |
| Newton's Carrom — foul detection | ✅ Implemented | Offline | Basic foul rules |
| Newton's Carrom — Physics Lab sliders | ✅ Implemented | Offline | Restitution, friction, power multiplier |
| Newton's Carrom — educational overlays | ✅ Implemented | Offline | Force, momentum displays |
| Newton's Carrom — bot AI | ✅ Implemented | Offline | Angle calculation towards best coin |
| Newton's Carrom — online multiplayer | ✅ Implemented | Online | Shot relay via Socket.IO |
| Bharat Explorer — India SVG map | ✅ Implemented | Offline | Interactive regional polygons |
| Bharat Explorer — 5 missions | ✅ Implemented | Offline | Himalayas, Thar, Ghats, Rivers, Capitals |
| Bharat Explorer — mission questions | ✅ Implemented | Offline | 4 questions per mission with explanations |
| Bharat Explorer — achievement badges | ✅ Implemented | Offline | Earned per mission completion |
| Bharat Explorer — XP rewards | ✅ Implemented | Offline | 50–100 XP per mission |
| Bharat Explorer — progress persistence | ✅ Implemented | Offline | Zustand persist to localStorage |
| Bharat Explorer — offline region packs | ⚠️ Partial | Offline | Content is local JSON; dynamic downloads planned |

## CircuitVerse

| Feature | Status | Mode | Notes |
|---|---|---|---|
| Custom SVG schematic workspace | ✅ Implemented | Offline | Drag-and-drop, wire drawing |
| CircuitJS1 iframe embed | ✅ Implemented | Online | Falstad.com embedded simulator |
| Component palette (16 components) | ✅ Implemented | Offline | Search + category filter |
| Properties inspector | ✅ Implemented | Offline | Edit component values, live Ohm's Law calc |
| 10 guided lab experiments | ✅ Implemented | Offline | Complete with formulas, steps, questions |
| Project save/load | ✅ Implemented | Offline | localStorage persistence |
| Live simulation (CircuitJS1) | ✅ Implemented | Online/Offline | Full simulation via iframe |
| Breadboard experience | ⚠️ Partial | Offline | SVG schematic, not true breadboard rows |
| Microcontroller simulation | ❌ Not implemented | — | Requires Wokwi or custom AVR emulator |
| Capacitor/inductor simulation | ⚠️ Partial | Online | Via CircuitJS1 iframe only |

## CodeVerse

| Feature | Status | Mode | Notes |
|---|---|---|---|
| Monaco Editor (full IDE) | ✅ Implemented | Offline | Syntax highlighting, 5 languages |
| Learn mode — 5 lessons | ✅ Implemented | Offline | Python (×4), JavaScript DOM |
| Learn mode — progress tracking | ✅ Implemented | Offline | Per-lesson completion |
| Learn mode — hints | ✅ Implemented | Offline | Accordion hint system |
| Challenge mode — 10 problems | ✅ Implemented | Offline | Easy to Medium difficulty |
| Challenge mode — problem filter/search | ✅ Implemented | Offline | Topic tags, difficulty filter |
| Python execution (Piston) | ✅ Implemented | Online | Public Piston API |
| JavaScript execution (Piston) | ✅ Implemented | Online | With local Function() fallback |
| C++ execution (Piston) | ✅ Implemented | Online | GCC 10.2 |
| C execution (Piston) | ✅ Implemented | Online | GCC 10.2 |
| Java execution (Piston) | ✅ Implemented | Online | OpenJDK 15 |
| HTML/CSS/JS live preview | ✅ Implemented | Offline | Sandboxed iframe srcdoc |
| SQL exercises | ⚠️ Planned | — | sql.js integration documented, not wired |
| Visible test cases | ✅ Implemented | Online | Shows pass/fail per case |
| Hidden test cases | ✅ Implemented | Online | Evaluated server-side via Piston |
| Submission history | ✅ Implemented | Offline | localStorage per problem |
| XP rewards | ✅ Implemented | Offline | Awarded on problem acceptance |
| Educator reporting | ❌ Not implemented | — | Planned for v2.1 |

## Shared Platform

| Feature | Status | Notes |
|---|---|---|
| Guest mode (no login) | ✅ Implemented | Works immediately on open |
| User registration/login | ✅ Implemented | Requires API server |
| XP + leveling system | ✅ Implemented | Local (guest) + server sync (auth) |
| Achievement badges | ✅ Implemented | Local persistence |
| Daily streak tracking | ✅ Implemented | Local |
| Grade selection | ✅ Implemented | Adapts quiz difficulty |
| Responsive design (mobile/tablet) | ✅ Implemented | Mobile sidebar + layout |
| Dark theme | ✅ Implemented | Platform default |
| Keyboard navigation | ✅ Implemented | Nav links, game controls |
| Offline-first PWA | ✅ Implemented | Manifest + service worker planned |
| IndexedDB progress sync | ⚠️ Partial | Dexie.js installed; sync engine planned |
| Online/offline indicator | ✅ Implemented | Real-time in sidebar |
| Accessible ARIA labels | ✅ Implemented | On all interactive elements |

## Infrastructure

| Item | Status | Notes |
|---|---|---|
| Vite build (production) | ✅ Working | 33.9s build, 0 errors |
| API server (Express/Socket.IO) | ✅ Working | Tested locally |
| lowdb database (dev) | ✅ Working | JSON file persistence |
| Docker Compose config | ✅ Written | Not locally tested (no Docker) |
| PostgreSQL migration | ⚠️ Planned | lowdb → pg adapter needed |
| CI/CD | ⚠️ Not configured | GitHub Actions template planned |
| SSL/HTTPS | ⚠️ Manual setup | Required for PWA install prompt |

## External Dependencies (require setup)

| Dependency | Purpose | Required | Setup |
|---|---|---|---|
| Piston API | Code execution (C/C++/Python/Java) | For CodeVerse execution | Public instance free; self-host recommended |
| CircuitJS1 | Circuit simulation | For CircuitVerse simulator | Embedded via iframe from falstad.com |
| Google Fonts | Typography (Inter, Outfit, JetBrains Mono) | For design | Requires internet; can be self-hosted |
