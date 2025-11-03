// assets/js/pages/courses.page.js
import {
  getCoursesByGrade,
  getCoursesByFilter,
  enrollCourse,
} from "../api/courses.api.js";

let ALL_COURSES = [];
let CURRENT_GRADE = "9";
let FILTER_SESSION = "all";
let FILTER_DAY = "all";
let FILTER_METHOD = "all";
let IS_LOADING = false;

const GRADE_TEXT = {
  "9": {
    title: "Lớp 9",
    subtitle: "Chương trình toán học lớp 9 toàn diện",
    desc: "Chương trình lớp 9 xây dựng nền tảng vững chắc, hệ thống hóa kiến thức để vào 10. Có lớp ôn chuyên, lớp luyện đề.",
  },
  "10": {
    title: "Lớp 10",
    subtitle: "Toán 10 định hướng và củng cố",
    desc: "Củng cố hình, đại, hàm số – làm quen chủ đề nâng cao để chuyển mượt lên 11-12.",
  },
  "11": {
    title: "Lớp 11",
    subtitle: "Toán 11 chuyên sâu và ứng dụng",
    desc: "Tập trung các chủ đề quan trọng để chuyển lên 12 và thi THPT. Có lớp tăng tốc.",
  },
  "12": {
    title: "Lớp 12",
    subtitle: "Luyện thi THPT & Đại học",
    desc: "Chương trình luyện thi tối ưu: trọng tâm – đề thi minh họa – chữa đề – hỗ trợ cá nhân.",
  },
  adv: {
    title: "Toán nâng cao & Chứng chỉ",
    subtitle: "IGCSE, A-Level, IB, SAT Math",
    desc: "Các chương trình nâng cao / chứng chỉ quốc tế, linh hoạt hình thức học.",
  },
};

/* --------- tiện ích --------- */
function getQueryParam(name, defaultValue = null) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || defaultValue;
}

function setQueryParam(name, value) {
  const params = new URLSearchParams(window.location.search);
  if (value === null || value === undefined) {
    params.delete(name);
  } else {
    params.set(name, value);
  }
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);
}

function updateHeaderByGrade(grade) {
  const currentEl = document.getElementById("current-course");
  const titleEl = document.getElementById("course-title");
  const subtitleEl = document.getElementById("course-subtitle");
  const descEl = document.getElementById("course-description");

  const info =
    GRADE_TEXT[grade] || {
      title: `Chương trình lớp ${grade}`,
      subtitle: "Chương trình Toán dành cho cấp học này",
      desc: "Nội dung sẽ được cập nhật từ hệ thống MathBridge.",
    };

  if (currentEl) currentEl.textContent = info.title;
  if (titleEl) titleEl.textContent = info.title;
  if (subtitleEl) subtitleEl.textContent = info.subtitle;
  if (descEl) descEl.textContent = info.desc;
}

/* --------- filter logic --------- */
function courseMatchFilters(course) {
  // filter ca học
  if (FILTER_SESSION !== "all") {
    const ca = (course.caHoc || "").toString();
    if (!ca || ca !== FILTER_SESSION) return false;
  }

  // filter ngày học
  if (FILTER_DAY !== "all") {
    const ngay = (course.ngayHoc || "").toLowerCase();
    if (!ngay.includes(FILTER_DAY.toLowerCase())) return false;
  }

  // filter hình thức học
  if (FILTER_METHOD !== "all") {
    const ht = (course.hinhThuc || "").toLowerCase();
    if (!ht.includes(FILTER_METHOD.toLowerCase())) return false;
  }

  return true;
}

