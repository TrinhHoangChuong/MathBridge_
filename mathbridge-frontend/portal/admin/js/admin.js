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

// ===== Simple module loader (HTML + CSS + JS) =====
const __moduleLoaded = new Set();

function ensureCssLoaded(href) {
  if (!href) return;
  const exists = Array.from(document.styleSheets).some((s) => s.href && s.href.includes(href));
  if (exists) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-module-css", href);
  document.head.appendChild(link);
}

function ensureJsLoaded(src) {
  if (!src) return Promise.resolve();
  const exists = Array.from(document.scripts).some((s) => s.src && s.src.includes(src));
  if (exists) return Promise.resolve();
  return new Promise((res, rej) => {
    const sc = document.createElement("script");
    sc.src = src;
    sc.async = false;
    sc.setAttribute("data-module-js", src);
    sc.onload = () => res();
    sc.onerror = () => rej(new Error("Failed to load " + src));
    document.body.appendChild(sc);
  });
}

async function loadSectionModule(sectionId, htmlPath, cssPath, jsPath) {
  const host = document.getElementById(sectionId);
  if (!host) return;
  if (!__moduleLoaded.has(sectionId)) {
    ensureCssLoaded(cssPath);
    const resp = await fetch(htmlPath, { cache: "no-store" });
    const html = await resp.text();
    host.innerHTML = html;
    await ensureJsLoaded(jsPath);
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

  navItems.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = btn.getAttribute("data-section-target");
      const text = btn.querySelector(".nav-label")
        ? btn.querySelector(".nav-label").textContent.trim()
        : "Dashboard";

      // lazy load module cho Tuyển sinh & Lead
      if (target === "tuyensinh") {
        await loadSectionModule(
          "section-tuyensinh",
          "TuyenSinh_Lead.html",
          "css/tslead.css",
          "js/tslead.js"
        );
      }

      setActive(target, text);
    });
  });
})();
