// file: assets/js/pages/header.pages.js
// Dùng chung để đồng bộ trạng thái đăng nhập trên header
// Đọc từ localStorage: "mb_auth"

(function () {
  function renderHeaderFromAuth() {
    const loginBtn   = document.getElementById("mb-login-btn");
    const userBox    = document.getElementById("mb-user-box");
    const nameEl     = document.getElementById("mb-user-name");
    const avatarEl   = document.getElementById("mb-user-avatar");
    const userMenu   = document.getElementById("mb-user-menu");
    const userToggle = document.getElementById("mb-user-toggle");

    if (!loginBtn || !userBox) {
      return;
    }

    // đọc auth mới
    let raw   = localStorage.getItem("mb_auth");
    let data  = null;
    let user  = null;
    let roles = [];

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.warn("mb_auth parse error", err);
      }
    }

    // chuẩn hoá user - có thể user ở trong data.user, data.account, hoặc chính data
    user =
      (data && (data.user || data.account || data.profile)) ||
      (data && data.email ? data : null) || // Nếu data có email, có thể chính nó là user
      null;

    // chuẩn hoá roles
    if (user && Array.isArray(user.roles)) {
      roles = user.roles;
    } else if (data && Array.isArray(data.roles)) {
      roles = data.roles;
    } else if (data && user && user.roles) {
      // Nếu roles là string hoặc object, convert sang array
      if (typeof user.roles === 'string') {
        try {
          roles = JSON.parse(user.roles);
        } catch {
          roles = [user.roles];
        }
      }
    }

    // Kiểm tra đã đăng nhập (có bất kỳ role nào hoặc có email trong data)
    const isLoggedIn = data && (roles.length > 0 || data.email || user);

    // chưa đăng nhập
    if (!isLoggedIn) {
      loginBtn.hidden = false;
      loginBtn.style.display = "inline-flex";

      userBox.hidden = true;
      userBox.style.display = "none";
      return;
    }

    // đã đăng nhập - hiển thị user box
    loginBtn.hidden = true;
    loginBtn.style.display = "none";

    userBox.hidden = false;
    userBox.style.display = "flex";

    // Lấy tên - ưu tiên fullName (Họ và Tên đầy đủ) từ backend
    let name = null;
    
    // Ưu tiên 1: fullName từ user object (AuthenticatedAccountDTO)
    if (user && user.fullName && user.fullName.trim()) {
      name = user.fullName.trim();
    }
    // Ưu tiên 2: hoTen từ user
    else if (user && user.hoTen && user.hoTen.trim()) {
      name = user.hoTen.trim();
    }
    // Ưu tiên 3: Build từ ho, tenDem, ten nếu có
    else if (user && (user.ho || user.ten)) {
      const parts = [];
      if (user.ho) parts.push(user.ho.trim());
      if (user.tenDem) parts.push(user.tenDem.trim());
      if (user.ten) parts.push(user.ten.trim());
      name = parts.join(" ").trim();
    }
    // Ưu tiên 4: fullName từ data root
    else if (data && data.fullName && data.fullName.trim()) {
      name = data.fullName.trim();
    }
    // Ưu tiên 5: Từ localStorage (đã lưu từ login)
    else {
      const savedName = localStorage.getItem("mb_user_name");
      if (savedName && savedName.trim() && savedName !== "Người dùng") {
        name = savedName.trim();
      }
    }
    
    // Fallback cuối cùng: email hoặc "Người dùng"
    if (!name || name.trim() === "") {
      name = (user && user.email) || (data && data.email) || "Người dùng";
    }

    const first = name.trim().charAt(0).toUpperCase();

    if (nameEl) nameEl.textContent = name;
    if (avatarEl) avatarEl.textContent = first;

    // menu user
    if (userToggle && userMenu) {
      userToggle.onclick = function () {
        userMenu.classList.toggle("show");
      };

      document.addEventListener("click", function (e) {
        if (!userBox.contains(e.target)) {
          userMenu.classList.remove("show");
        }
      });

      userMenu.querySelectorAll(".mb-user-item").forEach((btn) => {
        btn.addEventListener("click", function () {
          const action = btn.dataset.action;
          if (action === "portal") {
<<<<<<< HEAD
            // Check authentication before redirecting to portal
            const authCheck = isAuthenticated();
            if (!authCheck.authenticated) {
              alert("Bạn cần đăng nhập để truy cập portal!");
              window.location.href = "pages/login.html";
              return;
            }

            // Check if user is a student
            const studentCheck = isStudent();
            if (!studentCheck.authenticated) {
              alert("Chỉ học sinh mới có thể truy cập portal!");
              return;
            }

            // Redirect to student portal
            window.location.href = "portal/student/index_student.html";
=======
            // Redirect theo role
            const userRoles = roles.length > 0 ? roles : 
              (localStorage.getItem("mb_user_roles") ? JSON.parse(localStorage.getItem("mb_user_roles")) : []);
            
            let portalUrl = "portal/student/index_student.html"; // default
            
            // Kiểm tra role có quyền cao nhất
            const hasAdmin = userRoles.some(r => {
              if (r === "R003" || r === "R004") return true;
              if (/^R00[4-9]$/.test(r) || /^R0[1-9][0-9]$/.test(r) || /^R[1-9][0-9]{2}$/.test(r)) return true;
              if (/admin|quan.*tri|ADMIN/i.test(r)) return true;
              return false;
            });
            
            const hasTeacher = userRoles.includes("R002") || userRoles.some(r => /giao.*vien|teacher|GV/i.test(r));
            const hasStudent = userRoles.includes("R001") || userRoles.some(r => /hoc.*sinh|student|HS/i.test(r));
            
            if (hasAdmin) {
              portalUrl = "portal/admin/index_admin.html";
            } else if (hasTeacher) {
              portalUrl = "portal/teacher/index_teacher.html";
            } else if (hasStudent) {
              portalUrl = "portal/student/index_student.html";
            }
            
            window.location.href = portalUrl;
>>>>>>> main
          }
          if (action === "logout") {
            // xoá chuẩn
            localStorage.removeItem("mb_auth");
            // xoá mấy key cũ (nếu trước đây dùng mb_token)
            localStorage.removeItem("mb_token");
            localStorage.removeItem("mb_token_type");
            localStorage.removeItem("mb_user_id");
            localStorage.removeItem("mb_user_email");
            localStorage.removeItem("mb_user_roles");
            localStorage.removeItem("mb_user_name");
            window.location.href = "index.html";
          }
        });
      });
    }
  }

  // xuất cho includePartials sau này gọi
  window.mbRenderHeader = renderHeaderFromAuth;

  // nếu header đã có sẵn trong DOM thì render luôn (trang render trực tiếp, không chờ include)
  if (document.querySelector(".mb-header")) {
    renderHeaderFromAuth();
  }
})();
