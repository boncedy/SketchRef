/**
 * API client — every network call the app makes goes through here.
 * Keeping this as the single boundary means new features (e.g. tags,
 * search, multi-user sync) only require changes in one place.
 */
const BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // auth
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getMe: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),

  // categories
  getCategories: () => request("/categories"),
  addCategory: (name) =>
    request("/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),

  // images
  getImages: (category) => {
    const query = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
    return request(`/images${query}`);
  },
  uploadImage: (file, category) => {
    const form = new FormData();
    form.append("image", file);
    form.append("category", category);
    return request("/images", { method: "POST", body: form });
  },
  updateImage: (id, patch) =>
    request(`/images/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  setDone: (id, userId, done) =>
    request(`/images/${id}/done`, {
      method: "PATCH",
      body: JSON.stringify({ userId, done }),
    }),
  deleteImage: (id) => request(`/images/${id}`, { method: "DELETE" }),

  imageSrc: (id) => `${BASE}/images/${id}/file`,
  downloadUrl: (id, filename) =>
    `${BASE}/images/${id}/download?filename=${encodeURIComponent(filename)}`,
};
