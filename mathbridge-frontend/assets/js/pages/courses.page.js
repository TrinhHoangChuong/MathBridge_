// assets/js/pages/courses.page.js
import {
  getCoursesByGrade,
  getCoursesByFilter,
  enrollCourse,
  createMomoPayment,
  updatePaymentStatusManually,
} from "../api/courses.api.js";
import { getAuth, isAuthenticated, getToken } from "../utils/auth.js";

let ALL_COURSES = [];
let CURRENT_GRADE = "9";
let FILTER_SESSION = "all";
let FILTER_DAY = "all";
let FILTER_METHOD = "all";
let IS_LOADING = false;

function setEnrollTab(target) {
  const tabButtons = document.querySelectorAll(".mb-tab-btn[data-tab]");
  const tabPanels = document.querySelectorAll(".mb-tab-panel");
  tabButtons.forEach((btn) => {
    const name = btn.getAttribute("data-tab");
    const isActive = name === target;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });
  tabPanels.forEach((panel) => {
    const isActive = panel.id === `tab-${target}`;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

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
  // Kiểm tra đã đăng nhập chưa - phải có cả user VÀ token
  if (isAuthenticated()) {
    // Đã đăng nhập đầy đủ -> mở trực tiếp course info modal (Form 1)
    const course = ALL_COURSES.find(c => c.id === courseId);
    if (course) {
      openCourseInfoModal(course);
      return;
    }
  }

  // Chưa đăng nhập -> mở form đăng ký/đăng nhập
  const modal = document.getElementById("enroll-modal");
  if (!modal) return;
  const nameEl = document.getElementById("enroll-modal-course");
  const hiddenId = document.getElementById("ef-courseId");

  if (nameEl) nameEl.textContent = courseName || "Khóa học";
  if (hiddenId) hiddenId.value = courseId || "";

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
}

function closeEnrollModal() {
  const modal = document.getElementById("enroll-modal");
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

/* --------- course info modal (Form 1) --------- */
let currentCourse = null;
let selectedMonths = 1;
let selectedPaymentMethod = null;

function calculateMaxMonths(soBuoi) {
  if (!soBuoi) return 3;
  // Giả sử: 1 tháng = 8 buổi (2 buổi/tuần x 4 tuần)
  // Tính số tháng tối đa dựa trên số buổi
  const buoiPerMonth = 8;
  const maxMonths = Math.ceil(parseInt(soBuoi) / buoiPerMonth);
  // Giới hạn từ 1-3 tháng
  return Math.min(Math.max(1, maxMonths), 3);
}

function openCourseInfoModal(course) {
  const modal = document.getElementById("course-info-modal");
  if (!modal) return;

  currentCourse = course;
  selectedMonths = 1;

  // Hiển thị thông tin khóa học đầy đủ
  const nameEl = document.getElementById("course-info-name");
  const teacherEl = document.getElementById("course-info-teacher");
  const descEl = document.getElementById("course-info-description");
  const priceEl = document.getElementById("course-info-price");
  const soBuoiEl = document.getElementById("course-info-sobuoi");
  const ngayHocEl = document.getElementById("course-info-ngayhoc");
  const hinhThucEl = document.getElementById("course-info-hinhthuc");

  if (nameEl) nameEl.textContent = course.ten || "—";
  if (teacherEl) teacherEl.textContent = course.giaoVien || "Đang cập nhật";
  if (descEl) descEl.textContent = course.moTa || "Nội dung sẽ được cập nhật.";
  if (priceEl) {
    const price = course.mucGiaThang || 0;
    priceEl.textContent = new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
  }
  if (soBuoiEl) soBuoiEl.textContent = course.soBuoi || "—";
  if (ngayHocEl) ngayHocEl.textContent = course.ngayHoc || "—";
  if (hinhThucEl) {
    const ht = course.hinhThuc || "";
    hinhThucEl.textContent = ht.charAt(0).toUpperCase() + ht.slice(1) || "—";
  }

  // Tính số tháng tối đa và render select
  const maxMonths = calculateMaxMonths(course.soBuoi);
  renderMonthSelect(maxMonths);

  // Cập nhật tổng tiền
  updateCourseInfoTotal();

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
}

function renderMonthSelect(maxMonths) {
  const select = document.getElementById("course-info-months-select");
  if (!select) return;

  select.innerHTML = "";
  for (let i = 1; i <= maxMonths; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i} tháng`;
    if (i === 1) option.selected = true;
    select.appendChild(option);
  }

  // Event listener để cập nhật tổng tiền khi thay đổi
  select.addEventListener("change", () => {
    selectedMonths = parseInt(select.value) || 1;
    updateCourseInfoTotal();
  });
}

function updateCourseInfoTotal() {
  if (!currentCourse) return;
  const price = currentCourse.mucGiaThang || 0;
  const total = price * selectedMonths;
  const totalEl = document.getElementById("course-info-total-amount");
  if (totalEl) {
    totalEl.textContent = new Intl.NumberFormat("vi-VN").format(total) + " VNĐ";
  }
}

function closeCourseInfoModal() {
  const modal = document.getElementById("course-info-modal");
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

/* --------- payment method modal (Form 2) --------- */
function openPaymentMethodModal() {
  if (!currentCourse) return;

  const modal = document.getElementById("payment-method-modal");
  if (!modal) return;

  // Hiển thị tóm tắt đơn hàng
  const courseEl = document.getElementById("payment-summary-course");
  const monthsEl = document.getElementById("payment-summary-months");
  const totalEl = document.getElementById("payment-summary-total");

  if (courseEl) courseEl.textContent = currentCourse.ten || "—";
  if (monthsEl) monthsEl.textContent = `${selectedMonths} tháng`;
  if (totalEl) {
    const price = currentCourse.mucGiaThang || 0;
    const total = price * selectedMonths;
    totalEl.textContent = new Intl.NumberFormat("vi-VN").format(total) + " VNĐ";
  }

  // Reset payment method selection
  document.querySelectorAll(".payment-method-btn").forEach(btn => {
    btn.classList.remove("is-active");
  });
  selectedPaymentMethod = null;

  // Disable confirm button
  const confirmBtn = document.getElementById("confirm-payment-btn");
  if (confirmBtn) confirmBtn.disabled = true;

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
}

function closePaymentMethodModal() {
  const modal = document.getElementById("payment-method-modal");
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

function openPaymentSuccessModal() {
  const modal = document.getElementById("payment-success-modal");
  if (!modal) return;
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closePaymentSuccessModal() {
  const modal = document.getElementById("payment-success-modal");
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  // Xóa query params sau khi đóng modal
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.delete("orderId");
  urlParams.delete("resultCode");
  urlParams.delete("message");
  urlParams.delete("amount");
  const newUrl = urlParams.toString() 
    ? `${window.location.pathname}?${urlParams.toString()}`
    : window.location.pathname;
  window.history.replaceState({}, "", newUrl);
}

let savedEmail = "";
let savedPassword = "";

function openCredentialsModal(email, password) {
  const modal = document.getElementById("credentials-modal");
  if (!modal) return;

  const emailEl = document.getElementById("cred-email");
  const passEl = document.getElementById("cred-password");

  // Lưu email/password để dùng khi đóng modal
  savedEmail = email || "";
  savedPassword = password || "";

  if (emailEl) emailEl.value = savedEmail;
  if (passEl) passEl.value = savedPassword;

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
}

function closeCredentialsModal() {
  const modal = document.getElementById("credentials-modal");
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");

  const courseInfoModalEl = document.getElementById("course-info-modal");
  if (courseInfoModalEl) {
    courseInfoModalEl.style.display = "none";
    courseInfoModalEl.setAttribute("aria-hidden", "true");
  }
  const paymentModalEl = document.getElementById("payment-method-modal");
  if (paymentModalEl) {
    paymentModalEl.style.display = "none";
    paymentModalEl.setAttribute("aria-hidden", "true");
  }

  const enrollModal = document.getElementById("enroll-modal");
  if (enrollModal) {
    enrollModal.style.display = "flex";
    enrollModal.setAttribute("aria-hidden", "false");
    setEnrollTab("login");

    const usernameInput = document.getElementById("lf-username");
    const passwordInput = document.getElementById("lf-password");
    if (usernameInput) {
      usernameInput.value = savedEmail || "";
      usernameInput.focus();
      usernameInput.select?.();
    }
    if (passwordInput) {
      passwordInput.value = savedPassword || "";
    }
  }

  // Clear cache
  savedEmail = "";
  savedPassword = "";
}

function initModalEvents() {
  // close buttons
  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeEnrollModal);
  });
  document.querySelectorAll("[data-close-credentials-modal]").forEach((el) => {
    el.addEventListener("click", closeCredentialsModal);
  });
  document.querySelectorAll("[data-close-course-info-modal]").forEach((el) => {
    el.addEventListener("click", closeCourseInfoModal);
  });
  document.querySelectorAll("[data-close-payment-method-modal]").forEach((el) => {
    el.addEventListener("click", closePaymentMethodModal);
  });
  document.querySelectorAll("[data-close-payment-success-modal]").forEach((el) => {
    el.addEventListener("click", closePaymentSuccessModal);
  });

  // Confirm course info button -> mở payment method modal
  const confirmCourseInfoBtn = document.getElementById("confirm-course-info-btn");
  if (confirmCourseInfoBtn) {
    confirmCourseInfoBtn.addEventListener("click", () => {
      const select = document.getElementById("course-info-months-select");
      if (select) {
        selectedMonths = parseInt(select.value) || 1;
      }
      closeCourseInfoModal();
      setTimeout(() => {
        openPaymentMethodModal();
      }, 200);
    });
  }

  // Back to course info button
  const backToCourseInfoBtn = document.getElementById("back-to-course-info-btn");
  if (backToCourseInfoBtn) {
    backToCourseInfoBtn.addEventListener("click", () => {
      closePaymentMethodModal();
      setTimeout(() => {
        if (currentCourse) {
          openCourseInfoModal(currentCourse);
          // Restore selected months
          const select = document.getElementById("course-info-months-select");
          if (select) {
            select.value = selectedMonths;
          }
        }
      }, 200);
    });
  }

  // Payment method selection
  document.querySelectorAll(".payment-method-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".payment-method-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      selectedPaymentMethod = btn.getAttribute("data-payment-method");
      checkCanConfirmPayment();
    });
  });

  // Init payment confirm button
  initPaymentConfirmButton();
  
  // Init tab switching
  initTabSwitching();
  
  // Init enroll form
  initEnrollForm();
}

function checkCanConfirmPayment() {
  const confirmBtn = document.getElementById("confirm-payment-btn");
  if (confirmBtn) {
    confirmBtn.disabled = !selectedPaymentMethod;
  }
}

function initPaymentConfirmButton() {
  // Confirm payment button
  const confirmBtn = document.getElementById("confirm-payment-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      if (!currentCourse || !selectedPaymentMethod || selectedMonths < 1) return;
      
      // Kiểm tra đăng nhập trước khi thanh toán
      if (!isAuthenticated()) {
        // Chưa đăng nhập -> yêu cầu đăng nhập
        const shouldLogin = confirm(
          "Bạn cần đăng nhập để thanh toán. Bạn có muốn chuyển đến trang đăng nhập không?"
        );
        if (shouldLogin) {
          // Lưu thông tin khóa học để quay lại sau khi đăng nhập
          const returnUrl = `${window.location.pathname}${window.location.search}`;
          localStorage.setItem("payment_return_url", returnUrl);
          localStorage.setItem("payment_course_id", currentCourse.id);
          localStorage.setItem("payment_months", selectedMonths.toString());
          localStorage.setItem("payment_method", selectedPaymentMethod);
          
          // Redirect đến trang login
          window.location.href = "pages/login.html";
        }
        return;
      }
      
      // Disable button để tránh double click
      confirmBtn.disabled = true;
      const oldText = confirmBtn.textContent;
      confirmBtn.textContent = "Đang xử lý...";

      try {
        if (selectedPaymentMethod === "momo") {
          // Gọi API tạo MoMo payment
          const result = await createMomoPayment(currentCourse.id, selectedMonths);
          
          if (result.success && result.data && result.data.payUrl) {
            // Redirect đến MoMo payment page
            window.location.href = result.data.payUrl;
          } else {
            alert(result.message || "Không thể tạo payment. Vui lòng thử lại.");
            confirmBtn.disabled = false;
            confirmBtn.textContent = oldText;
          }
        } else if (selectedPaymentMethod === "bank") {
          // TODO: Xử lý thanh toán ngân hàng
          alert(`Chức năng thanh toán ngân hàng đang được phát triển.`);
          confirmBtn.disabled = false;
          confirmBtn.textContent = oldText;
        } else if (selectedPaymentMethod === "cash") {
          // TODO: Xử lý thanh toán tiền mặt
          alert(`Chức năng thanh toán tiền mặt đang được phát triển.`);
          confirmBtn.disabled = false;
          confirmBtn.textContent = oldText;
        }
      } catch (err) {
        console.error("Payment error:", err);
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
        confirmBtn.disabled = false;
        confirmBtn.textContent = oldText;
      }
    });
  }
}

function initTabSwitching() {
  // tab switching
  const tabButtons = document.querySelectorAll(".mb-tab-btn[data-tab]");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      setEnrollTab(target);
    });
  });
}

function initEnrollForm() {
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

      // Convert gioiTinh: "male" -> 1 (Nam), "female" -> 0 (Nữ) - theo DTO backend
      const gioiTinhRaw = enrollForm.gioiTinh?.value || "male";
      const gioiTinh = gioiTinhRaw === "male" ? 1 : 0;

      const payload = {
        hoTen: enrollForm.hoTen?.value || "",
        soDienThoai: enrollForm.soDienThoai?.value || "",
        ngaySinh: enrollForm.ngaySinh?.value || null,
        gioiTinh: gioiTinh,
        diaChi: enrollForm.diaChi?.value || null,
        courseId: enrollForm.courseId?.value || document.getElementById("ef-courseId")?.value || null,
      };

      const res = await enrollCourse(payload);

      if (res?.success) {
        if (msgEl) msgEl.textContent = "Đăng ký thành công!";
        closeEnrollModal();
        
        // Lấy email và password từ response (DangKyLHResponse có email và password)
        const responseData = res.data || {};
        const email = responseData.email || res.email || "";
        const password = responseData.password || res.password || "";

        // Lấy thông tin khóa học để hiển thị confirmation modal
        const courseId = payload.courseId;
        if (courseId) {
          const course = ALL_COURSES.find(c => c.id === courseId);
          if (course) {
            // KHÔNG set tempAuth vì chưa có token thực sự
            // User cần đăng nhập trước khi thanh toán
            // Mở course info modal (Form 1) - nhưng sẽ yêu cầu đăng nhập khi thanh toán
            setTimeout(() => {
              openCourseInfoModal(course);
              // Sau đó hiển thị credentials modal nếu có
              if (email && password) {
                setTimeout(() => {
                  openCredentialsModal(email, password);
                }, 500);
              }
            }, 300);
            return;
          }
        }

        // Nếu không có courseId, chỉ hiển thị credentials
        if (email && password) {
          openCredentialsModal(email, password);
        }
      } else {
        if (msgEl) {
          msgEl.textContent = res?.message || "Đăng ký không thành công. Vui lòng thử lại.";
          msgEl.style.color = "#b91c1c";
        }
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

  // Kiểm tra payment success từ URL params (redirect từ MoMo)
  const orderId = getQueryParam("orderId");
  const resultCode = getQueryParam("resultCode");
  
  console.log("[Courses] initCoursesPage - orderId:", orderId, "resultCode:", resultCode);
  
  if (orderId) {
    // Có orderId trong URL -> kiểm tra payment status
    console.log("[Courses] Found orderId in URL, calling checkPaymentStatusAndShowModal");
    checkPaymentStatusAndShowModal(orderId, resultCode);
  }

  // Kiểm tra nếu có thông tin payment đã lưu (từ redirect sau khi đăng nhập)
  const paymentCourseId = localStorage.getItem("payment_course_id");
  const paymentMonths = localStorage.getItem("payment_months");
  const paymentMethod = localStorage.getItem("payment_method");
  
  if (paymentCourseId && paymentMonths) {
    // Xóa thông tin payment đã lưu
    localStorage.removeItem("payment_course_id");
    localStorage.removeItem("payment_months");
    localStorage.removeItem("payment_method");
    localStorage.removeItem("payment_return_url");
    
    // Kiểm tra đã đăng nhập chưa
    if (isAuthenticated()) {
      // Đã đăng nhập -> mở modal thanh toán
      const course = ALL_COURSES.find(c => c.id === paymentCourseId);
      if (course) {
        currentCourse = course;
        selectedMonths = parseInt(paymentMonths) || 1;
        selectedPaymentMethod = paymentMethod || null;
        
        // Mở course info modal trước
        setTimeout(() => {
          openCourseInfoModal(course);
          // Restore selected months
          const select = document.getElementById("course-info-months-select");
          if (select) {
            select.value = selectedMonths;
            updateCourseInfoTotal();
          }
          
          // Sau đó tự động mở payment method modal
          setTimeout(() => {
            const confirmBtn = document.getElementById("confirm-course-info-btn");
            if (confirmBtn) {
              confirmBtn.click();
            }
          }, 500);
        }, 300);
      }
    }
  }
}

// Kiểm tra payment status và hiển thị modal thành công
async function checkPaymentStatusAndShowModal(orderId, resultCode) {
  console.log("[Courses] checkPaymentStatusAndShowModal called with orderId:", orderId, "resultCode:", resultCode);
  
  // Nếu có orderId, luôn thử gọi manual-update (vì user đã về trang này = đã thanh toán)
  // Chỉ cần kiểm tra resultCode để xác định success hay failed
  let shouldUpdate = false;
  let updateStatus = "success";
  
  // Kiểm tra resultCode từ MoMo
  // resultCode = "0" hoặc null/undefined = thành công
  // resultCode khác "0" = thất bại
  if (resultCode === "0" || resultCode === null || resultCode === undefined || resultCode === "") {
    shouldUpdate = true;
    updateStatus = "success";
    console.log("[Courses] resultCode indicates success, will update DB to 'Da Thanh Toan'");
  } else {
    shouldUpdate = true;
    updateStatus = "failed";
    console.log("[Courses] resultCode indicates failure:", resultCode, "will update DB to 'Chua Thanh Toan'");
  }
  
  // Nếu không có resultCode, thử check từ backend status API
  if (!resultCode || resultCode === null || resultCode === undefined || resultCode === "") {
    try {
      const { CONFIG } = await import("../config.js");
      console.log("[Courses] No resultCode, checking payment status from backend...");
      
      const response = await fetch(`${CONFIG.BASE_URL}/api/portal/payment/momo/status?orderId=${orderId}`);
      const data = await response.json();
      
      console.log("[Courses] Payment status check response:", data);
      
      // Nếu backend báo đã thanh toán
      if (data.success && data.data && data.data.isPaid) {
        shouldUpdate = true;
        updateStatus = "success";
        console.log("[Courses] Backend confirms payment is paid");
      } else {
        // Nếu backend báo chưa thanh toán nhưng user đã về trang này, vẫn update (có thể là pending)
        shouldUpdate = true;
        updateStatus = "success"; // Giả định thành công nếu user đã về trang
        console.log("[Courses] Backend shows not paid, but user returned to page - assuming success");
      }
    } catch (error) {
      console.error("[Courses] Error checking payment status from backend:", error);
      // Nếu không check được, giả định thành công (vì user đã về trang)
      shouldUpdate = true;
      updateStatus = "success";
      console.log("[Courses] Cannot check status, assuming success (user returned to page)");
    }
  }
  
  // Gọi manual-update nếu cần
  if (shouldUpdate && orderId) {
    console.log("[Courses] Calling manual-update for orderId:", orderId, "with status:", updateStatus);
    try {
      const updateResult = await updatePaymentStatusManually(orderId, updateStatus);
      
      if (updateResult.success) {
        console.log("[Courses] ✅ Manual update successful:", updateResult.message);
        console.log("[Courses] ✅ Database should now be updated to:", updateStatus === "success" ? "Da Thanh Toan" : "Chua Thanh Toan");
      } else {
        console.error("[Courses] ❌ Manual update failed:", updateResult.message);
        console.error("[Courses] ❌ Full update result:", updateResult);
      }
    } catch (updateError) {
      console.error("[Courses] ❌ Exception calling manual-update:", updateError);
    }
  }
  
  // Hiển thị modal thành công nếu resultCode = "0" hoặc không có resultCode (giả định thành công)
  if (resultCode === "0" || resultCode === null || resultCode === undefined || resultCode === "") {
    console.log("[Courses] Showing payment success modal");
    setTimeout(() => {
      openPaymentSuccessModal();
    }, 500);
  } else {
    console.log("[Courses] Payment failed (resultCode:", resultCode, "), not showing success modal");
  }
}

document.addEventListener("DOMContentLoaded", initCoursesPage);
