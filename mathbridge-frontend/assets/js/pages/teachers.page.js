// assets/js/pages/teachers.page.js
//
// Chức năng:
// - Fetch danh sách giảng viên từ API public
// - Lọc theo chip (lớp 9,10,11,12, "adv")
// - Tìm kiếm theo tên
// - Render card có avatar initials + CTA "Đăng ký lớp học"
//
// YÊU CẦU kèm theo:
// - File này load bằng <script type="module"> trong teacher.html
// - teacher.api.js import CONFIG, nên không cần import config trực tiếp ở đây

import { getTeachersFromApi } from "../api/teacher.api.js";

let allTeachers = [];
let activeFilter = "all"; // "all" | "9" | "10" | "11" | "12" | "adv"
let searchQuery = "";

/* Utilities -------------------------------------------------- */

// Tạo chữ initials từ tên: "Trần Quang Huy" -> "TQH"
function getInitials(fullName = "") {
  return fullName
    .trim()
    .split(/\s+/)
    .map(part => part[0] || "")
    .join("")
    .slice(0,3) // giới hạn 3 ký tự
    .toUpperCase();
}

// Hash nhẹ -> số -> dùng để tạo màu HSL ổn định cho mỗi tên
function hashStringToNumber(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Trả về 1 màu HSL mềm dựa trên tên, để avatar khác nhau
function getColorForName(name = "") {
  const hash = hashStringToNumber(name);
  const hue = hash % 360; // 0..359
  // pastel-ish: saturation thấp hơn, lightness cao
  return `hsl(${hue} 70% 45%)`;
}

function expText(years) {
  if (years == null) return "Kinh nghiệm: đang cập nhật";
  return `${years}+ năm kinh nghiệm`;
}

/* Lọc ------------------------------------------------------- */

function teacherMatchesFilter(teacher, filterKey) {
  if (filterKey === "all") return true;

  const spec = (teacher.chuyenMon || "").toLowerCase();

  if (filterKey === "9")  return /lớp\s*9\b/.test(spec);
  if (filterKey === "10") return /lớp\s*10\b/.test(spec);
  if (filterKey === "11") return /lớp\s*11\b/.test(spec);
  if (filterKey === "12") return /lớp\s*12\b/.test(spec);

  if (filterKey === "adv") {
    return (
      spec.includes("nâng cao") ||
      spec.includes("igcse") ||
      spec.includes("ib ") || spec.includes(" ib") || spec.includes("ib math") ||
      spec.includes("ap ") || spec.includes(" ap") || spec.includes("ap calculus") ||
      spec.includes("sat")
    );
  }

  return true;
}

function teacherMatchesSearch(teacher, query) {
  if (!query) return true;
  const name = (teacher.hoTen || "").toLowerCase();
  return name.includes(query.toLowerCase());
}

/* Render ---------------------------------------------------- */

function escapeHTML(str) {
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");
}

// Tạo HTML cho card giáo viên với avatar + CTA
function createTeacherCardHTML(teacher) {
  const hoTen = teacher.hoTen || "Giảng viên";
  const chuyenMon = teacher.chuyenMon || "Chuyên môn đang cập nhật";
  const kn = expText(teacher.kinhNghiem);

  // avatar
  const initials = getInitials(hoTen);
  const avatarColor = getColorForName(hoTen);

  // CTA link (tạm encode tên, sau này chuyển sang idNv)
  const detailUrl = `pages/TeacherDetailClass.html?teacher=${encodeURIComponent(hoTen)}`;

  return `
    <article class="teacher-card" role="listitem" tabindex="0">
      <div class="teacher-card__top">
        <div class="teacher-card__avatar" style="background:${avatarColor}">
          ${escapeHTML(initials)}
        </div>

        <div class="teacher-card__body">
          <h3 class="teacher-card__name">${escapeHTML(hoTen)}</h3>
          <p class="teacher-card__spec">${escapeHTML(chuyenMon)}</p>
          <p class="teacher-card__exp">${escapeHTML(kn)}</p>
        </div>
      </div>

      <div class="teacher-card__footer">
        <a class="teacher-card__ctaBtn" href="${detailUrl}">
          <i class="ph-pencil-line" aria-hidden="true"></i>
          <span>Đăng ký lớp học</span>
        </a>
      </div>
    </article>
  `;
}

function renderTeachers() {
  const listEl   = document.querySelector("[data-teacher-list]");
  const countEl  = document.getElementById("teacherCount");
  const emptyEl  = document.querySelector("[data-empty-state]");
  if (!listEl) return;

  const visible = allTeachers.filter(t => {
    return teacherMatchesFilter(t, activeFilter) &&
           teacherMatchesSearch(t, searchQuery);
  });

  if (visible.length === 0) {
    listEl.innerHTML = "";
    if (emptyEl) emptyEl.classList.remove("hidden");
    if (countEl) countEl.textContent = "0";
    return;
  }

  const html = visible.map(createTeacherCardHTML).join("");
  listEl.innerHTML = html;

  if (emptyEl) emptyEl.classList.add("hidden");
  if (countEl) countEl.textContent = String(visible.length);
}

/* Loading / Error UI --------------------------------------- */

function showLoadingSkeleton() {
  const listEl   = document.querySelector("[data-teacher-list]");
  const statusEl = document.querySelector("[data-teacher-status]");
  const emptyEl  = document.querySelector("[data-empty-state]");

  if (statusEl) {
    statusEl.textContent = "Đang tải danh sách giảng viên...";
    statusEl.classList.remove("hidden");
  }

  if (listEl) {
    listEl.innerHTML = `
      <div class="teacher-card teacher-card--skeleton"></div>
      <div class="teacher-card teacher-card--skeleton"></div>
      <div class="teacher-card teacher-card--skeleton"></div>
      <div class="teacher-card teacher-card--skeleton"></div>
    `;
  }

  if (emptyEl) emptyEl.classList.add("hidden");
}

function hideStatusMessage() {
  const statusEl = document.querySelector("[data-teacher-status]");
  if (statusEl) {
    statusEl.textContent = "";
    statusEl.classList.add("hidden");
  }
}

function showErrorState(msg) {
  const listEl   = document.querySelector("[data-teacher-list]");
  const statusEl = document.querySelector("[data-teacher-status]");
  const emptyEl  = document.querySelector("[data-empty-state]");
  const countEl  = document.getElementById("teacherCount");

  if (listEl) {
    listEl.innerHTML = `
      <div class="teacher-empty">
        Không tải được danh sách giảng viên.<br/>
        Vui lòng thử lại sau.
      </div>
    `;
  }

  if (statusEl) {
    statusEl.textContent = msg || "Lỗi tải dữ liệu";
    statusEl.classList.remove("hidden");
  }

  if (emptyEl) emptyEl.classList.add("hidden");
  if (countEl) countEl.textContent = "0";
}

/* Events ---------------------------------------------------- */

function initFilterChips() {
  const chipsWrap = document.getElementById("filterChips");
  if (!chipsWrap) return;

  chipsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    const newFilter = btn.getAttribute("data-filter");
    if (!newFilter) return;

    activeFilter = newFilter;

    // cập nhật aria-pressed
    chipsWrap.querySelectorAll(".chip").forEach(chip => {
      chip.setAttribute("aria-pressed", chip === btn ? "true" : "false");
    });

    renderTeachers();
  });
}

function initSearchBox() {
  const input = document.getElementById("teacher-search");
  if (!input) return;

  input.addEventListener("input", () => {
    searchQuery = input.value.trim();
    renderTeachers();
  });
}

/* Init ------------------------------------------------------ */

export async function initTeachersPage() {
  showLoadingSkeleton();

  const { teachers } = await getTeachersFromApi();

  if (!teachers) {
    showErrorState("API không trả dữ liệu teachers");
    return;
  }

  allTeachers = teachers;
  hideStatusMessage();

  renderTeachers();
  initFilterChips();
  initSearchBox();
}

document.addEventListener("DOMContentLoaded", initTeachersPage);