/* --------- render --------- */
function createCourseCardHTML(course) {
  const id = course.id || "";
  const name = course.ten || "Khóa học";
  const desc = course.moTa || "Nội dung sẽ được cập nhật.";
  const ngay = course.ngayHoc ? `Ngày học: ${course.ngayHoc}` : "Ngày học: linh hoạt";
  const ht = course.hinhThuc ? `Hình thức: ${course.hinhThuc}` : "Hình thức: linh hoạt";
  const gv = course.giaoVien ? `Giảng viên: ${course.giaoVien}` : "";
  const soBuoi = course.soBuoi ? `Số buổi: ${course.soBuoi}` : "";

  return `
    <article class="course-card">
      <div class="course-card__body">
        <h3 class="course-card__title">${name}</h3>
        <p class="course-card__desc">${desc}</p>
        <ul class="course-card__meta">
          <li>${ngay}</li>
          <li>${ht}</li>
          ${gv ? `<li>${gv}</li>` : ""}
          ${soBuoi ? `<li>${soBuoi}</li>` : ""}
        </ul>
      </div>
      <div class="course-card__actions">
        <button class="btn btn--primary" data-enroll-btn data-course-id="${id}" data-course-name="${name}">
          Đăng ký ngay
        </button>
      </div>
    </article>
  `;
}

function renderCourseList() {
  const listEl = document.querySelector("[data-course-list]");
  const emptyEl = document.querySelector("[data-course-empty]");
  const countEl = document.getElementById("course-count");

  if (!listEl) return;

  if (IS_LOADING) {
    listEl.innerHTML = `
      <article class="course-card">
        <p class="course-card__desc">Đang tải dữ liệu khóa học...</p>
      </article>
    `;
    if (countEl) countEl.textContent = "—";
    return;
  }

  const visible = ALL_COURSES.filter(courseMatchFilters);

  if (!visible.length) {
    listEl.innerHTML = "";
    if (emptyEl) emptyEl.classList.remove("hidden");
    if (countEl) countEl.textContent = "0";
    return;
  }

  listEl.innerHTML = visible.map(createCourseCardHTML).join("");
  if (emptyEl) emptyEl.classList.add("hidden");
  if (countEl) countEl.textContent = visible.length.toString();
}

/* --------- filters --------- */
function initFilters() {
  const sessionSel = document.getElementById("session-filter");
  const daySel = document.getElementById("day-filter");
  const methodSel = document.getElementById("method-filter");

  if (sessionSel) {
    sessionSel.addEventListener("change", () => {
      FILTER_SESSION = sessionSel.value;
      renderCourseList();
    });
  }

  if (daySel) {
    daySel.addEventListener("change", () => {
      FILTER_DAY = daySel.value;
      renderCourseList();
    });
  }

  if (methodSel) {
    methodSel.addEventListener("change", () => {
      FILTER_METHOD = methodSel.value;
      renderCourseList();
    });
  }
}

/* --------- modal enroll --------- */
function openEnrollModal(courseId, courseName) {
  const modal = document.getElementById("enroll-modal");
  if (!modal) return;
  const nameEl = document.getElementById("enroll-modal-course");
  const hiddenId = document.getElementById("ef-courseId");

  if (nameEl) nameEl.textContent = courseName || "Khóa học";
  if (hiddenId) hiddenId.value = courseId || "";

  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
}

