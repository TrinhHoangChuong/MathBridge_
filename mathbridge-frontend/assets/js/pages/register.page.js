// file: assets/js/pages/register.page.js
import { registerStudentApi } from "../api/register.api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("mb-register-form");
  const errorBox = document.getElementById("register-error");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const sdt = document.getElementById("reg-sdt").value.trim();
    const gioiTinhRaw = document.getElementById("reg-gioitinh").value; // "true" | "false" | ""
    const ho = document.getElementById("reg-ho").value.trim();
    const tenDem = document.getElementById("reg-tendem").value.trim();
    const ten = document.getElementById("reg-ten").value.trim();
    const diaChi = document.getElementById("reg-diachi").value.trim();

    // validate nhẹ phía client
    if (!email || !password || !sdt || !ho || !ten || !diaChi || (gioiTinhRaw !== "true" && gioiTinhRaw !== "false")) {
      return showError("Vui lòng nhập đủ thông tin bắt buộc.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showError("Email không hợp lệ.");
    }
    if (password.length < 6) {
      return showError("Mật khẩu tối thiểu 6 ký tự.");
    }
    const sdtDigits = sdt.replace(/\D/g, "");
    if (sdtDigits.length < 8) {
      return showError("Số điện thoại không hợp lệ.");
    }

    const payload = {
      email,
      password,
      sdt: sdtDigits,
      ho,
      ten,
      tenDem: tenDem || null,           // optional
      gioiTinh: gioiTinhRaw === "true", // boolean
      diaChi
    };

    try {
      submitBtn && (submitBtn.disabled = true);
      if (submitBtn) {
        submitBtn.dataset._oldText = submitBtn.textContent;
        submitBtn.textContent = "Đang xử lý…";
      }

      const result = await registerStudentApi(payload);
      if (!result.ok) {
        if (result.error === "NETWORK_ERROR")    return showError("Không kết nối được máy chủ. Thử lại sau.");
        if (result.error === "DUPLICATE")        return showError("Email hoặc SĐT đã tồn tại.");
        if (result.error === "VALIDATION_ERROR") return showError("Dữ liệu không hợp lệ.");
        if (result.error === "UNAUTHORIZED")     return showError("Máy chủ đang từ chối. Kiểm tra cấu hình bảo mật.");
        return showError("Không thể đăng ký. Vui lòng thử lại.");
      }

      const payloadRes = result.data || {};
      const user = payloadRes.user || {};
      const roles = user.roles || [];

      // Lưu localStorage thống nhất với luồng đăng nhập
      localStorage.setItem("mb_auth", JSON.stringify(payloadRes));
      if (payloadRes.token) localStorage.setItem("mb_token", payloadRes.token);
      if (payloadRes.tokenType) localStorage.setItem("mb_token_type", payloadRes.tokenType);
      if (user.idTk) localStorage.setItem("mb_user_id", user.idTk);
      if (user.email) localStorage.setItem("mb_user_email", user.email);
      if (roles.length) localStorage.setItem("mb_user_roles", JSON.stringify(roles));
      const name = user.fullName || `${ho} ${ten}` || email;
      localStorage.setItem("mb_user_name", name);

      window.location.href = "index.html";
    } catch (e2) {
      console.error(e2);
      showError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset._oldText || "Hoàn tất đăng ký";
      }
    }
  });

  function showError(msg){
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.style.display = "block";
    // focus để hỗ trợ a11y
    errorBox.setAttribute("tabindex", "-1");
    errorBox.focus();
  }
  function hideError(){
    if (!errorBox) return;
    errorBox.textContent = "";
    errorBox.style.display = "none";
  }
});
