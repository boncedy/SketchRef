# Requirements

A living description of what SketchRef does. Update this file whenever
behavior changes — it's the spec an AI agent (or a future you) should trust
over guessing from the code.

## Purpose

Help one person practice drawing by keeping a personal, browsable list of
reference pictures, tracking which ones they've already drawn.

## Core features (v1)

1. **Browse pictures as a grid**, styled like a product listing in a
   shopping app: one thumbnail per picture, evenly spaced.
2. **Filter by category** via a navigation bar (e.g. Black & White, Color,
   Portraits). Categories are user-defined, not hardcoded — "All" is always
   available.
3. **Add a category** from the nav bar at any time.
4. **Mark a picture as done / not done** with a single click on its
   thumbnail, without leaving the grid. Done pictures are visually distinct
   (a red pencil-style checkmark). **Done state is tracked per person** —
   everyone who uses the app shares the same picture library, but each
   person's own "done" list is separate (see "Multi-person use" below).
5. **Remove a picture** from the list directly from the grid (with a
   confirmation), which deletes both its metadata and the stored file.
6. **Hover a thumbnail** to see an enlarged preview of it in place — big
   enough to see detail, not fullscreen — without navigating away.
7. **Click a picture** to open a dedicated full-picture page showing it
   at full size.
8. On the full-picture page:
   - Toggle done / not done.
   - **Download the picture under a custom filename** the user types in
     (defaults to the original filename).
   - Remove it from the list.
   - Return to the grid.
9. **Add new pictures** to a chosen category (multiple at once) from the
   grid page.
10. Picture count and "done" count are visible at a glance above the grid.

## Multi-person use

- The app can be shared with other people (e.g. over a Cloudflare Tunnel —
  see `SHARING.md`). Everyone who opens it shares the same picture library
  and categories.
- The first time someone opens the app in a browser, they're asked for a
  display name. This isn't a real account/password — it's a random id
  stored in that browser (`localStorage`) paired with the name they typed.
  It only exists to keep "done" tracking separate per person.
- Anyone can add pictures, add categories, or remove pictures — there's no
  per-person permission system in v1. See `AGENTS.md` if that needs to
  change later.

## Non-functional requirements

- **Runs entirely locally** — no account, no cloud service required to use it.
- **Data persists** across restarts (JSON file + files on disk), so closing
  the browser or restarting the server doesn't lose progress.
- **Extensible**: the codebase should make it straightforward to add tags,
  search, reordering, or a hosted backend later without a rewrite (see
  `AGENTS.md` → "Likely next features").
- Single user. No login, no multi-device sync in v1.

## Explicitly out of scope for v1

- User accounts / authentication
- Cloud image storage
- Mobile app (this is a responsive web page, not a native app)
- Drawing/annotation tools (this app is for choosing references, not for
  drawing itself)
