// Sidebar collapse toggle
(function () {
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-collapsed");
    });
  }
})();

// Profile dropdown toggle
(function () {
  const trigger = document.getElementById("profileTrigger");
  const dropdown = document.getElementById("profileDropdown");

  if (trigger && dropdown) {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("show");
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", expanded ? "false" : "true");
    });

    // click outside to close
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
        dropdown.classList.remove("show");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }
})();

// Navigation + section switching
(function () {
  const navItems = document.querySelectorAll(".nav-item");
  const pageTitle = document.getElementById("pageTitle");
  const sections = {
    dashboard: document.getElementById("section-dashboard"),
    tuyensinh: document.getElementById("section-tuyensinh"),
    chuongtrinh: document.getElementById("section-chuongtrinh"),
    hocsinh: document.getElementById("section-hocsinh"),
    nhansu: document.getElementById("section-nhansu"),
    tuyendung: document.getElementById("section-tuyendung"),
    taichinh: document.getElementById("section-taichinh"),
    hotro: document.getElementById("section-hotro"),
    taikhoan: document.getElementById("section-taikhoan"),
    cauhinh: document.getElementById("section-cauhinh"),
  };

  function setActive(sectionKey, labelText) {
    // 1. Active state in sidebar
    navItems.forEach((btn) => {
      const isActive = btn.getAttribute("data-section-target") === sectionKey;
      btn.classList.toggle("active", isActive);
    });

    // 2. Update page title (header)
    if (pageTitle) {
      pageTitle.textContent = labelText || "Dashboard";
    }

    // 3. Show / hide main sections
    Object.keys(sections).forEach((key) => {
      if (!sections[key]) return;
      if (key === sectionKey) {
        sections[key].classList.remove("hidden");
      } else {
        sections[key].classList.add("hidden");
      }
    });
  }

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-section-target");
      const text = btn.querySelector(".nav-label")
        ? btn.querySelector(".nav-label").textContent.trim()
        : "Dashboard";
      setActive(target, text);
    });
  });
})();
