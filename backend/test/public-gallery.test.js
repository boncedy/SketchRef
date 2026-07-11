const test = require("node:test");
const assert = require("assert");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const BACKEND_DIR = path.join(__dirname, "..");
const DB_PATH = path.join(BACKEND_DIR, "data", "db.json");
const PORT = 4103;

async function waitForServer(url, timeoutMs = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // server still booting
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Server did not become ready in time");
}

test("public gallery routes work without auth", async () => {
  const backup = fs.readFileSync(DB_PATH, "utf8");
  const child = spawn(process.execPath, ["server.js"], {
    cwd: BACKEND_DIR,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer(`http://127.0.0.1:${PORT}/api/categories`);

    const categoriesRes = await fetch(`http://127.0.0.1:${PORT}/api/categories`);
    assert.equal(categoriesRes.status, 200);

    const form = new FormData();
    form.append("image", new Blob(["not-a-real-image"], { type: "image/png" }), "test.png");
    form.append("category", "uncategorized");

    const uploadRes = await fetch(`http://127.0.0.1:${PORT}/api/images`, {
      method: "POST",
      body: form,
    });
    const uploadBody = await uploadRes.json();
    assert.equal(uploadRes.status, 201);
    assert.ok(uploadBody.id);
    assert.equal(uploadBody.category, "uncategorized");
  } finally {
    child.kill("SIGTERM");
    fs.writeFileSync(DB_PATH, backup);
  }
});
