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

    // chuẩn hoá user
    user =
      (data && (data.user || data.account || data.profile)) ||
      null;

    // chuẩn hoá roles
    if (user && Array.isArray(user.roles)) {
      roles = user.roles;
    } else if (data && Array.isArray(data.roles)) {
      roles = data.roles;
    }

    // chỉ cho học sinh
    const isStudent =
      roles.includes("R001") ||
      roles.some((r) => /hoc\s*sinh/i.test(r));

    // chưa đăng nhập / không phải học sinh
    if (!data || !isStudent) {
      loginBtn.hidden = false;
      loginBtn.style.display = "inline-flex";

      userBox.hidden = true;
      userBox.style.display = "none";
      return;
    }

    // đã đăng nhập học sinh
    loginBtn.hidden = true;
    loginBtn.style.display = "none";

    userBox.hidden = false;
    userBox.style.display = "flex";

    const name =
      user.hoTen ||
      user.ten ||
      user.fullName ||
      user.email ||
      "Học sinh";

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
