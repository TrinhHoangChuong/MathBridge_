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

/**
 * Kiểm tra user đã đăng nhập đầy đủ chưa (có cả user và token)
 * @returns {boolean} true nếu đã đăng nhập đầy đủ
 */
export function isAuthenticated() {
  const auth = getAuth();
  const hasToken = auth?.token || localStorage.getItem("mb_token");
  return !!(auth && auth.user && hasToken);
}

/**
 * Lấy JWT token từ localStorage
 * @returns {string|null} JWT token hoặc null nếu không có
 */
export function getToken() {
  // Ưu tiên mb_token (format cũ)
  let token = localStorage.getItem("mb_token");
  if (token) return token;
  
  // Fallback về mb_auth.token (format mới)
  const auth = getAuth();
  return auth?.token || null;
}