function closeEnrollModal() {
  const modal = document.getElementById("enroll-modal");
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

function openCredentialsModal(email, password) {
  const modal = document.getElementById("credentials-modal");
  if (!modal) return;

  const emailEl = document.getElementById("cred-email");
  const passEl = document.getElementById("cred-password");

  if (emailEl) emailEl.value = email || "";
  if (passEl) passEl.value = password || "";

  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
}

function closeCredentialsModal() {
  const modal = document.getElementById("credentials-modal");
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

function initModalEvents() {
  // close buttons
  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeEnrollModal);
  });
  document.querySelectorAll("[data-close-credentials-modal]").forEach((el) => {
    el.addEventListener("click", closeCredentialsModal);
  });

  // tab switching
  const tabButtons = document.querySelectorAll(".mb-tab-btn[data-tab]");
  const tabPanels = document.querySelectorAll(".mb-tab-panel");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      tabButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      tabPanels.forEach((panel) => {
        if (panel.id === `tab-${target}`) {
          panel.classList.add("is-active");
        } else {
          panel.classList.remove("is-active");
        }
      });
    });
  });

  // submit form đăng ký
  const enrollForm = document.getElementById("enroll-form");
  if (enrollForm) {
    enrollForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msgEl = document.getElementById("enroll-form-message");
      if (msgEl) {
        msgEl.style.display = "block";
        msgEl.textContent = "Đang gửi đăng ký...";
      }

      const payload = {
        hoTen: enrollForm.hoTen?.value || "",
        soDienThoai: enrollForm.soDienThoai?.value || "",
        ngaySinh: enrollForm.ngaySinh?.value || "",
        gioiTinh: enrollForm.gioiTinh?.value || "",
        diaChi: enrollForm.diaChi?.value || "",
        courseId: enrollForm.courseId?.value || document.getElementById("ef-courseId")?.value || "",
      };

      const res = await enrollCourse(payload);

      if (res?.success) {
        if (msgEl) msgEl.textContent = "Đăng ký thành công!";
        closeEnrollModal();
        if (res.email || res.username || res.password) {
          openCredentialsModal(res.email || res.username, res.password || "");
        }
      } else {
        if (msgEl) msgEl.textContent = res?.message || "Đăng ký không thành công (BE chưa có endpoint?).";
      }
    });
  }

  // copy button trong modal credentials
  document.querySelectorAll(".cred-copy-btn[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-copy");
      const input =
        type === "email" ? document.getElementById("cred-email") : document.getElementById("cred-password");
      if (input && input.value) {
        navigator.clipboard?.writeText(input.value).catch(() => {});
        btn.textContent = "Đã copy";
        setTimeout(() => {
          btn.textContent = "Copy";
        }, 2000);
      }
    });
  });
}

/* --------- events trên list --------- */
function initCourseListEvents() {
  const listEl = document.querySelector("[data-course-list]");
  if (!listEl) return;

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-enroll-btn]");
    if (!btn) return;
    const courseId = btn.getAttribute("data-course-id");
    const courseName = btn.getAttribute("data-course-name");
    openEnrollModal(courseId, courseName);
  });
}

/* --------- grade switcher --------- */
function initGradeSwitcher() {
  const switcher = document.getElementById("grade-switcher");
  if (!switcher) return;
  switcher.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-grade]");
    if (!btn) return;
    const grade = btn.getAttribute("data-grade");
    if (!grade || grade === CURRENT_GRADE) return;
    CURRENT_GRADE = grade;

    // update UI
    switcher.querySelectorAll(".grade-chip").forEach((el) => el.classList.remove("is-active"));
    btn.classList.add("is-active");

    // update header
    updateHeaderByGrade(CURRENT_GRADE);
    setQueryParam("grade", CURRENT_GRADE);

    // load courses
    loadCourses();
  });
}

/* --------- init page --------- */
async function loadCourses() {
  IS_LOADING = true;
  renderCourseList();

  // chỉ gọi theo grade
  const courses = await getCoursesByGrade(CURRENT_GRADE);
  ALL_COURSES = Array.isArray(courses) ? courses : [];
  IS_LOADING = false;
  renderCourseList();
}

export async function initCoursesPage() {
  CURRENT_GRADE = getQueryParam("grade", "9");
  updateHeaderByGrade(CURRENT_GRADE);

  // active chip nếu có grade trên URL
  const switcher = document.getElementById("grade-switcher");
  if (switcher) {
    switcher.querySelectorAll(".grade-chip").forEach((el) => {
      const grade = el.getAttribute("data-grade");
      if (grade === CURRENT_GRADE) {
        el.classList.add("is-active");
      } else {
        el.classList.remove("is-active");
      }
    });
  }

  initFilters();
  initModalEvents();
  initCourseListEvents();
  initGradeSwitcher();

  await loadCourses();
}

document.addEventListener("DOMContentLoaded", initCoursesPage);
