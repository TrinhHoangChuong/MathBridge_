// assets/js/pages/TeacherDetailClass.page.js
//
// Trang chi tiết giáo viên:
// - Đọc ?id=... từ URL
// - Gọi 2 API: getTeacherById + getClassesByTeacherId
// - Đổ hero (tên, chuyên môn, kinh nghiệm)
// - Đổ thống kê + danh sách lớp
// - ⚠️ Lọc FE: "Tất cả" + các giá trị hinhThucHoc thực tế từ BE
//   (không hard-code ONLINE/OFFLINE nữa)

import { getTeacherById, getClassesByTeacherId } from "../api/teacher-detail.api.js";

// ====== utils ======
function getQueryParam(key) {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
}

function makeInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] || "")
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function normalizeTeacherName(teacherObj, fallbackFromQuery) {
  if (!teacherObj) return fallbackFromQuery || "Giảng viên MathBridge";

  const { ho, tenDem, ten, hoTen } = teacherObj;

  if (hoTen) return hoTen;

  const parts = [];
  if (ho) parts.push(ho);
  if (tenDem) parts.push(tenDem);
  if (ten) parts.push(ten);

  if (parts.length > 0) return parts.join(" ");
  return fallbackFromQuery || "Giảng viên MathBridge";
}

function deriveGlobalStatus(classes = []) {
  if (!classes.length) return { text: "Chưa có lớp", color: "muted" };

  const openClasses = classes.filter((c) =>
    (c.trangThai || "").toLowerCase().includes("đang")
  );

  if (openClasses.length === classes.length) {
    return { text: "Đang nhận học viên", color: "green" };
  }
  if (openClasses.length > 0) {
    return { text: "Một số lớp còn chỗ", color: "amber" };
  }
  return { text: "Tạm ngưng nhận thêm", color: "red" };
}

// ====== render hero ======
function renderHero(teacher, totalClasses) {
  const nameFromQuery = getQueryParam("name") || "";
  const name = normalizeTeacherName(teacher, nameFromQuery);
  const chuyenMon = teacher?.chuyenMon || "Toán THCS/THPT · Chuyên sâu quốc tế";
  const kinhNghiem = teacher?.kinhNghiem != null ? `${teacher.kinhNghiem}+ năm kinh nghiệm` : "";

  const nameEl = document.querySelector("[data-teacher-name]");
  const avatarEl = document.querySelector("[data-teacher-avatar]");
  const metaEl = document.querySelector("[data-teacher-meta]");
  const totalEl = document.querySelector("[data-class-total]");

  if (nameEl) nameEl.textContent = name;
  if (avatarEl) avatarEl.textContent = makeInitials(name);
  if (metaEl) {
    metaEl.textContent = kinhNghiem ? `${chuyenMon} · ${kinhNghiem}` : chuyenMon;
  }
  if (totalEl) totalEl.textContent = totalClasses.toString();
}

function renderGlobalStatus(classes) {
  const pillEl = document.querySelector("[data-global-status]");
  if (!pillEl) return;

  const st = deriveGlobalStatus(classes);
  pillEl.textContent = st.text;
  pillEl.classList.remove("is-green", "is-amber", "is-red");
  if (st.color === "green") pillEl.classList.add("is-green");
  if (st.color === "amber") pillEl.classList.add("is-amber");
  if (st.color === "red") pillEl.classList.add("is-red");
}

