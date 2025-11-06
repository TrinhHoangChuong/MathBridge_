// file: assets/js/pages/login.page.js
// loginStudentApi được load từ login.api.js và expose qua window.loginStudentApi

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("mb-login-form");
  const errorBox = document.getElementById("auth-error");
  if (!form) return;

  // Kiểm tra localStorage có email/password từ đăng ký không
  const pendingEmail = localStorage.getItem("pendingLoginEmail");
  const pendingPassword = localStorage.getItem("pendingLoginPassword");
  
  if (pendingEmail && pendingPassword) {
    // Xóa localStorage
    localStorage.removeItem("pendingLoginEmail");
    localStorage.removeItem("pendingLoginPassword");
    
    // Điền email/password vào form
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    if (emailInput) emailInput.value = pendingEmail;
    if (passwordInput) passwordInput.value = pendingPassword;
    
    // Chuyển sang tab login (nếu đang ở tab register)
    setTimeout(() => {
      if (typeof setTab === "function") {
        setTab("login");
      } else {
        const tabLogin = document.getElementById("tab-login");
        if (tabLogin) {
          tabLogin.click();
        }
      }
      
      // Focus vào email input
      if (emailInput) {
        emailInput.focus();
      }
    }, 100);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      return showError("Vui lòng nhập email và mật khẩu.");
    }

    const result = await window.loginStudentApi(email, password);
    console.log("login result:", result);

    if (!result.ok) {
      if (result.error === "NETWORK_ERROR") {
        return showError("Không kết nối được máy chủ. Thử lại sau.");
      }
      return showError("Email hoặc mật khẩu không đúng.");
    }

    const payload = result.data || result || {};
    const user = payload.user || payload.account || payload || {};
    const roles = user.roles || payload.roles || [];

    // LƯU kiểu mới - đảm bảo có đầy đủ thông tin
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
    
    // Lấy tên - ưu tiên fullName từ backend (đã build từ ho, tenDem, ten)
    const name =
      user.fullName ||        // Ưu tiên fullName từ AuthenticatedAccountDTO
      user.hoTen ||            // Fallback: hoTen nếu có
      (user.ho && user.ten ? `${user.ho} ${user.tenDem || ""} ${user.ten}`.trim() : null) || // Build từ ho, tenDem, ten
      user.ten ||              // Chỉ có tên
      user.email ||            // Fallback: email
      "Người dùng";
    
    localStorage.setItem("mb_user_name", name);
    
    console.log("User info saved:", {
      fullName: user.fullName,
      hoTen: user.hoTen,
      name: name,
      roles: roles
    });

    // Redirect theo role
    // Mapping: R001 = Học sinh (HS), R002 = Giáo viên (GV), R003 = Cố vấn, R004+ = Admin (nếu có)
    // Thứ tự ưu tiên: Admin > Giáo viên > Học sinh
    let redirectUrl = "index.html"; // default
    
    // Kiểm tra role có quyền cao nhất
    const hasAdmin = roles.some(r => {
      // Kiểm tra R003 (Cố vấn - có thể là admin) hoặc R004+
      if (r === "R003" || r === "R004") return true;
      // Kiểm tra pattern R00[4-9], R0[1-9][0-9], R[1-9][0-9]{2}
      if (/^R00[4-9]$/.test(r) || /^R0[1-9][0-9]$/.test(r) || /^R[1-9][0-9]{2}$/.test(r)) return true;
      // Kiểm tra tên role có chứa admin
      if (/admin|quan.*tri|ADMIN/i.test(r)) return true;
      return false;
    });
    
    const hasTeacher = roles.includes("R002") || roles.some(r => /giao.*vien|teacher|GV/i.test(r));
    const hasStudent = roles.includes("R001") || roles.some(r => /hoc.*sinh|student|HS/i.test(r));
    
    if (hasAdmin) {
      // Admin -> trang admin (toàn quyền)
      redirectUrl = "portal/admin/index_admin.html";
    } else if (hasTeacher) {
      // Giáo viên -> trang giáo viên
      redirectUrl = "portal/teacher/index_teacher.html";
    } else if (hasStudent) {
      // Học sinh -> trang học sinh
      redirectUrl = "portal/student/index_student.html";
    } else if (roles.length === 0) {
      // Không có role -> về trang chủ
      redirectUrl = "index.html";
    } else {
      // Có role nhưng không match -> về trang chủ
      console.warn("Unknown roles:", roles, "- redirecting to home");
      redirectUrl = "index.html";
    }

    console.log("Login successful. Roles:", roles, "-> Redirecting to:", redirectUrl);

    // Gọi hàm render header nếu có (để cập nhật UI ngay lập tức)
    if (window.mbRenderHeader) {
      window.mbRenderHeader();
    }

    // Redirect đến trang tương ứng
    window.location.href = redirectUrl;
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
