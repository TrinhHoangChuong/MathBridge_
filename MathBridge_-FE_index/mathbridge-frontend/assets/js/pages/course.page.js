// Multi-course data. Extend as needed.
const COURSE_CATALOG = {
  igcse: {
    slug: "igcse",
    badge: "Cambridge Track",
    banner: { image: "../assets/img/hero1.jpg", overlay: "linear-gradient(180deg, rgba(2,6,23,.55), rgba(2,6,23,.25))" },
    title: "Toán Cambridge IGCSE (Core & Extended)",
    subtitle: "Xây nền tảng vững chắc và tăng tốc kỹ năng giải quyết vấn đề theo chuẩn Cambridge.",
    level: "IGCSE",
    format: "Online/Offline",
    duration: "24–36 buổi",
    price: "3.200.000đ / tháng",
    schedule: "2 buổi/tuần, 90 phút/buổi",
    capacity: "8–12 học viên",
    teacher: "GV Cambridge Certified",
    highlights: [
      "Giáo trình bám sát đề thi IGCSE mới nhất",
      "Lộ trình cá nhân hóa theo năng lực",
      "Bài tập ứng dụng và chữa chi tiết",
      "Theo dõi tiến độ và báo cáo định kỳ",
    ],
    outcomes: [
      "Nắm chắc đại số, hình học, xác suất & thống kê",
      "Tăng tốc kỹ thuật giải nhanh và chính xác",
      "Cải thiện tư duy mô hình hóa bài toán thực tế",
    ],
    requirements: [
      "Đầu vào làm placement test miễn phí",
      "Có kiến thức toán phổ thông tương ứng",
    ],
    program: [
      { module: "Algebra Essentials", topic: "Expressions, Equations, Inequalities", duration: "4 buổi", skills: "Kỹ thuật biến đổi, giải phương trình" },
      { module: "Functions & Graphs", topic: "Linear, Quadratic, Exponential", duration: "4 buổi", skills: "Phân tích đồ thị, biến thiên" },
      { module: "Geometry", topic: "Congruency, Similarity, Circle Theorems", duration: "5 buổi", skills: "Suy luận hình học, chứng minh" },
      { module: "Trigonometry", topic: "Ratios, Identities, Applications", duration: "3 buổi", skills: "Góc lượng giác, bài toán thực tế" },
      { module: "Statistics & Probability", topic: "Data, Distributions, Probability", duration: "4 buổi", skills: "Đọc biểu đồ, xác suất tổ hợp" },
      { module: "Exam Skills", topic: "Past Papers & Review", duration: "4 buổi", skills: "Chiến lược làm bài, quản lý thời gian" },
    ],
    faq: [
      { q: "Lớp có hỗ trợ thi thử không?", a: "Có. Hàng tháng có bài thi thử theo định dạng Cambridge với chấm điểm chi tiết." },
      { q: "Nếu học online, có record lại bài không?", a: "Có. Video record trong 7 ngày để ôn tập, không dùng cho chia sẻ công khai." },
      { q: "Học phí đóng theo tháng hay theo khóa?", a: "Có cả hai lựa chọn linh hoạt theo nhu cầu phụ huynh/học sinh." },
    ],
  },
  lop10: {
    slug: "lop10",
    badge: "Chương trình VN",
    banner: { image: "../assets/img/hero2.jpg", overlay: "linear-gradient(180deg, rgba(8,47,73,.55), rgba(8,47,73,.2))" },
    title: "Toán Lớp 10 Nâng Cao",
    subtitle: "Củng cố kiến thức nền và phát triển kỹ năng tư duy cho chương trình VN.",
    level: "Lớp 10",
    format: "Offline/Online",
    duration: "24 buổi",
    price: "1.800.000đ / tháng",
    schedule: "2 buổi/tuần, 90 phút/buổi",
    capacity: "10–16 học viên",
    teacher: "GV Toán THPT nhiều năm kinh nghiệm",
    highlights: [
      "Ôn tập trọng tâm theo chuyên đề",
      "Bài tập phân hóa từ cơ bản đến nâng cao",
      "Theo sát kiểm tra 15' / 1 tiết / cuối kỳ",
    ],
    outcomes: [
      "Tự tin điểm 8–9+ Toán Lớp 10",
      "Giải quyết bài tập nâng cao theo hướng dẫn tư duy",
    ],
    requirements: [
      "Kiến thức Toán THCS vững",
    ],
    program: [
      { module: "Đại số", topic: "Hàm số bậc nhất, bậc hai", duration: "6 buổi", skills: "Đồ thị, biến thiên, bài toán thực tế" },
      { module: "Hình học", topic: "Vectơ, tọa độ trong mặt phẳng", duration: "6 buổi", skills: "Chứng minh hình, tọa độ hóa" },
      { module: "Tổ hợp & Xác suất", topic: "Quy tắc đếm, biến cố", duration: "4 buổi", skills: "Tư duy tổ hợp, xác suất cơ bản" },
      { module: "Ôn tập & Đề", topic: "Đề tổng hợp", duration: "8 buổi", skills: "Kỹ năng làm đề, quản lý thời gian" },
    ],
    faq: [
      { q: "Có lớp thử không?", a: "Có. Đăng ký tư vấn để xếp lớp phù hợp năng lực." },
    ],
  },
  lop11: {
    slug: "lop11",
    badge: "Chương trình VN",
    banner: { image: "../assets/img/hero3.jpg" },
    title: "Toán Lớp 11 Nâng Cao",
    subtitle: "Chuẩn bị kiến thức nền tảng vững cho lớp 11 và trước ngưỡng 12.",
    level: "Lớp 11",
    format: "Offline/Online",
    duration: "24 buổi",
    price: "1.900.000đ / tháng",
    schedule: "2 buổi/tuần, 90 phút/buổi",
    capacity: "10–16 học viên",
    teacher: "GV Toán THPT",
    highlights: ["Chuyên đề hàm số nâng cao", "Dãy số, quy nạp, tổ hợp"],
    outcomes: ["Nâng cao tư duy, sẵn sàng cho lớp 12"],
    requirements: ["Kiến thức lớp 10 ổn"],
    program: [
      { module: "Hàm số & Giới hạn", topic: "Giới hạn, đạo hàm cơ bản", duration: "8 buổi", skills: "Khai triển, kỹ thuật đạo hàm" },
      { module: "Tổ hợp", topic: "Chỉnh hợp, tổ hợp", duration: "6 buổi", skills: "Đếm và áp dụng" },
      { module: "Ôn tập", topic: "Đề tổng hợp", duration: "10 buổi", skills: "Kỹ năng làm đề" },
    ],
    faq: [ { q: "Có lớp thử không?", a: "Có." } ],
  },
  lop12: {
    slug: "lop12",
    badge: "Chương trình VN",
    banner: { image: "../assets/img/hero4.jpg" },
    title: "Toán Lớp 12 Luyện Thi",
    subtitle: "Tăng tốc ôn thi cuối cấp và đại học.",
    level: "Lớp 12",
    format: "Offline/Online",
    duration: "30 buổi",
    price: "2.200.000đ / tháng",
    schedule: "3 buổi/tuần, 90 phút/buổi",
    capacity: "10–16 học viên",
    teacher: "GV luyện thi",
    highlights: ["Đề mô phỏng", "Chấm chữa chi tiết"],
    outcomes: ["Tối ưu điểm thi"],
    requirements: ["Kiến thức 10-11 vững"],
    program: [
      { module: "Ôn tập tổng hợp", topic: "Đề theo chuyên đề", duration: "20 buổi", skills: "Tư duy giải nhanh" },
      { module: "Đề thi thử", topic: "Full test", duration: "10 buổi", skills: "Quản lý thời gian" },
    ],
    faq: [ { q: "Có hỗ trợ bài riêng?", a: "Có, slot kèm theo lịch GV." } ],
  },
  ib: {
    slug: "ib",
    badge: "IB Track",
    banner: { image: "../assets/img/hero5.jpg" },
    title: "IB Mathematics (AA/AI)",
    subtitle: "Ôn luyện sát mục tiêu IB với phương pháp rõ ràng.",
    level: "IB",
    format: "Online/Offline",
    duration: "24–36 buổi",
    price: "3.600.000đ / tháng",
    schedule: "2 buổi/tuần",
    capacity: "8–12 học viên",
    teacher: "IB Experienced Teacher",
    highlights: ["Past papers", "IA guidance"],
    outcomes: ["Tối ưu điểm IB"],
    requirements: ["Placement test"],
    program: [
      { module: "AA Core", topic: "Functions, Calculus", duration: "10 buổi", skills: "Kỹ thuật giải tích" },
      { module: "AI Core", topic: "Statistics, Modelling", duration: "10 buổi", skills: "Mô hình hóa" },
    ],
    faq: [ { q: "Hỗ trợ IA?", a: "Có tư vấn định hướng." } ],
  },
  ap: {
    slug: "ap",
    badge: "AP Track",
    banner: { image: "../assets/img/hero6.jpg" },
    title: "AP Calculus (AB/BC)",
    subtitle: "Nắm chắc Calculus theo chuẩn AP.",
    level: "AP",
    format: "Online/Offline",
    duration: "24 buổi",
    price: "3.400.000đ / tháng",
    schedule: "2 buổi/tuần",
    capacity: "8–12 học viên",
    teacher: "AP Instructor",
    highlights: ["FRQ drills", "MCQ strategies"],
    outcomes: ["Score 4–5"],
    requirements: ["Algebra II"],
    program: [
      { module: "Limits & Derivatives", topic: "Core AB", duration: "10 buổi", skills: "Kỹ thuật đạo hàm" },
      { module: "Integrals", topic: "Core AB/BC", duration: "10 buổi", skills: "Tích phân" },
    ],
    faq: [ { q: "Có luyện đề?", a: "Có, bộ đề mới nhất." } ],
  },
  sat: {
    slug: "sat",
    badge: "SAT Track",
    banner: { image: "../assets/img/hero7.jpg" },
    title: "SAT Math Intensive",
    subtitle: "Kỹ thuật làm nhanh và chính xác phần Toán SAT.",
    level: "SAT",
    format: "Online/Offline",
    duration: "20 buổi",
    price: "3.000.000đ / tháng",
    schedule: "2 buổi/tuần",
    capacity: "8–12 học viên",
    teacher: "SAT Coach",
    highlights: ["Time management", "Trap recognition"],
    outcomes: ["700+"],
    requirements: ["Placement test"],
    program: [
      { module: "Algebra", topic: "Linear, Systems", duration: "6 buổi", skills: "Giải nhanh" },
      { module: "Advanced Topics", topic: "Passport to Advanced Math", duration: "8 buổi", skills: "Kỹ thuật đại số" },
    ],
    faq: [ { q: "Có mock test?", a: "Có, chấm và phân tích chi tiết." } ],
  },
};

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function renderList(listElId, items) {
  const ul = document.getElementById(listElId);
  if (!ul) return;
  ul.innerHTML = items.map(item => `<li>${item}</li>`).join("");
}

