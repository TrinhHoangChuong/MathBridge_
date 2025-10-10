// File: /assets/js/utils/includePartials.js

// Hàm tải nội dung header & footer
async function loadPart(selector, filePath) {
  const element = document.querySelector(selector);
  if (!element) return;

  try {
    const response = await fetch(`${filePath}?v=${Date.now()}`);
    element.innerHTML = await response.text();
  } catch (err) {
    element.innerHTML = "<p style='color:red'>Không tải được phần này!</p>";
    console.error("Lỗi khi tải partial:", err);
  }
}

// Hàm chính: tải header & footer + đánh dấu menu đang active
async function includePartials(options) {
  await loadPart("header", options.header); // nạp header.html
  await loadPart("footer", options.footer); // nạp footer.html

  // Đánh dấu active theo URL (khớp đúng tên file, bỏ qua #)
  const getFileName = (url) => {
    try {
      const clean = (url || "").split("?")[0].split("#")[0];
      return clean.split("/").pop().toLowerCase();
    } catch { return ""; }
  };
  const currentPage = getFileName(location.pathname) || "index.html";
  const topLevelLinks = Array.from(document.querySelectorAll(".mb-links > a[href], .mb-dd > a.mb-dd-link[href]"));
  topLevelLinks.forEach(a => a.classList.remove("active"));
  // đảm bảo nút dropdown không bao giờ có active
  const ddBtnEl = document.querySelector('.mb-dd-btn');
  if (ddBtnEl) ddBtnEl.classList.remove('active');

  topLevelLinks.forEach(link => {
    const hrefFile = getFileName(link.getAttribute("href"));
    if (hrefFile && hrefFile !== "#" && hrefFile === currentPage) {
      link.classList.add("active");
    }
  });

  // Chỉ in đậm + gạch dưới khi CLICK (không áp dụng cho '#')
  const menuLinks = document.querySelectorAll(".mb-links > a[href]");
  menuLinks.forEach(a => {
    a.addEventListener("click", () => {
      if (a.getAttribute("href") === "#") return; // bỏ qua link giả
      document.querySelectorAll(".mb-links a.active").forEach(el => el.classList.remove("active"));
      a.classList.add("active");
    });
  });

  // Biến dropdown mở bằng click (tránh hover đè lên link LIÊN HỆ)
  const dropdown = document.querySelector(".mb-dd");
  const ddButton = document.querySelector(".mb-dd-btn");
  if (dropdown && ddButton) {
    const toggleOpen = (open) => {
      dropdown.classList.toggle("open", open);
    };

    ddButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdown.classList.contains("open");
      toggleOpen(!isOpen);
    });

    // Đóng khi click ra ngoài
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) toggleOpen(false);
    });

    // Đóng bằng phím Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") toggleOpen(false);
    });
  }
}

// Cho phép gọi hàm này trực tiếp trong file HTML
window.includePartials = includePartials;
