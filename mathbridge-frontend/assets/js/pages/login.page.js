// file: assets/js/pages/login.page.js
import { loginStudentApi } from "../api/login.api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("mb-login-form");
  const errorBox = document.getElementById("auth-error");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      return showError("Vui lòng nhập email và mật khẩu.");
    }

    const result = await loginStudentApi(email, password);
    console.log("login result:", result);

    if (!result.ok) {
      if (result.error === "NETWORK_ERROR") {
        return showError("Không kết nối được máy chủ. Thử lại sau.");
      }
      return showError("Email hoặc mật khẩu không đúng.");
    }

    const payload = result.data || {};
    const user = payload.user || payload.account || {};
    const roles = user.roles || [];

    const isStudent =
      roles.includes("R001") ||
      roles.some((r) => /hoc\s*sinh/i.test(r));

    if (!isStudent) {
      return showError("Trang này chỉ dành cho học sinh.");
    }

    // LƯU kiểu mới
    localStorage.setItem("mb_auth", JSON.stringify(payload));

    // LƯU thêm kiểu cũ cho mấy trang cũ
    if (payload.token) {
      localStorage.setItem("mb_token", payload.token);
    }
    if (payload.tokenType) {
      localStorage.setItem("mb_token_type", payload.tokenType);
    }
    if (user.idTk || user.id) {
      localStorage.setItem("mb_user_id", user.idTk || user.id);
    }
    if (user.email) {
      localStorage.setItem("mb_user_email", user.email);
    }
    if (roles.length) {
      localStorage.setItem("mb_user_roles", JSON.stringify(roles));
    }
    const name =
      user.hoTen || user.ten || user.fullName || user.email || "Học sinh";
    localStorage.setItem("mb_user_name", name);

    // về trang chủ
    window.location.href = "index.html";
  });

  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.style.display = "block";
  }

  function hideError() {
    if (!errorBox) return;
    errorBox.textContent = "";
    errorBox.style.display = "none";
  }
});