// ====== render side chips (mạnh về lớp nào) ======
function renderStrengths(classes) {
  const box = document.querySelector("[data-strength-list]");
  if (!box) return;

  box.innerHTML = "";

  if (!classes.length) {
    box.innerHTML = `<li><span class="dot"></span>Chưa có lớp đồng bộ</li>`;
    return;
  }

  const buckets = {
    igcse: 0,
    lop9: 0,
    lop10: 0,
    lop11: 0,
    lop12: 0,
    drill: 0,
  };

  classes.forEach((c) => {
    const title = (c.tenLop || "").toLowerCase();
    if (title.includes("igcse") || title.includes("ib") || title.includes("sat")) buckets.igcse++;
    if (title.includes("lớp 9") || title.includes("lop 9")) buckets.lop9++;
    if (title.includes("lớp 10") || title.includes("lop 10")) buckets.lop10++;
    if (title.includes("lớp 11") || title.includes("lop 11")) buckets.lop11++;
    if (title.includes("lớp 12") || title.includes("lop 12")) buckets.lop12++;
    if (title.includes("drill") || title.includes("mock")) buckets.drill++;
  });

  const pills = [];
  if (buckets.igcse) pills.push(`IGCSE / quốc tế · ${buckets.igcse}`);
  if (buckets.lop9) pills.push(`Lớp 9 · ${buckets.lop9}`);
  if (buckets.lop10) pills.push(`Lớp 10 · ${buckets.lop10}`);
  if (buckets.lop11) pills.push(`Lớp 11 · ${buckets.lop11}`);
  if (buckets.lop12) pills.push(`Lớp 12 · ${buckets.lop12}`);
  if (buckets.drill) pills.push(`Drills & Mock · ${buckets.drill}`);

  if (!pills.length) {
    box.innerHTML = `<li><span class="dot"></span>Toán THCS/THPT · ${classes.length}</li>`;
    return;
  }

  pills.forEach((txt) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="dot"></span>${txt}`;
    box.appendChild(li);
  });
}

// ====== render class list ======
function createClassCard(c) {
  const tenLop = c.tenLop || "Lớp học";
  const loaiNgay = c.loaiNgay || "";
  const soBuoi = c.soBuoi || "";
  const lich = [loaiNgay, soBuoi ? `${soBuoi} buổi` : ""].filter(Boolean).join(" • ");
  const hinhThuc = c.hinhThucHoc || "Khác";
  const ngay = c.ngayBatDau
    ? new Date(c.ngayBatDau).toLocaleDateString("vi-VN")
    : "Đang cập nhật";
  const hocPhi =
    c.mucGiaThang != null
      ? new Intl.NumberFormat("vi-VN").format(c.mucGiaThang) + " đ/tháng"
      : "Đang cập nhật";
  const moTa = c.moTa || "Chương trình theo chuẩn trung tâm.";
  const trangThai = c.trangThai || "Đang mở";

  const wrap = document.createElement("article");
  wrap.className = "td-class-card";
  wrap.dataset.mode = normalizeMode(hinhThuc); // để filter

  wrap.innerHTML = `
    <div class="td-class-card__head">
      <h3 class="td-class-title">${tenLop}</h3>
      <span class="td-badge">${trangThai}</span>
    </div>
    <div class="td-class-card__body">
      <p class="td-row"><strong>Lịch:</strong> ${lich || "Đang cập nhật"}</p>
      <p class="td-row"><strong>Hình thức:</strong> ${hinhThuc}</p>
      <p class="td-row"><strong>Ngày bắt đầu:</strong> ${ngay}</p>
      <p class="td-row"><strong>Học phí:</strong> ${hocPhi}</p>
      <p class="td-class-desc">${moTa}</p>
    </div>
    <div class="td-class-card__footer">
      <a class="td-enroll-btn" href="pages/contact.html">
        <i class="ph-pencil-line"></i>
        Đăng ký lớp này
      </a>
    </div>
  `;

  return wrap;
}

function renderClassList(list) {
  const box = document.querySelector("[data-class-list]");
  const empty = document.querySelector("[data-empty-state]");
  if (!box) return;

  if (!list.length) {
    box.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    return;
  }

  const frag = document.createDocumentFragment();
  list.forEach((c) => frag.appendChild(createClassCard(c)));
  box.innerHTML = "";
  box.appendChild(frag);
  if (empty) empty.classList.add("hidden");
}

// ====== FILTER THEO HINHTHUCHOC ======

// chuẩn hoá chuỗi hinhThucHoc thành key để so sánh
function normalizeMode(raw = "") {
  const s = raw.trim().toLowerCase();

  // map 1 số trường hợp hay gặp trong VN
  if (s === "online" || s === "trực tuyến" || s === "truc tuyen" || s === "zoom") {
    return "online";
  }
  if (
    s === "offline" ||
    s === "tại trung tâm" ||
    s === "tai trung tam" ||
    s === "trung tâm" ||
    s === "trung tam"
  ) {
    return "offline";
  }

  // để nguyên
  return s || "khac";
}

// để hiển thị đẹp trên nút lọc
function prettyModeLabel(raw = "") {
  const s = raw.trim().toLowerCase();
  if (s === "online" || s === "trực tuyến" || s === "truc tuyen" || s === "zoom") {
    return "Online";
  }
  if (
    s === "offline" ||
    s === "tại trung tâm" ||
    s === "tai trung tam" ||
    s === "trung tâm" ||
    s === "trung tam"
  ) {
    return "Offline";
  }
  if (!s) return "Khác";
  // capitalize nhẹ
  return raw;
}

// tạo list filter từ dữ liệu thực tế
function buildFiltersFromClasses(classes = []) {
  const filters = [
    {
      key: "all",
      label: "Tất cả",
      active: true,
    },
  ];

  const seen = new Set();

  classes.forEach((c) => {
    const raw = c.hinhThucHoc || "";
    const key = normalizeMode(raw);
    if (!seen.has(key)) {
      seen.add(key);
      filters.push({
        key,
        label: prettyModeLabel(raw),
        active: false,
      });
    }
  });

  return filters;
}

// render lại dãy nút filter trong header theo list trên
function renderFiltersUI(filters) {
  const box = document.querySelector(".td-filters");
  if (!box) return;

  box.innerHTML = "";

  filters.forEach((f) => {
    const btn = document.createElement("button");
    btn.className = "td-filter" + (f.active ? " is-active" : "");
    btn.dataset.filter = f.key;
    btn.textContent = f.label;
    box.appendChild(btn);
  });
}

// áp dụng filter
function filterClasses(allClasses, key) {
  if (key === "all") return allClasses;
  return allClasses.filter((c) => normalizeMode(c.hinhThucHoc || "") === key);
}

// gắn sự kiện cho nút filter
function initFilters(allClasses) {
  const filters = buildFiltersFromClasses(allClasses);
  renderFiltersUI(filters);

  const box = document.querySelector(".td-filters");
  if (!box) return;

  box.addEventListener("click", (e) => {
    const btn = e.target.closest(".td-filter");
    if (!btn) return;

    const key = btn.dataset.filter || "all";

    // toggle UI
    box.querySelectorAll(".td-filter").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    // filter và render lại
    const filtered = filterClasses(allClasses, key);
    renderClassList(filtered);
  });
}

// ====== init ======
document.addEventListener("DOMContentLoaded", async () => {
  const teacherId = getQueryParam("id");
  const statusMsg = document.querySelector("[data-status-msg]");
  const errorMsg = document.querySelector("[data-error-msg]");

  if (!teacherId) {
    if (errorMsg) {
      errorMsg.textContent = "Không tìm được mã giáo viên (?id=...).";
      errorMsg.classList.remove("hidden");
    }
    return;
  }

  if (statusMsg) {
    statusMsg.textContent = "Đang tải dữ liệu giáo viên…";
    statusMsg.classList.remove("hidden");
  }

  // gọi song song
  const [teacher, classes] = await Promise.all([
    getTeacherById(teacherId),
    getClassesByTeacherId(teacherId),
  ]);

  if (statusMsg) statusMsg.classList.add("hidden");

  // render hero
  renderHero(teacher, classes.length);
  renderGlobalStatus(classes);
  renderStrengths(classes);
  renderClassList(classes);

  initFilters(classes);
});
