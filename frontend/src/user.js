/**
 * Lightweight per-browser "identity" — not a real account system. Each
 * browser gets a random id (stored in localStorage) the first time
 * someone opens the app, plus a display name they choose. The id is what
 * the backend uses to track each person's own "done" progress separately
 * while everyone shares the same picture library.
 *
 * If you outgrow this (e.g. want the same identity across devices, or
 * real login), replace this file with a real auth flow — nothing else in
 * the app needs to change beyond how getUser() resolves.
 */
const ID_KEY = "sketchref_user_id";
const NAME_KEY = "sketchref_user_name";

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getUser() {
  const id = localStorage.getItem(ID_KEY);
  const name = localStorage.getItem(NAME_KEY);
  if (!id || !name) return null;
  return { id, name };
}

export function setUserName(name) {
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = randomId();
    localStorage.setItem(ID_KEY, id);
  }
  localStorage.setItem(NAME_KEY, name);
  return { id, name };
}

export function clearUser() {
  localStorage.removeItem(ID_KEY);
  localStorage.removeItem(NAME_KEY);
}
