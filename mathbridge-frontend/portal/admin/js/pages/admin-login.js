// portal/admin/js/pages/admin-login.js
import { CONFIG } from "../../../../assets/js/config.js";

// Endpoint login BE
const LOGIN_URL = `${CONFIG.BASE_URL}/api/public/auth/login`;

// Key lưu auth trong localStorage
const TOKEN_KEY = "MB_ACCESS_TOKEN";
const ROLES_KEY = "MB_ACCOUNT_ROLES";
const USER_KEY = "MB_AUTH_USER";

function showError(message) {
  const errorEl = document.getElementById("admin-login-error");
  if (!errorEl) return;
  errorEl.textContent = message || "Đăng nhập thất bại.";
  errorEl.style.display = "block";
}

function clearError() {
  const errorEl = document.getElementById("admin-login-error");
  if (!errorEl) return;
  errorEl.textContent = "";
  errorEl.style.display = "none";
}

function setLoading(isLoading) {
  const btn = document.getElementById("admin-login-submit");
  if (!btn) return;
  btn.disabled = isLoading;
  const span = btn.querySelector("span");
  if (!span) return;
  span.textContent = isLoading ? "Đang xử lý..." : "Đăng nhập";
}

/**
 * Check role admin:
 * - Hiện tại BE trả roles = ["R005"] cho admin
 * - Sau này nếu đổi sang "ADMIN" / "ROLE_ADMIN" vẫn chạy được
 */
function hasAdminRole(rawRoles) {
  if (!Array.isArray(rawRoles)) return false;

  return rawRoles.some((r) => {
    if (!r) return false;
    const v = String(r).toUpperCase();
    // R005: ID role admin trong DB hiện tại của bạn
    return v === "R005" || v === "ADMIN" || v === "ROLE_ADMIN";
  });
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  clearError();

  const emailInput = document.getElementById("admin-login-email");
  const passwordInput = document.getElementById("admin-login-password");

  if (!emailInput || !passwordInput) {
    showError("Lỗi form. Vui lòng kiểm tra lại HTML.");
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError("Vui lòng nhập đầy đủ email và mật khẩu.");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Khớp 100% với LoginRequestDTO (email, password)
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let message = "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      try {
        const data = await res.json();
        if (data && data.message) {
          message = data.message;
        }
      } catch (_) {
        // ignore parse error
      }
      showError(message);
      setLoading(false);
      return;
    }

    const data = await res.json();
    console.log("[ADMIN-LOGIN] Response:", data);

    // Cấu trúc thực tế từ BE:
    // { success, token, tokenType, expiresIn, user: { idTk, email, roles: [...] } }
    const token = data.token;
    const user = data.user || null;
    const rawRoles = (user && user.roles) || [];

    if (!token) {
      showError("Phản hồi đăng nhập không hợp lệ (không có token).");
      setLoading(false);
      return;
    }

    if (!hasAdminRole(rawRoles)) {
      console.warn("[ADMIN-LOGIN] rawRoles:", rawRoles);
      showError("Tài khoản này không có quyền truy cập trang Admin.");
      setLoading(false);
      return;
    }

    // Lưu token, roles, user vào localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLES_KEY, JSON.stringify(rawRoles));
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    // Redirect sang trang admin chính
    window.location.href = "./index_admin.html";
  } catch (error) {
    console.error("[ADMIN-LOGIN] Lỗi:", error);
    showError("Có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại.");
  } finally {
    setLoading(false);
  }
}

function initAdminLoginPage() {
  const form = document.getElementById("admin-login-form");
  if (!form) return;

  form.addEventListener("submit", handleLoginSubmit);

  // Nếu đã có token + role admin -> cho vào thẳng admin
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      const rolesStr = localStorage.getItem(ROLES_KEY);
      const roles = rolesStr ? JSON.parse(rolesStr) : [];
      if (hasAdminRole(roles)) {
        window.location.href = "./index_admin.html";
      }
    } catch (_) {
      // ignore
    }
  }
}

// ENTRY
document.addEventListener("DOMContentLoaded", initAdminLoginPage);
