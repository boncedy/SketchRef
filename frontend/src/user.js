/**
 * Lightweight browser session helpers for SketchRef's login system.
 * The backend stores an auth token and the user's profile; the browser
 * keeps the active session so requests can continue after a refresh.
 */
const ID_KEY = "sketchref_user_id";
const NAME_KEY = "sketchref_user_name";
const USER_KEY = "sketchref_user";
const TOKEN_KEY = "sketchref_auth_token";

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(user, token) {
  if (!user) return null;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ID_KEY, user.id);
  localStorage.setItem(NAME_KEY, user.name || "");
  if (token) localStorage.setItem(TOKEN_KEY, token);
  return user;
}

export function setUserName(name) {
  const existing = getUser();
  const user = existing ? { ...existing, name } : { id: randomId(), name };
  return setSession(user, getToken());
}

export function clearUser() {
  localStorage.removeItem(ID_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
