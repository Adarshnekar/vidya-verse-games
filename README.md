# VidyaVerse Explore & Labs 2.0

> A production-grade educational platform for Indian school students in Classes 5–12, featuring real game physics, circuit simulation, and live code execution.

## 🌟 What's Inside

| Module | Description |
|---|---|
| 🎮 **PlayLab** | Math Ludo (with quiz timer + bots), MazeBot (backtracking visualizer), Newton's Carrom (Matter.js physics), Bharat Explorer (India map missions) |
| ⚡ **CircuitVerse** | Interactive circuit workspace + CircuitJS1 simulator + 10 guided labs |
| 💻 **CodeVerse** | Monaco IDE + Learn mode (5 lessons) + Challenge mode (10 problems) + Piston code execution |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (tested on Node 25.7)
- **npm 9+**
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd vidyaverse_games

# 2. Install web app dependencies
cd apps/web
npm install

# 3. Install API server dependencies
cd ../api
npm install

# 4. Set up environment
cp ../../.env.example ../../.env
# Edit .env with your settings if needed
```

### Running

**Terminal 1 — Frontend (http://localhost:5173)**
```bash
cd apps/web
npm run dev
```

**Terminal 2 — API Server (http://localhost:3001)**
```bash
cd apps/api
npm run dev
```

The app works in **guest mode** even without the API server running. The API is required for:
- User accounts (registration/login)
- Online multiplayer (Math Ludo, Carrom)
- Server-side progress sync

---

## 🏗️ Project Structure

```
vidyaverse_games/
  apps/
    web/              ← Vite + React 18 + TypeScript frontend
    api/              ← Express + Socket.IO backend
  content/
    math-questions/   ← 30+ grade-adapted math questions (JSON)
    maze-levels/      ← Pre-built maze configurations
    bharat-missions/  ← 5 geography missions + all 28 states data
    circuit-labs/     ← 5 guided circuit experiments
    coding-problems/  ← Coding challenge data
    lessons/          ← CodeVerse curriculum
  database/
    vidyaverse.json   ← Development database (lowdb)
  docs/
    ARCHITECTURE.md
    CAPABILITY_MATRIX.md
  .env.example
  docker-compose.yml
```

---

## 🎮 PlayLab Games

### Math Ludo
- Complete 15×15 SVG Ludo board with 4 colors
- 32 NCERT math questions (Classes 5–12)
- 10-second quiz timer with animated ring
- Bot AI (Easy/Medium/Hard difficulty)
- Online multiplayer via Socket.IO rooms
- Offline: full bot play, no server needed

### MazeBot
- Recursive maze generation
- **Real** Rat-in-a-Maze DFS backtracking algorithm (step-by-step)
- Color-coded states: visiting (yellow), backtrack (red), path (green)
- Manual play mode (arrow keys)
- Speed control slider

### Newton's Carrom
- Matter.js 2D rigid-body physics simulation
- 9 black + 9 white coins + 1 red queen
- Corner pocket detection
- Physics Lab mode: adjust restitution, friction, power
- Bot AI with angle/power calculation

### Bharat Explorer
- Interactive SVG map of India
- 5 missions: Himalayas, Thar Desert, Western Ghats, Rivers, Capitals
- Trivia questions with educational explanations
- Achievement badges + XP rewards
- All 28 states data

---

## ⚡ CircuitVerse

- **CircuitJS1** embedded via iframe (MIT-compatible approach)
- Custom interactive SVG schematic workspace
- Component palette: Sources, Passive, Active, Logic, Measurement
- **10 guided lab experiments** including:
  - Ohm's Law, LED circuits, Series/Parallel, Voltage Divider
  - RC Charging, NPN Transistor, 555 Timer, Wheatstone Bridge
- Project save/load via localStorage
- Ohm's Law calculator

---

## 💻 CodeVerse

### Languages Supported
| Language | Execution | Status |
|---|---|---|
| Python | Piston API | ✅ Live |
| JavaScript | Piston API + local fallback | ✅ Live |
| C++ | Piston API | ✅ Live |
| C | Piston API | ✅ Live |
| Java | Piston API | ✅ Live |
| HTML/CSS/JS | Sandboxed iframe | ✅ Live |
| SQL | Planned (sql.js) | ⚠️ Partial |

### Code Execution Setup
The app uses the **[Piston API](https://github.com/engineer-man/piston)** (free public instance at `https://emkc.org/api/v2/piston`). 

For production, set up your own Piston instance:
```bash
# With Docker (production)
docker run -d -p 2000:2000 ghcr.io/engineer-man/piston
```

Set in `.env`:
```
PISTON_API_URL=http://localhost:2000/api/v2
```

---

## 🌐 Environment Variables

```env
# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change-this-in-production

# Database (dev uses JSON file)
DATABASE_URL=./database/vidyaverse.json

# Code execution
PISTON_API_URL=https://emkc.org/api/v2/piston
PISTON_API_KEY=          # optional for public instance

NODE_ENV=development
```

---

## 🔌 Integration Guide (for existing VidyaVerse)

To replace the existing PlayLab, CircuitVerse, and CodeVerse routes in an existing VidyaVerse app:

### Option A — Iframe embed
```html
<!-- In your existing VidyaVerse app -->
<iframe src="http://localhost:5173/playlab" style="width:100%;height:100vh;border:none" />
```

### Option B — Route replacement
In your existing VidyaVerse router, replace:
```js
// Old routes
{ path: '/playlab', component: OldPlayLab }
{ path: '/circuitverse', component: OldCircuit }
{ path: '/codeverse', component: OldCode }

// Replace with redirect to standalone app:
{ path: '/playlab', redirect: 'http://localhost:5173/playlab' }
```

### Option C — Build integration
1. Run `npm run build` in `apps/web`
2. Copy `apps/web/dist/` to your existing app's static hosting path
3. Configure the existing router to serve `/playlab`, `/circuitverse`, `/codeverse` from the built files
4. **Do NOT change routes for `/projects` or any unrelated sections**

---

## 🧪 Testing

```bash
# Type check
cd apps/web
npx tsc --noEmit

# Production build (validates compilation)
npm run build

# API health check
curl http://localhost:3001/api/health
```

---

## 🔒 Security Notes

- Student code runs via the **Piston API** in a sandboxed container — not in the Node.js process
- HTML/CSS/JS live previews use sandboxed iframes with `sandbox` attribute
- JWT tokens expire after 30 days (accounts) or 24 hours (guests)
- No student code or submission data is exposed to other students
- The API rate-limits requests via Express

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 6 |
| Styling | Tailwind CSS v3, Framer Motion |
| State | Zustand (persist) |
| Offline storage | Dexie.js (IndexedDB) |
| Game physics | Matter.js |
| Code editor | Monaco Editor |
| Routing | React Router v7 |
| Icons | Lucide React |
| Backend | Express 4, Socket.IO 4 |
| Database (dev) | lowdb (JSON file) |
| Database (prod) | PostgreSQL (via migration) |
| Code execution | Piston API |
| Circuit sim | CircuitJS1 (iframe) |

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

CircuitJS1 is GPL-2.0 and is embedded as a separate iframe service (not compiled into this app).
