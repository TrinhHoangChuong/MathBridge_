// portal/admin/js/admin-auth-guard.js

const TOKEN_KEY = "MB_ACCESS_TOKEN";
const ROLES_KEY = "MB_ACCOUNT_ROLES";

function hasAdminRole(rawRoles) {
  if (!Array.isArray(rawRoles)) return false;

  return rawRoles.some((r) => {
    if (!r) return false;
    const v = String(r).toUpperCase();
    // R005: ID role admin hiện tại
    return v === "R005" || v === "ADMIN" || v === "ROLE_ADMIN";
  });
}

// Gọi ở đầu mỗi trang admin (index_admin.html, tkphanquyen.html, ...)
export function ensureAdminAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const rolesStr = localStorage.getItem(ROLES_KEY);
    const roles = rolesStr ? JSON.parse(rolesStr) : [];
    if (!hasAdminRole(roles)) {
      window.location.href = "./login.html";
    }
  } catch (e) {
    console.error("[ADMIN-GUARD] Parse roles error:", e);
    window.location.href = "./login.html";
  }
}

// Dùng để thêm Authorization header vào các fetch admin
export function getAuthHeaders(extra = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const base = {
    ...(extra || {}),
  };
  if (token) {
    base["Authorization"] = `Bearer ${token}`;
  }
  return base;
}
