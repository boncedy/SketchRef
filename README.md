# SketchRef

A personal gallery of drawing-practice reference pictures. Browse by
category, mark what you've drawn, and download any picture under whatever
filename you like.

## Quick start

You need [Node.js](https://nodejs.org) installed (18 or newer).

**1. Start the backend** (in one terminal):

```bash
cd backend
npm install
npm run dev
```

This runs the API at `http://localhost:4000` and creates `backend/data/`
and `backend/uploads/` on first run.

**2. Start the frontend** (in a second terminal):

```bash
cd frontend
npm install
npm run dev
```

This opens the app at `http://localhost:5173`.

Leave both terminals running while you use the app. Your pictures and
progress are saved to disk (`backend/data/db.json` and
`backend/uploads/`), so closing everything and reopening later keeps
everything as you left it.

## Using it

- **Add pictures**: pick a category from the dropdown next to "+ Add
  pictures" on the gallery page, then choose one or more image files.
- **Add a category**: click "+ category" in the nav bar and name it.
- **Mark done**: click the small circle in the top-left corner of a
  thumbnail. Click again to un-mark it.
- **Remove a picture**: hover a thumbnail and click the × in the top-right
  corner.
- **See it bigger**: just hover — no click needed.
- **Open full-size / download**: click the thumbnail. On that page you can
  toggle done, type any filename you want, and click Download.

## Running it 24/7 without VS Code

The two-terminal dev setup (`npm run dev` in `backend` and `frontend`) is
great for making changes, but it only runs while those terminals are open.
For everyday use, run it as a single background process instead:

**1. Build the frontend once** (re-run this only after you change frontend code):

```powershell
cd frontend
npm run build
```

This creates `frontend/dist`. The backend automatically serves it and
falls back to it for page refreshes, so you only need **one process**
(the backend) running — no more separate frontend dev server.

**2. Start it** — either double-click `start.bat` in the project root, or run:

```powershell
cd backend
npm run start
```

Then visit `http://localhost:4000` (note: port 4000, not 5173, since the
backend is now serving everything).

**3. Keep it running in the background, and restart it automatically.**
The simplest option is [pm2](https://pm2.keymetrics.io/), a small process
manager:

```powershell
npm install -g pm2
cd backend
pm2 start server.js --name sketchref
pm2 save
```

`pm2 start` runs it detached — you can close the terminal and it keeps
going. To make it also survive a PC restart:

```powershell
npm install -g pm2-windows-startup
pm2-startup install
pm2 save
```

Useful pm2 commands: `pm2 status`, `pm2 logs sketchref`, `pm2 restart sketchref`,
`pm2 stop sketchref`.

**Simpler alternative (no pm2):** just double-click `start.bat`, minimize
the window, and leave it running. It won't survive a PC restart or
auto-recover from a crash, but it needs no extra tools — fine if your PC
stays on and you're the only user.

**If you want it reachable from other devices on your home network** (not
just the PC it's running on), visit `http://<your-PC's-local-IP>:4000`
from another device's browser instead of `localhost` — find your PC's IP
with `ipconfig` (look for "IPv4 Address").

**If you want friends in other locations to use it**, see `SHARING.md` —
it covers making the site reachable over the internet (Cloudflare Tunnel)
and how per-person progress tracking works.

## Working on this codebase with an AI coding agent

This repo includes docs written specifically so tools like **Claude Code**
can pick up context quickly without you re-explaining the project:

- **`AGENTS.md`** — the file the agent reads first: project structure,
  ground rules, and where new features should go. If you're using Claude
  Code, just open this folder and ask for what you want ("add a search box
  to the gallery," "let me reorder pictures by drag and drop") — Claude
  Code automatically looks for and reads `AGENTS.md`.
- **`requirements.md`** — a plain description of what the app is supposed
  to do. Good context for an agent (or for you) before starting a feature.
- **`ARCHITECTURE.md`** — how it's built: the data model, the API, and why
  a few things are deliberately simple.

In practice: open this project folder in Claude Code (or paste these three
files into a chat) and describe the feature you want. The agent will
already know the routes, the file layout, and the visual style to match.

## Project layout

```
backend/     Express API + local JSON store + uploaded image files
frontend/    Vite + React app
AGENTS.md          for AI coding agents
requirements.md    what the app does
ARCHITECTURE.md    how it's built
SHARING.md         hosting it for remote friends
```
