// file: assets/js/utils/auth.js
const AUTH_KEY = "mb_auth";

export function getAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Cannot parse mb_auth:", e);
    return null;
  }
}

export function setAuth(data) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}
