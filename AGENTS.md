# AGENTS.md

This file is read by AI coding agents (Claude Code, Cursor, Windsurf, etc.)
before they touch this repo. It tells the agent what this project is, how
it's organized, and the rules to follow when adding features. Humans can
read it too — think of it as the project's operating manual.

If you're a human: see `README.md` to run the app, `requirements.md` for
what it's supposed to do, and `ARCHITECTURE.md` for how it's built.

## What this project is

SketchRef: a personal gallery of drawing-reference pictures. The user
browses pictures by category, marks ones they've drawn as "done," removes
ones they don't want, and can open a picture full-size to download it
under a name of their choosing.

## Repo layout

```
backend/            Node + Express API, local JSON "database", uploaded files
  server.js          All routes live here (it's intentionally one file — split
                      it into backend/routes/*.js once it exceeds ~5 resources)
  data/db.json        Auto-created on first run. Do not hand-edit while the
                      server is running — it overwrites this file on every write.
  uploads/            Auto-created. Raw image files, named by UUID.

frontend/            Vite + React app
  src/api.js          The ONLY file that calls the backend. Add new endpoints
                      here first, then consume them from components.
  src/components/     Small, reusable, presentational-ish pieces
  src/pages/          Route-level components (Gallery, ImageDetail)
  src/index.css       All styling. Design tokens live at the top as CSS vars.
```

## Ground rules for agents

1. **Respect the API boundary.** Frontend components should never call
   `fetch` directly — always go through `src/api.js`. This keeps the app
   swappable (e.g. to a hosted backend) without touching every component.
2. **Keep the backend dependency-light.** It intentionally has no database,
   no auth, no build step. If a feature seems to need a real database, that's
   fine — see "Likely next features" below for the recommended migration
   path, but don't add one speculatively.
3. **One JSON file is the source of truth** (`backend/data/db.json`). Any
   new field on an image or category should be added to the seed shape in
   `loadDb()` in `server.js` and treated as optional/backfilled for existing
   records (don't assume old records have the new field).
4. **Don't break existing routes.** Other tools/scripts may depend on the
   current `/api/*` shapes. Add new routes or optional fields rather than
   changing existing response shapes. If a breaking change is unavoidable,
   say so explicitly and update this file plus `ARCHITECTURE.md`.
5. **Match the existing visual language** when touching UI: dark charcoal
   canvas, cream paper cards, the pencil-red "done" check, CSS variables in
   `index.css` for any new colors (don't hardcode hex values in components).
6. **No new frontend frameworks/state libraries** (no Redux, no Next.js
   migration, no Tailwind swap) without being asked — this is a small app on
   purpose.
7. **Update `requirements.md`** when you ship a feature that wasn't already
   listed there, so it stays an accurate description of what the app does.

## Commands

```bash
# backend
cd backend && npm install && npm run dev      # http://localhost:4000

# frontend (separate terminal)
cd frontend && npm install && npm run dev     # http://localhost:5173
```

There are no automated tests yet. If you add a non-trivial feature, prefer
adding a lightweight test (e.g. a `node --test` file for backend routes)
over adding none — but don't introduce a new test framework without asking.

## Likely next features (and where they'd go)

- **Tags in addition to categories** → extend the image record in
  `server.js`, add a filter param to `GET /api/images`, surface a tag input
  in `ImageDetail.jsx`.
- **Drag-and-drop reordering** → add a `sortOrder` field to image records;
  sort by it in `GET /api/images`.
- **Multi-file drag-and-drop onto the grid** (not just the upload button) →
  add drop handlers in `Gallery.jsx`, reuse `api.uploadImage`.
- **Cloud storage instead of local disk** → swap the `multer.diskStorage`
  in `server.js` for an S3-backed storage engine; `src/api.js` and every
  component stay untouched since they only know about `/api/images/:id/file`.
- **Per-picture permissions** (e.g. only the uploader can delete a
  picture) → currently anyone can delete anything; would need a real
  identity check server-side instead of trusting the `userId` the client
  sends, since right now it's just a self-reported localStorage value.
- **Multi-user / accounts** → this is the point where you'd want a real
  database (SQLite is the natural first step from a JSON file) and an auth
  layer in front of the Express routes, replacing the current
  localStorage-id-only identity in `frontend/src/user.js`.

## Style notes

- Backend: CommonJS, no TypeScript, no ORM. Comments explain *why*, not *what*.
- Frontend: function components + hooks only, no class components.
- Keep components small; a page component (`src/pages/*`) orchestrates data
  and composes smaller components rather than doing everything itself.
