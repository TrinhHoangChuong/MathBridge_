// file: assets/js/pages/register.page.js
import { enrollCourse } from "../api/courses.api.js?v=20251130";

document.addEventListener("DOMContentLoaded", () => {
  // Đợi một chút để đảm bảo DOM đã render xong
  setTimeout(() => {
    initRegisterForm();
  }, 100);
});

function initRegisterForm() {
  const form = document.getElementById("mb-register-form");
  const errorBox = document.getElementById("register-error");
  
  if (!form) {
    console.warn("Register form not found");
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');

  // Modal credentials functions
  let savedEmail = "";
  let savedPassword = "";

  function openCredentialsModal(email, password) {
    const modal = document.getElementById("credentials-modal");
    if (!modal) return;

    const emailEl = document.getElementById("cred-email");
    const passEl = document.getElementById("cred-password");

    // Lưu email/password để dùng khi đóng modal
    savedEmail = email || "";
    savedPassword = password || "";

    if (emailEl) emailEl.value = savedEmail;
    if (passEl) passEl.value = savedPassword;

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  }

  function closeCredentialsModal() {
    const modal = document.getElementById("credentials-modal");
    if (!modal) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");

    // Chuyển sang tab login và điền email/password
    if (savedEmail && savedPassword) {
      // Gọi setTab từ login.html (nếu có)
      if (typeof setTab === "function") {
        setTab("login");
      } else {
        // Fallback: tự tìm và click tab login
        const tabLogin = document.getElementById("tab-login");
        if (tabLogin) {
          tabLogin.click();
        }
      }

      // Điền email/password vào form đăng nhập
      setTimeout(() => {
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        if (emailInput) emailInput.value = savedEmail;
        if (passwordInput) passwordInput.value = savedPassword;

        // Focus vào email input
        if (emailInput) {
          emailInput.focus();
        }
      }, 100);
    }
  }

  // Close modal events
  document.querySelectorAll("[data-close-credentials-modal]").forEach((el) => {
    el.addEventListener("click", closeCredentialsModal);
  });

  // Copy button events
  document.querySelectorAll(".cred-copy-btn[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-copy");
      const input =
        type === "email" ? document.getElementById("cred-email") : document.getElementById("cred-password");
      if (input && input.value) {
        navigator.clipboard?.writeText(input.value).catch(() => {});
        btn.textContent = "Đã copy";
        setTimeout(() => {
          btn.textContent = "Copy";
        }, 2000);
      }
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    // Lấy các element - kiểm tra null an toàn
    const hoTenEl = document.getElementById("reg-hoTen");
    const sdtEl = document.getElementById("reg-sdt");
    const ngaySinhEl = document.getElementById("reg-ngaySinh");
    const gioiTinhEl = document.getElementById("reg-gioitinh");
    const diaChiEl = document.getElementById("reg-diaChi");

    // Validate elements tồn tại
    if (!hoTenEl || !sdtEl || !gioiTinhEl) {
      console.error("Form elements not found:", { hoTenEl, sdtEl, gioiTinhEl });
      return showError("Lỗi: Không tìm thấy các trường form. Vui lòng tải lại trang.");
    }

    const hoTen = hoTenEl.value?.trim() || "";
    const sdt = sdtEl.value?.trim() || "";
    const ngaySinh = ngaySinhEl?.value || "";
    const gioiTinhRaw = gioiTinhEl.value || "male";
    const diaChi = diaChiEl?.value?.trim() || "";

    // Validate
    if (!hoTen || !sdt) {
      return showError("Vui lòng nhập đủ họ tên và số điện thoại.");
    }

    const sdtDigits = sdt.replace(/\D/g, "");
    if (sdtDigits.length < 8) {
      return showError("Số điện thoại không hợp lệ.");
    }

    // Convert gioiTinh: male -> 1 (Nam), female -> 0 (Nữ) - theo DTO backend
    const gioiTinh = gioiTinhRaw === "male" ? 1 : 0;

    // Prepare payload - giống hệt courses.page.js
    const payload = {
      hoTen,
      soDienThoai: sdtDigits,
      ngaySinh: ngaySinh || null,
      gioiTinh,
      diaChi: diaChi || null,
      // courseId: null - không gửi courseId nếu không có
    };
    
    // Debug: log payload
    console.log("Register payload:", payload);

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset._oldText = submitBtn.textContent;
        submitBtn.textContent = "Đang xử lý…";
      }

      const result = await enrollCourse(payload);
      
      // Debug: log response để kiểm tra
      console.log("Register response:", result);

      if (result?.success) {
        // Đăng ký thành công - logic giống hệt courses.page.js
        hideError();
        
        // Lấy email và password từ response (DangKyLHResponse có email và password)
        // Response từ backend: {success: true, message: "...", data: {email, password, ...}}
        const responseData = result.data || {};
        const email = responseData.email || result.email || "";
        const password = responseData.password || result.password || "";

        console.log("Email:", email, "Password:", password);

        if (email && password) {
          // Hiển thị modal credentials
          openCredentialsModal(email, password);
        } else {
          // Nếu không có email/password, vẫn hiển thị thông báo thành công
          showError("Đăng ký thành công! Vui lòng kiểm tra email để nhận thông tin đăng nhập.");
        }
      } else {
        // Lỗi đăng ký
        const errorMsg = result?.message || "Đăng ký không thành công. Vui lòng thử lại.";
        console.error("Register error:", errorMsg, result);
        showError(errorMsg);
      }
    } catch (err) {
      console.error("Register error:", err);
      showError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset._oldText || "Hoàn tất đăng ký";
      }
    }
  });

  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.style.display = "block";
    errorBox.setAttribute("tabindex", "-1");
    errorBox.focus();
  }

  function hideError() {
    if (!errorBox) return;
    errorBox.textContent = "";
    errorBox.style.display = "none";
  }
}
