// ===== Sidebar collapse toggle =====
(function () {
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-collapsed");
    });
  }
})();

// ===== Profile dropdown toggle =====
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

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
        dropdown.classList.remove("show");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }
})();

// ===== Simple module loader (HTML + CSS + optional callback) =====
const __moduleLoaded = new Set();

function ensureCssLoaded(href) {
  if (!href) return;
  const exists = Array.from(document.styleSheets).some(
    (s) => s.href && s.href.includes(href)
  );
  if (exists) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-module-css", href);
  document.head.appendChild(link);
}

/**
 * Load 1 section:
 * - inject HTML
 * - inject CSS
 * - gọi afterLoad() (nếu có) sau khi HTML đã sẵn sàng trong DOM
 */
async function loadSectionModule(sectionId, htmlPath, cssPath, afterLoad) {
  const host = document.getElementById(sectionId);
  if (!host) return;

  if (!__moduleLoaded.has(sectionId)) {
    if (cssPath) ensureCssLoaded(cssPath);

    if (htmlPath) {
      const resp = await fetch(htmlPath, { cache: "no-store" });
      const html = await resp.text();
      host.innerHTML = html;
    }

    if (typeof afterLoad === "function") {
      await afterLoad();
    }

    __moduleLoaded.add(sectionId);
  }
}

// ===== Navigation + section switching =====
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
    navItems.forEach((btn) => {
      const isActive = btn.getAttribute("data-section-target") === sectionKey;
      btn.classList.toggle("active", isActive);
    });

    if (pageTitle) pageTitle.textContent = labelText || "Dashboard";

    Object.keys(sections).forEach((key) => {
      const el = sections[key];
      if (!el) return;
      el.classList.toggle("hidden", key !== sectionKey);
    });
  }

  // Load Dashboard ngay khi vào (HTML + CSS + JS KPI)
  loadSectionModule(
    "section-dashboard",
    "sections/dashboard.html",
    "css/dashboard.css",
    async () => {
      const module = await import("./pages/dashboard.pages.js");
      if (module && typeof module.initDashboardPage === "function") {
        await module.initDashboardPage();
      }
    }
  );
  setActive("dashboard", "Dashboard");

  navItems.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = btn.getAttribute("data-section-target");
      const labelEl = btn.querySelector(".nav-label");
      const text = labelEl ? labelEl.textContent.trim() : "Dashboard";

      if (target === "dashboard") {
        await loadSectionModule(
          "section-dashboard",
          "sections/dashboard.html",
          "css/dashboard.css",
          async () => {
            const module = await import("./pages/dashboard.pages.js");
            if (module && typeof module.initDashboardPage === "function") {
              await module.initDashboardPage();
            }
          }
        );
      } else if (target === "tuyensinh") {
        await loadSectionModule(
          "section-tuyensinh",
          "sections/tuyensinh.html",
          null,
          null
        );
      } else if (target === "chuongtrinh") {
        await loadSectionModule(
          "section-chuongtrinh",
          "sections/chuongtrinh.html",
          null,
          null
        );
      } else if (target === "hocsinh") {
        await loadSectionModule(
          "section-hocsinh",
          "sections/hocsinh.html",
          null,
          null
        );
      } else if (target === "nhansu") {
        await loadSectionModule(
          "section-nhansu",
          "sections/nhansu.html",
          null,
          null
        );
      } else if (target === "tuyendung") {
        await loadSectionModule(
          "section-tuyendung",
          "sections/tuyendung.html",
          null,
          null
        );
      } else if (target === "taichinh") {
        await loadSectionModule(
          "section-taichinh",
          "sections/taichinh.html",
          null,
          null
        );
      } else if (target === "hotro") {
        await loadSectionModule(
          "section-hotro",
          "sections/hotro.html",
          null,
          null
        );
      } else if (target === "taikhoan") {
        await loadSectionModule(
          "section-taikhoan",
          "sections/taikhoan.html",
          null,
          null
        );
      } else if (target === "cauhinh") {
        await loadSectionModule(
          "section-cauhinh",
          "sections/cauhinh.html",
          null,
          null
        );
      }

      setActive(target, text);
    });
  });
})();
