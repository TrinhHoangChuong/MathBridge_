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
    try {
      if (cssPath) ensureCssLoaded(cssPath);

      if (htmlPath) {
        const resp = await fetch(htmlPath, { cache: "no-store" });
        if (!resp.ok) {
          throw new Error(`Không thể load HTML cho section: ${sectionId}`);
        }
        const html = await resp.text();
        host.innerHTML = html;
      }

      if (typeof afterLoad === "function") {
        await afterLoad();
      }

      __moduleLoaded.add(sectionId);
    } catch (err) {
      console.error(`Lỗi khi load module cho section ${sectionId}:`, err);
    }
  }
}

// ===== Navigation + section switching =====
(function () {
  const navItems = document.querySelectorAll(".nav-item");
  const pageTitle = document.getElementById("pageTitle");

  const sections = {
    dashboard: document.getElementById("section-dashboard"),
    lichoc: document.getElementById("section-lichhoc"),
    chuongtrinh: document.getElementById("section-chuongtrinh"),
    hocsinh: document.getElementById("section-hocsinh"),
    nhansu: document.getElementById("section-nhansu"),
    tuyendung: document.getElementById("section-tuyendung"),
    taichinh: document.getElementById("section-taichinh"),
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
      } else if (target === "lichoc") {
        await loadSectionModule(
          "section-lichhoc",
          "sections/lichhoc.html",
          "css/lichhoc.css",
          async () => {
            const module = await import("./pages/lichhoc.pages.js");
            if (module && typeof module.initLichHocPage === "function") {
              await module.initLichHocPage();
            }
          }
        );
      } else if (target === "chuongtrinh") {
        await loadSectionModule(
          "section-chuongtrinh",
          "sections/chuongtrinh.html",
          "css/chuongtrinh.css",
          async () => {
            const module = await import("./pages/chuongtrinhPage.js");
            if (module && typeof module.initChuongTrinhPage === "function") {
              await module.initChuongTrinhPage();
            }
          }
        );
      } else if (target === "hocsinh") {
        await loadSectionModule(
          "section-hocsinh",
          "sections/hocsinh.html",
          "css/hocsinh.css",
          async () => {
            const module = await import("./pages/hocsinh.pages.js");
            if (module && typeof module.initHocSinhPage === "function") {
              await module.initHocSinhPage();
            }
          }
        );
      } else if (target === "nhansu") {
        await loadSectionModule(
          "section-nhansu",
          "sections/nhansu.html",
          "css/nhansu.css",
          async () => {
            const module = await import("./pages/nhansu.pages.js");
            // 🔥 Dùng đúng tên hàm đã export
            if (module && typeof module.initNhansuPage === "function") {
              await module.initNhansuPage();
            }
          }
        );
      } else if (target === "tuyendung") {
        await loadSectionModule(
          "section-tuyendung",
          "sections/tuyendung.html",
          "css/tuyendung.css",
          async () => {
            const module = await import("./pages/tuyendung.pages.js");
            if (module && typeof module.initTuyenDungPage === "function") {
              await module.initTuyenDungPage();
            }
          }
        );
      } else if (target === "taichinh") {
        await loadSectionModule(
          "section-taichinh",
          "sections/taichinh.html",
          "css/taichinh.css",
          async () => {
            const module = await import("./pages/taichinhpages.js");
            // nhớ export hàm này trong taichinh.pages.js
            if (module && typeof module.initTaiChinhPage === "function") {
              await module.initTaiChinhPage();
            }
          }
        );
      } else if (target === "taikhoan") {
        await loadSectionModule(
          "section-taikhoan",
          "sections/tkphanquyen.html",
          "css/tkphanquyen.css",
          async () => {
            const module = await import("./pages/tkphanquyen.pages.js");
            if (module && typeof module.initTaiKhoanPage === "function") {
              await module.initTaiKhoanPage();
            }
          }
        );
      } else if (target === "cauhinh") {
        await loadSectionModule(
          "section-cauhinh",
          "sections/cauhinh.html",
          "css/cauhinh.css",
          async () => {
            const module = await import("./pages/cauhinh.pages.js");
            if (module && typeof module.initCauHinhPage === "function") {
              await module.initCauHinhPage();
            }
          }
        );
      }

      setActive(target, text);
    });
  });
})();