function renderProgram(tableId, rows) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = rows
    .map(r => `<tr><td>${r.module}</td><td>${r.topic}</td><td>${r.duration}</td><td>${r.skills}</td></tr>`) 
    .join("");
}

function renderFaq(containerId, items) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.innerHTML = items
    .map((it, idx) => `
      <div class="acc-item${idx === 0 ? " open" : ""}">
        <button class="acc-header" type="button">
          <span>${it.q}</span>
          <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="acc-body">${it.a}</div>
      </div>
    `)
    .join("");

  // Bind accordion
  wrap.querySelectorAll('.acc-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.acc-item');
      item.classList.toggle('open');
    });
  });
}

function bindTabs() {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const name = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const activePanel = document.getElementById(`tab-${name}`);
      if (activePanel) activePanel.classList.add('active');
    });
  });
}

function bootstrapCoursePage(course) {
  // Banner background
  const hero = document.querySelector('.course-hero');
  if (hero && course.banner && course.banner.image) {
    const overlay = course.banner.overlay || 'linear-gradient(180deg, rgba(2,6,23,.45), rgba(2,6,23,.15))';
    hero.style.backgroundImage = `${overlay}, url('${course.banner.image}')`;
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center';
  }

  if (course.badge) {
    setText('courseBadge', course.badge);
  }
  setText('courseTitle', course.title);
  setText('courseSubtitle', course.subtitle);
  setText('courseLevel', course.level);
  setText('courseFormat', course.format);
  setText('courseDuration', course.duration);
  setText('coursePrice', course.price);
  setText('courseSchedule', course.schedule);
  setText('courseCapacity', course.capacity);
  setText('courseTeacher', course.teacher);

  renderList('courseHighlights', course.highlights);
  renderList('courseOutcomes', course.outcomes);
  renderList('courseRequirements', course.requirements);
  renderProgram('programTable', course.program);
  renderFaq('faqList', course.faq);

  bindTabs();
}

