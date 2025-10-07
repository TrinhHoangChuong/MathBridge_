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

  // Xác định URL hiện tại để đánh dấu menu đang mở
  const currentPage = location.pathname.split("/").pop().toLowerCase();

  document.querySelectorAll("header a").forEach(link => {
    const href = (link.getAttribute("href") || "").toLowerCase();
    if (href.endsWith(currentPage)) link.classList.add("active"); // thêm class active
  });
}

// Cho phép gọi hàm này trực tiếp trong file HTML
window.includePartials = includePartials;
