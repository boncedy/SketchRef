/**
 * SketchRef backend
 * ------------------
 * A tiny local API for the drawing-practice gallery. No database — just a
 * JSON file (data/db.json) as the store and a folder (uploads/) for the
 * actual image files. Good enough for a single-user local tool, and easy
 * to swap out for a real DB later (see ARCHITECTURE.md).
 *
 * Endpoints:
 *   GET    /api/categories              -> list categories
 *   POST   /api/categories              -> add a category { name }
 *   DELETE /api/categories/:id          -> remove a category (images fall back to "uncategorized")
 *
 *   GET    /api/images                  -> list images, optional ?category=<id>
 *   POST   /api/images                  -> upload one image (multipart form field "image"), fields: category
 *   PATCH  /api/images/:id              -> update { category? }
 *   PATCH  /api/images/:id/done         -> toggle done for one user: { userId, done }
 *   DELETE /api/images/:id              -> remove image (file + record)
 *   GET    /api/images/:id/file         -> raw image bytes (for <img> src)
 *   GET    /api/images/:id/download     -> download with a custom filename via ?filename=my-name.png
 */

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// --- bootstrap storage -------------------------------------------------

for (const dir of [DATA_DIR, UPLOADS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    const seed = {
      categories: [
        { id: "black-white", name: "Black & White" },
        { id: "color", name: "Color" },
        { id: "portraits", name: "Portraits" },
      ],
      images: [],
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
  const loaded = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));

  // Migrate old single-user `checked: boolean` records to the multi-user
  // `doneBy: string[]` shape (a list of user ids who've marked it done).
  let migrated = false;
  loaded.images.forEach((img) => {
    if (!Array.isArray(img.doneBy)) {
      img.doneBy = img.checked ? ["legacy-user"] : [];
      delete img.checked;
      migrated = true;
    }
  });
  if (migrated) saveDb(loaded);

  return loaded;
}

function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

let db = loadDb();

// --- app -----------------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

// Serve the built frontend (frontend/dist) if it exists, so a single
// `node server.js` process can run the whole app — no separate frontend
// dev server needed. Build it with `cd frontend && npm run build`.
const FRONTEND_DIST = path.join(__dirname, "..", "frontend", "dist");
const hasFrontendBuild = fs.existsSync(FRONTEND_DIST);
if (hasFrontendBuild) {
  app.use(express.static(FRONTEND_DIST));
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage });

// --- categories ------------------------------------------------------

app.get("/api/categories", (_req, res) => {
  res.json(db.categories);
});

app.post("/api/categories", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Category name is required." });
  }
  const id = name.trim().toLowerCase().replace(/\s+/g, "-");
  if (db.categories.some((c) => c.id === id)) {
    return res.status(409).json({ error: "That category already exists." });
  }
  const category = { id, name: name.trim() };
  db.categories.push(category);
  saveDb(db);
  res.status(201).json(category);
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  db.categories = db.categories.filter((c) => c.id !== id);
  db.images.forEach((img) => {
    if (img.category === id) img.category = "uncategorized";
  });
  saveDb(db);
  res.status(204).end();
});

// --- images ------------------------------------------------------------

app.get("/api/images", (req, res) => {
  const { category } = req.query;
  const images = category
    ? db.images.filter((img) => img.category === category)
    : db.images;
  res.json(images);
});

app.post("/api/images", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file was uploaded." });
  }
  const record = {
    id: uuidv4(),
    storedName: req.file.filename,
    originalName: req.file.originalname,
    category: req.body.category || "uncategorized",
    doneBy: [],
    uploadedAt: new Date().toISOString(),
  };
  db.images.push(record);
  saveDb(db);
  res.status(201).json(record);
});

app.patch("/api/images/:id", (req, res) => {
  const img = db.images.find((i) => i.id === req.params.id);
  if (!img) return res.status(404).json({ error: "Image not found." });

  if (typeof req.body.category === "string") img.category = req.body.category;

  saveDb(db);
  res.json(img);
});

// Per-user "done" toggle. Everyone shares the same picture library, but
// each person's own progress is tracked separately via their userId
// (a random id generated client-side and stored in their browser — see
// frontend/src/user.js — not a real account).
app.patch("/api/images/:id/done", (req, res) => {
  const img = db.images.find((i) => i.id === req.params.id);
  if (!img) return res.status(404).json({ error: "Image not found." });

  const { userId, done } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required." });

  const without = img.doneBy.filter((u) => u !== userId);
  img.doneBy = done ? [...without, userId] : without;

  saveDb(db);
  res.json(img);
});

app.delete("/api/images/:id", (req, res) => {
  const img = db.images.find((i) => i.id === req.params.id);
  if (!img) return res.status(404).json({ error: "Image not found." });

  const filePath = path.join(UPLOADS_DIR, img.storedName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.images = db.images.filter((i) => i.id !== req.params.id);
  saveDb(db);
  res.status(204).end();
});

app.get("/api/images/:id/file", (req, res) => {
  const img = db.images.find((i) => i.id === req.params.id);
  if (!img) return res.status(404).end();
  res.sendFile(path.join(UPLOADS_DIR, img.storedName));
});

app.get("/api/images/:id/download", (req, res) => {
  const img = db.images.find((i) => i.id === req.params.id);
  if (!img) return res.status(404).end();

  const ext = path.extname(img.storedName);
  const requested = (req.query.filename || img.originalName || "drawing-reference").toString();
  const safeBase = requested.replace(/[^a-z0-9-_ ]/gi, "").trim() || "drawing-reference";
  const finalName = safeBase.toLowerCase().endsWith(ext.toLowerCase()) ? safeBase : `${safeBase}${ext}`;

  res.download(path.join(UPLOADS_DIR, img.storedName), finalName);
});

// Anything that isn't an /api/* route falls through to the frontend, so
// client-side routes like /image/:id work on a full page refresh too.
if (hasFrontendBuild) {
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`SketchRef backend running at http://localhost:${PORT}`);
});
