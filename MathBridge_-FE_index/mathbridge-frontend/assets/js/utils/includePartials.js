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

  // Smart routing for course links across directories
  const basePath = location.pathname.includes('/course/') ? '.' : 'course';
  document.querySelectorAll('header .mb-dd-menu a[data-course]').forEach(a => {
    const slug = a.getAttribute('data-course');
    a.setAttribute('href', `${basePath}/khoahoc.html?course=${slug}`);
  });

  // Target selection combo: open a small chooser to pick certificates (single menu item)
  const targetLink = document.querySelector('header .mb-dd-menu a[data-target="true"]');
  if (targetLink) {
    targetLink.addEventListener('click', (e) => {
      e.preventDefault();
      const choice = window.prompt('Chọn chứng chỉ: IGCSE / IB / AP / SAT', 'IGCSE');
      if (!choice) return;
      const slug = String(choice).trim().toLowerCase();
      const map = { igcse: 'igcse', ib: 'ib', ap: 'ap', sat: 'sat' };
      if (map[slug]) {
        location.href = `${basePath}/khoahoc.html?course=${map[slug]}`;
      } else {
        alert('Mục tiêu không hợp lệ. Vui lòng nhập: IGCSE, IB, AP hoặc SAT');
      }
    });
  }

  // Ensure logo always points to homepage from any depth
  const logo = document.querySelector('header .mb-logo');
  if (logo) {
    // Always navigate to explicit homepage URL
    // Use absolute path to ensure both host and nested pages resolve consistently
    const homeHref = `${location.origin}/index.html`;
    logo.setAttribute('href', homeHref);
  }

  // Ensure Inter font is available on all pages
  if (!document.querySelector('link[data-mb-font="inter"]')) {
    const pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';
    const pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.setAttribute('crossorigin', '');
    const link = document.createElement('link');
    link.setAttribute('data-mb-font', 'inter');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
    document.head.appendChild(pre1);
    document.head.appendChild(pre2);
    document.head.appendChild(link);
  }

  // Light cache-busting for CSS to avoid stale styles while developing
  try {
    const v = Date.now();
    document.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
      const href = l.getAttribute('href') || '';
      if (href.includes('/assets/css/')) {
        const newHref = href + (href.includes('?') ? '&' : '?') + 'v=' + v;
        l.setAttribute('href', newHref);
      }
    });
  } catch (_) {}
}

// Cho phép gọi hàm này trực tiếp trong file HTML
window.includePartials = includePartials;
