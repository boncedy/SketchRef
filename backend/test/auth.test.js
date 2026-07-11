const test = require("node:test");
const assert = require("assert");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const BACKEND_DIR = path.join(__dirname, "..");
const DB_PATH = path.join(BACKEND_DIR, "data", "db.json");
const PORT = 4101;

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

test("register and login create a valid session", async () => {
  const backup = fs.readFileSync(DB_PATH, "utf8");
  const child = spawn(process.execPath, ["server.js"], {
    cwd: BACKEND_DIR,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer(`http://127.0.0.1:${PORT}/api/categories`);

    const registerRes = await fetch(`http://127.0.0.1:${PORT}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ada",
        email: "ada@example.com",
        password: "secret123",
      }),
    });
    const registerBody = await registerRes.json();
    assert.equal(registerRes.status, 201);
    assert.equal(registerBody.user.name, "Ada");
    assert.ok(registerBody.token);

    const loginRes = await fetch(`http://127.0.0.1:${PORT}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ada@example.com", password: "secret123" }),
    });
    const loginBody = await loginRes.json();
    assert.equal(loginRes.status, 200);
    assert.equal(loginBody.user.email, "ada@example.com");
    assert.ok(loginBody.token);
  } finally {
    child.kill("SIGTERM");
    fs.writeFileSync(DB_PATH, backup);
  }
});

test("image files are served without auth", async () => {
  const backup = fs.readFileSync(DB_PATH, "utf8");
  const imageId = "test-image-id";
  const storedName = "test-image.png";
  const uploadPath = path.join(BACKEND_DIR, "uploads", storedName);
  const db = JSON.parse(backup);
  db.images.push({
    id: imageId,
    storedName,
    originalName: "test-image.png",
    category: "uncategorized",
    doneBy: [],
    uploadedAt: new Date().toISOString(),
  });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  fs.writeFileSync(uploadPath, Buffer.from("fake-image-bytes"));

  const child = spawn(process.execPath, ["server.js"], {
    cwd: BACKEND_DIR,
    env: { ...process.env, PORT: "4102" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer("http://127.0.0.1:4102/api/categories");
    const res = await fetch(`http://127.0.0.1:4102/api/images/${imageId}/file`);
    assert.equal(res.status, 200);
    const body = Buffer.from(await res.arrayBuffer());
    assert.ok(body.length > 0);
  } finally {
    child.kill("SIGTERM");
    fs.writeFileSync(DB_PATH, backup);
    if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
  }
});