document.addEventListener('DOMContentLoaded', () => {
  const url = new URL(location.href);
  const slug = (url.searchParams.get('course') || 'igcse').toLowerCase();
  const course = COURSE_CATALOG[slug] || COURSE_CATALOG.igcse;
  bootstrapCoursePage(course);

  // If URL has hash to program, activate Program tab
  if (location.hash && location.hash.toLowerCase() === '#chuongtrinh') {
    const programTab = document.querySelector('.tab[data-tab="program"]');
    if (programTab) programTab.click();
  }

  // Enable quick switching between IGCSE/IB/AP/SAT from inside course page
  // If the header submenu exists, links already point correctly via includePartials
  // Additionally, add in-page switcher via keyboard (Ctrl+ArrowLeft/Right)
  window.addEventListener('keydown', (e) => {
    if (!e.ctrlKey) return;
    const order = ['igcse','ib','ap','sat'];
    const i = order.indexOf(slug);
    if (i === -1) return;
    if (e.key === 'ArrowRight') {
      const next = order[(i + 1) % order.length];
      location.href = `khoahoc.html?course=${next}`;
    } else if (e.key === 'ArrowLeft') {
      const prev = order[(i - 1 + order.length) % order.length];
      location.href = `khoahoc.html?course=${prev}`;
    }
  });
});


