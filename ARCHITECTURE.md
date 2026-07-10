# Architecture

## Stack

- **Backend**: Node.js + Express. No database — a single JSON file
  (`backend/data/db.json`) holds all metadata; uploaded image files live in
  `backend/uploads/`, named by UUID to avoid collisions.
- **Frontend**: React 18 + Vite, client-side routing via `react-router-dom`.
  Plain CSS (`src/index.css`) with a small design-token system at the top —
  no CSS framework.

**In development**, two processes, two ports, talking over HTTP:

```
frontend (Vite, :5173) --/api/*--> backend (Express, :4000)
```

Vite proxies `/api/*` to `http://localhost:4000` (see
`frontend/vite.config.js`), so the frontend code always just calls
same-origin `/api/...` paths.

**For everyday/"production" use**, only one process runs: after
`cd frontend && npm run build`, the backend serves the built static files
directly from `frontend/dist` (see the `express.static` + catch-all route
in `server.js`), and everything — API and UI — is available from
`http://localhost:4000`. See README → "Running it 24/7 without VS Code."

## Data model

`backend/data/db.json`:

```json
{
  "categories": [{ "id": "black-white", "name": "Black & White" }],
  "images": [
    {
      "id": "uuid",
      "storedName": "uuid.png",
      "originalName": "cat-reference.png",
      "category": "black-white",
      "doneBy": ["a1b2c3"],
      "uploadedAt": "2026-07-11T12:00:00.000Z"
    }
  ]
}
```

- `id` is what the frontend and API use to address an image.
- `storedName` is the file's actual name on disk (in `uploads/`) — kept
  separate from `originalName` so re-uploads never collide.
- `category` references a category `id`. If a category is deleted, its
  images fall back to `"uncategorized"` rather than being deleted.
- `doneBy` is a list of user ids (see "Identity" below) who've marked this
  picture as done. There's no per-user record elsewhere — a user "exists"
  simply by having their id appear in one or more `doneBy` lists.

## Identity (not a real auth system)

`frontend/src/user.js` generates a random id the first time someone opens
the app in a browser, stores it (plus a chosen display name) in
`localStorage`, and that id is sent as `userId` whenever they toggle a
picture done/not-done (`PATCH /api/images/:id/done`). There's no password
and no server-side user table — the id only ever appears inside `doneBy`
arrays. This is intentionally minimal; if real accounts are ever needed
(e.g. to restrict who can upload/delete), replace `user.js`'s identity
resolution with a real login and keep the rest of the app the same, since
every component reads the current user via `useUser()` from
`UserContext.js`, not from `user.js` directly.

## API contract

| Method | Path                          | Purpose                                   |
|--------|-------------------------------|--------------------------------------------|
| GET    | `/api/categories`             | List categories                            |
| POST   | `/api/categories`              | Create a category `{ name }`               |
| DELETE | `/api/categories/:id`         | Delete a category                          |
| GET    | `/api/images?category=<id>`   | List images, optionally filtered            |
| POST   | `/api/images`                 | Upload an image (multipart: `image`, `category`) |
| PATCH  | `/api/images/:id`              | Update `{ category? }`                      |
| PATCH  | `/api/images/:id/done`         | Toggle done for one user: `{ userId, done }`|
| DELETE | `/api/images/:id`              | Delete an image (file + record)             |
| GET    | `/api/images/:id/file`         | Raw image bytes (used as `<img src>`)       |
| GET    | `/api/images/:id/download?filename=x` | Download with a chosen filename      |

All request/response bodies are JSON except the upload endpoint (multipart)
and the two `/file` and `/download` endpoints (raw bytes).

## Frontend structure

- `src/api.js` — the only module that calls the backend. Every component
  goes through this; nothing else calls `fetch` directly.
- `src/pages/Gallery.jsx` — the main screen: nav bar, toolbar (counts +
  upload), and the picture grid. Owns the `images` and `categories` state
  and passes callbacks down.
- `src/pages/ImageDetail.jsx` — the full-picture screen: fetches the single
  image by id, toggles done/not-done, renders the filename input and
  download link, and handles removal.
- `src/components/Navbar.jsx` — category tabs + "add category."
- `src/components/ImageCard.jsx` — one grid thumbnail: hover-to-enlarge
  preview, done-toggle button, remove button, click-through to detail.
- `src/components/UploadPanel.jsx` — category picker + file input for
  adding new pictures.

State lives in the page components (no global state library) and flows
down as props; this is intentionally simple and should stay that way until
the app has enough shared state across distant components to justify
something like Context or a store.

## Why no database / auth / build pipeline beyond Vite

This is a single-user local tool. A JSON file is trivial to inspect, back
up, or hand-edit, and avoids the operational overhead of a real database
for what is, at this scale, a few hundred rows at most. See `AGENTS.md` →
"Likely next features" for the recommended path if requirements grow past
this (multi-user, cloud storage, etc.).
