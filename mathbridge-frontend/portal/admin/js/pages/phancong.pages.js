// portal/admin/js/pages/phancong.pages.js

import {
  apiSearchAdvisors,
  apiSearchStudentsForAdvisor,
  apiGetAdvisorAssignments,
  apiCreateAssignment,
  apiUpdateAssignment,
  apiEndAssignment,
} from "../api/phancong.api.js";

// ====== STATE ======
let advisors = []; // danh sách cố vấn (NhanVien)
let selectedAdvisorId = null;
let selectedAdvisor = null;

let availableStudents = []; // danh sách HS khả dụng
let assignments = []; // danh sách phân công cho cố vấn hiện tại

let currentAssignStudent = null; // HS đang mở modal gán / chỉnh sửa
let currentEditingAssignment = null; // phân công đang chỉnh sửa (nếu có)

// DOM refs
let panelEl;
let emptyStateEl;
let detailsEl;

// advisor DOM
let advisorListEl;
let advisorSearchInputEl;
let advisorFilterChucVuEl;
let advisorFilterStatusEl;

// tabs / counts
let tabAvailableBtnEl;
let tabAssignedBtnEl;
let tabAvailablePanelEl;
let tabAssignedPanelEl;
let countAvailableEl;
let countAssignedEl;

// students DOM
let studentListEl;
let studentSearchInputEl;
let studentFilterStatusEl;
let onlyWithoutAdvisorCheckboxEl;

// assignments DOM
let assignmentListEl;
let assignmentFilterStatusEl;

// modal DOM
let assignModalBackdropEl;
let assignModalCloseEl;
let assignModalCancelEl;
let assignModalTitleEl;
let assignModalSummaryEl;
let assignFormEl;
let inputNgayBatDauEl;
let inputNgayKetThucEl;
let inputTrangThaiEl;
let inputGhiChuEl;

// ====== UTILS ======

function showToast(message) {
  // Hook vào hệ thống toast global nếu có, tạm thời dùng alert
  alert(message);
}

function formatFullName(item) {
  if (!item) return "";
  const parts = [item.ho, item.tenDem, item.ten].filter(Boolean);
  return parts.join(" ");
}

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("vi-VN");
}

function boolToStatusChip(isActive) {
  if (isActive === true || isActive === 1 || isActive === "ACTIVE") {
    return `
      <div class="pc-tag-status active">
        <span class="pc-tag-status-dot"></span>
        <span>Đang hoạt động</span>
      </div>
    `;
  }
  if (isActive === false || isActive === 0 || isActive === "INACTIVE") {
    return `
      <div class="pc-tag-status inactive">
        <span class="pc-tag-status-dot"></span>
        <span>Ngưng hoạt động</span>
      </div>
    `;
  }
  return `
    <span class="pc-chip">
      Không rõ
    </span>
  `;
}

// ====== RENDER: ADVISORS ======

function renderAdvisorList() {
  if (!advisorListEl) return;

  if (!advisors || advisors.length === 0) {
    advisorListEl.innerHTML =
      '<div class="pc-advisor-empty">Không tìm thấy cố vấn phù hợp.</div>';
    return;
  }

  advisorListEl.innerHTML = advisors
    .map((nv) => {
      const fullName = formatFullName(nv);
      const chucVu = nv.chucVu || "Chưa thiết lập";
      const chuyenMon = nv.chuyenMon || "";
      const kinhNghiem =
        typeof nv.kinhNghiem === "number"
          ? `${nv.kinhNghiem} năm kinh nghiệm`
          : "";
      const active =
        nv.trangThaiHoatDong === true ||
        nv.trangThaiHoatDong === 1 ||
        nv.trangThaiHoatDong === "ACTIVE";

      const statusHtml = boolToStatusChip(active);

      return `
        <div
          class="pc-advisor-item ${
            String(nv.idNv) === String(selectedAdvisorId) ? "active" : ""
          }"
          data-id-nv="${nv.idNv}"
        >
          <div class="pc-advisor-main">
            <div>
              <div class="pc-advisor-name">${fullName}</div>
              <div class="pc-advisor-meta">
                ${nv.email || ""}${nv.sdt ? " • " + nv.sdt : ""}
              </div>
            </div>
            <div class="pc-advisor-status">
              ${statusHtml}
            </div>
          </div>
          <div class="pc-advisor-tags">
            <span class="pc-tag role">${chucVu}</span>
            ${
              chuyenMon
                ? `<span class="pc-tag specialty">${chuyenMon}</span>`
                : ""
            }
            ${kinhNghiem ? `<span class="pc-tag">${kinhNghiem}</span>` : ""}
          </div>
        </div>
      `;
    })
    .join("");
}

function updateAdvisorFiltersOptions() {
  // Fill dropdown ChucVu từ advisors (unique)
  if (!advisorFilterChucVuEl) return;
  const unique = new Set();
  advisors.forEach((nv) => {
    if (nv.chucVu) unique.add(nv.chucVu);
  });

  const currentValue = advisorFilterChucVuEl.value;
  advisorFilterChucVuEl.innerHTML =
    '<option value="">Tất cả</option>' +
    Array.from(unique)
      .map(
        (cv) =>
          `<option value="${cv.replace(/"/g, "&quot;")}">${cv}</option>`
      )
      .join("");

  // giữ lại selection nếu còn
  if (
    Array.from(advisorFilterChucVuEl.options).some(
      (o) => o.value === currentValue
    )
  ) {
    advisorFilterChucVuEl.value = currentValue;
  }
}

// ====== RENDER: ADVISOR SUMMARY ======

function renderAdvisorSummary() {
  if (!detailsEl || !emptyStateEl || !selectedAdvisor) {
    if (detailsEl) detailsEl.hidden = true;
    if (emptyStateEl) emptyStateEl.hidden = false;
    return;
  }

  emptyStateEl.hidden = true;
  detailsEl.hidden = false;

  const nv = selectedAdvisor;
  const fullName = formatFullName(nv);
  const initials = (nv.ten || nv.ho || "?").charAt(0).toUpperCase();
  const chucVu = nv.chucVu || "Chưa thiết lập";
  const campus = nv.idCs ? `Cơ sở: ${nv.idCs}` : "";

  const active =
    nv.trangThaiHoatDong === true ||
    nv.trangThaiHoatDong === 1 ||
    nv.trangThaiHoatDong === "ACTIVE";
  const statusHtml = boolToStatusChip(active);

  assignModalSummaryEl &&
    (assignModalSummaryEl.innerHTML = `
      <div><strong>Cố vấn:</strong> ${fullName} (${nv.email || ""})</div>
    `);

  if (!panelEl) return;
  const summaryEl = panelEl.querySelector("#pc-advisor-summary");
  if (!summaryEl) return;

  summaryEl.innerHTML = `
    <div class="pc-advisor-summary-main">
      <div class="pc-advisor-avatar">${initials}</div>
      <div class="pc-advisor-summary-text">
        <div class="pc-advisor-summary-name">${fullName}</div>
        <div class="pc-advisor-summary-meta">
          ${nv.email || ""}${nv.sdt ? " • " + nv.sdt : ""}
        </div>
        <div class="pc-advisor-summary-tags">
          <span class="pc-chip primary">
            <i class="ri-briefcase-3-line"></i>
            ${chucVu}
          </span>
          ${
            campus
              ? `<span class="pc-chip">
                  <i class="ri-building-4-line"></i>
                  ${campus}
                </span>`
              : ""
          }
          ${statusHtml}
        </div>
      </div>
    </div>
  `;
}

// ====== RENDER: STUDENTS ======

function renderAvailableStudents() {
  if (!studentListEl) return;

  if (!availableStudents || availableStudents.length === 0) {
    studentListEl.innerHTML =
      '<div class="pc-list-empty">Không tìm thấy học sinh phù hợp.</div>';
    countAvailableEl && (countAvailableEl.textContent = "0");
    return;
  }

  countAvailableEl &&
    (countAvailableEl.textContent = String(availableStudents.length));

  studentListEl.innerHTML = availableStudents
    .map((hs) => {
      const fullName = formatFullName(hs);
      const active =
        hs.trangThaiHoatDong === true ||
        hs.trangThaiHoatDong === 1 ||
        hs.trangThaiHoatDong === "ACTIVE";

      const statusHtml = boolToStatusChip(active);

      return `
        <div
          class="pc-list-item"
          data-id-hs="${hs.idHs}"
          data-action-target="student-item"
        >
          <div class="pc-list-main">
            <div class="pc-list-name">${fullName}</div>
            <div class="pc-list-sub">
              ID: ${hs.idHs}${
        hs.ngaySinh ? " • Ngày sinh: " + hs.ngaySinh : ""
      }
            </div>
          </div>

          <div class="pc-list-meta">
            <span>
              <i class="ri-mail-line"></i>
              ${hs.email || "Chưa cập nhật"}
            </span>
            <span>
              <i class="ri-phone-line"></i>
              ${hs.sdt || "Chưa cập nhật"}
            </span>
          </div>

          <div class="pc-list-status">
            ${statusHtml}
          </div>

          <div class="pc-list-actions">
            <button
              type="button"
              class="btn primary"
              data-action="assign-student"
              data-id-hs="${hs.idHs}"
            >
              <i class="ri-user-add-line"></i>
              <span>Gán cố vấn</span>
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

// ====== RENDER: ASSIGNMENTS ======

function renderAssignments() {
  if (!assignmentListEl) return;

  if (!assignments || assignments.length === 0) {
    assignmentListEl.innerHTML =
      '<div class="pc-list-empty">Chưa có phân công cố vấn nào cho nhân viên này.</div>';
    countAssignedEl && (countAssignedEl.textContent = "0");
    return;
  }

  countAssignedEl &&
    (countAssignedEl.textContent = String(assignments.length));

  assignmentListEl.innerHTML = assignments
    .map((as) => {
      const hs = as.hocSinh || {};
      const fullName = formatFullName(hs);
      const status = as.trangThai || "Không đặt";
      const ngayBd = formatDateTime(as.ngayBatDau);
      const ngayKt = as.ngayKetThuc ? formatDateTime(as.ngayKetThuc) : "—";

      let statusClass = "primary";
      if (
        status.toLowerCase().includes("kết thúc") ||
        status.toLowerCase().includes("ket thuc")
      ) {
        statusClass = "danger";
      } else if (
        status.toLowerCase().includes("tạm") ||
        status.toLowerCase().includes("tam")
      ) {
        statusClass = "warning";
      } else if (status.toLowerCase().includes("đang")) {
        statusClass = "success";
      }

      return `
        <div
          class="pc-list-item"
          data-id-nv="${as.idNv}"
          data-id-hs="${as.idHs}"
          data-ngaybatdau="${as.ngayBatDau}"
          data-action-target="assignment-item"
        >
          <div class="pc-list-main">
            <div class="pc-list-name">${fullName}</div>
            <div class="pc-list-sub">ID HS: ${as.idHs}</div>
          </div>

          <div class="pc-list-meta">
            <span>
              <i class="ri-calendar-line"></i>
              Bắt đầu: ${ngayBd}
            </span>
            <span>
              <i class="ri-calendar-check-line"></i>
              Kết thúc: ${ngayKt}
            </span>
          </div>

          <div class="pc-list-status">
            <span class="pc-chip ${statusClass}">
              <i class="ri-information-line"></i>
              ${status}
            </span>
          </div>

          <div class="pc-list-actions">
            <button
              type="button"
              class="btn ghost"
              data-action="edit-assignment"
              data-id-nv="${as.idNv}"
              data-id-hs="${as.idHs}"
              data-ngaybatdau="${as.ngayBatDau}"
            >
              <i class="ri-edit-line"></i>
            </button>
            <button
              type="button"
              class="btn ghost"
              data-action="end-assignment"
              data-id-nv="${as.idNv}"
              data-id-hs="${as.idHs}"
              data-ngaybatdau="${as.ngayBatDau}"
            >
              <i class="ri-flag-2-line"></i>
              <span>Kết thúc</span>
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

// ====== LOAD DATA ======

async function loadAdvisors() {
  try {
    const filterPayload = {
      searchKeyword: advisorSearchInputEl?.value?.trim() || "",
      chucVu: advisorFilterChucVuEl?.value || "",
      trangThaiHoatDong: advisorFilterStatusEl?.value || "active",
      page: 0,
      size: 100,
    };

    const data = await apiSearchAdvisors(filterPayload);
    advisors = Array.isArray(data?.content) ? data.content : [];
    updateAdvisorFiltersOptions();
    renderAdvisorList();

    // Nếu chưa chọn cố vấn, auto chọn phần tử đầu tiên (nếu có)
    if (!selectedAdvisorId && advisors.length > 0) {
      selectAdvisor(advisors[0].idNv);
    }
  } catch (err) {
    console.error("Không thể tải danh sách cố vấn:", err);
    showToast(err.message || "Không thể tải danh sách cố vấn");
  }
}

async function loadStudentsForAdvisor() {
  if (!selectedAdvisorId) return;

  try {
    const filterPayload = {
      searchKeyword: studentSearchInputEl?.value?.trim() || "",
      trangThaiHoatDong: studentFilterStatusEl?.value || "active",
      onlyWithoutAdvisor: !!onlyWithoutAdvisorCheckboxEl?.checked,
      page: 0,
      size: 200,
    };

    const data = await apiSearchStudentsForAdvisor(
      selectedAdvisorId,
      filterPayload
    );
    availableStudents = Array.isArray(data?.content) ? data.content : [];
    renderAvailableStudents();
  } catch (err) {
    console.error("Không thể tải danh sách học sinh:", err);
    showToast(err.message || "Không thể tải danh sách học sinh");
  }
}

async function loadAssignmentsForAdvisor() {
  if (!selectedAdvisorId) return;

  try {
    const filterPayload = {
      status: assignmentFilterStatusEl?.value || "",
      page: 0,
      size: 200,
    };

    const data = await apiGetAdvisorAssignments(
      selectedAdvisorId,
      filterPayload
    );
    assignments = Array.isArray(data?.content) ? data.content : [];
    renderAssignments();
  } catch (err) {
    console.error("Không thể tải danh sách phân công:", err);
    showToast(err.message || "Không thể tải danh sách phân công");
  }
}

// ====== SELECT ADVISOR ======

function selectAdvisor(idNv) {
  // lưu id dạng string để so sánh ổn định
  selectedAdvisorId = String(idNv);
  selectedAdvisor =
    advisors.find((nv) => String(nv.idNv) === selectedAdvisorId) || null;

  renderAdvisorList();
  renderAdvisorSummary();
  // load lại dữ liệu chi tiết
  loadStudentsForAdvisor();
  loadAssignmentsForAdvisor();
}

// ====== TABS HANDLING ======

function switchTab(tab) {
  if (!tabAvailablePanelEl || !tabAssignedPanelEl) return;

  if (tab === "available") {
    tabAvailablePanelEl.hidden = false;
    tabAssignedPanelEl.hidden = true;
    tabAvailableBtnEl?.classList.add("active");
    tabAssignedBtnEl?.classList.remove("active");
  } else {
    tabAvailablePanelEl.hidden = true;
    tabAssignedPanelEl.hidden = false;
    tabAvailableBtnEl?.classList.remove("active");
    tabAssignedBtnEl?.classList.add("active");
  }
}

// ====== MODAL: OPEN / CLOSE ======

function openAssignModal({ student, assignment }) {
  if (!assignModalBackdropEl) return;

  currentAssignStudent = student || null;
  currentEditingAssignment = assignment || null;

  const isEdit = !!assignment;
  assignModalTitleEl.textContent = isEdit
    ? "Chỉnh sửa phân công cố vấn"
    : "Gán học sinh cho cố vấn";

  // Tóm tắt
  const studentName = student ? formatFullName(student) : "";
  const advisorName = selectedAdvisor ? formatFullName(selectedAdvisor) : "";

  assignModalSummaryEl.innerHTML = `
    <div><strong>Cố vấn:</strong> ${advisorName} (ID_NV: ${
    selectedAdvisor?.idNv || ""
  })</div>
    <div><strong>Học sinh:</strong> ${studentName} (ID_HS: ${
    student?.idHs || assignment?.idHs || ""
  })</div>
  `;

  // Nếu edit -> fill dữ liệu
  if (isEdit && assignment) {
    // dùng ngayBatDau / ngayKetThuc từ assignment (ISO datetime)
    inputNgayBatDauEl.value = assignment.ngayBatDau
      ? assignment.ngayBatDau.slice(0, 16)
      : "";
    inputNgayKetThucEl.value = assignment.ngayKetThuc
      ? assignment.ngayKetThuc.slice(0, 16)
      : "";
    inputTrangThaiEl.value = assignment.trangThai || "";
    inputGhiChuEl.value = assignment.ghiChu || "";
  } else {
    // new assignment
    const now = new Date();
    const isoLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    inputNgayBatDauEl.value = isoLocal;
    inputNgayKetThucEl.value = "";
    inputTrangThaiEl.value = "Đang cố vấn";
    inputGhiChuEl.value = "";
  }

  // MỞ MODAL: bỏ hidden + ép hiển thị flex
  assignModalBackdropEl.hidden = false;
  assignModalBackdropEl.style.display = "flex";
}

function closeAssignModal() {
  if (!assignModalBackdropEl) return;

  // ẨN MODAL: set hidden + display none
  assignModalBackdropEl.hidden = true;
  assignModalBackdropEl.style.display = "none";

  currentAssignStudent = null;
  currentEditingAssignment = null;
  assignFormEl?.reset();
}

// ====== HANDLE ASSIGN / UPDATE / END ======

async function handleAssignFormSubmit(e) {
  e.preventDefault();

  try {
    // ===== VALIDATE =====
    if (!selectedAdvisorId) {
      showToast("Vui lòng chọn cố vấn trước.");
      return;
    }

    const ngayBatDau = inputNgayBatDauEl?.value || "";
    const ngayKetThuc = inputNgayKetThucEl?.value || null;
    const trangThai = inputTrangThaiEl?.value || null;
    const ghiChu = inputGhiChuEl?.value || null;

    if (!ngayBatDau) {
      showToast("Vui lòng chọn ngày bắt đầu.");
      return;
    }

    // ===== CALL API =====
    if (currentEditingAssignment) {
      // Update phân công hiện tại
      const payload = {
        originalKey: {
          idNv: currentEditingAssignment.idNv,
          idHs: currentEditingAssignment.idHs,
          ngayBatDau: currentEditingAssignment.ngayBatDau,
        },
        update: {
          ngayBatDau,
          ngayKetThuc,
          trangThai,
          ghiChu,
        },
      };

      console.log("[PC] Update assignment payload:", payload);
      await apiUpdateAssignment(payload);
      showToast("Đã cập nhật phân công cố vấn.");
    } else {
      // Tạo mới phân công
      if (!currentAssignStudent) {
        showToast("Không xác định được học sinh cần gán.");
        return;
      }

      const payload = {
        idNv: selectedAdvisorId,
        idHs: currentAssignStudent.idHs,
        ngayBatDau,
        ngayKetThuc,
        trangThai,
        ghiChu,
      };

      console.log("[PC] Create assignment payload:", payload);
      await apiCreateAssignment(payload);
      showToast("Đã tạo phân công cố vấn mới.");
    }

    await loadStudentsForAdvisor();
    await loadAssignmentsForAdvisor();
  } catch (err) {
    console.error("Lỗi khi lưu phân công:", err);
    showToast(err.message || "Không thể lưu phân công cố vấn");
  } finally {
    // DÙ THÀNH CÔNG HAY LỖI FE/BE THÌ VẪN ĐÓNG MODAL
    closeAssignModal();
  }
}

async function handleEndAssignmentClick({ idNv, idHs, ngayBatDau }) {
  if (
    !window.confirm(
      "Bạn có chắc muốn kết thúc phân công này? Ngày kết thúc sẽ được cập nhật."
    )
  ) {
    return;
  }

  try {
    const now = new Date();
    const iso = now.toISOString();

    const payload = {
      idNv,
      idHs,
      ngayBatDau,
      ngayKetThuc: iso,
      trangThai: "Đã kết thúc",
    };

    await apiEndAssignment(payload);
    showToast("Đã kết thúc phân công cố vấn.");
    await loadAssignmentsForAdvisor();
    await loadStudentsForAdvisor();
  } catch (err) {
    console.error("Lỗi khi kết thúc phân công:", err);
    showToast(err.message || "Không thể kết thúc phân công cố vấn");
  }
}

// ====== EVENT BINDING ======

function bindEvents() {
  // refresh all
  const refreshAllBtn = panelEl.querySelector("#pc-refresh-all");
  refreshAllBtn?.addEventListener("click", () => {
    loadAdvisors();
    if (selectedAdvisorId) {
      loadStudentsForAdvisor();
      loadAssignmentsForAdvisor();
    }
  });

  // advisors
  const refreshAdvisorsBtn = panelEl.querySelector("#pc-refresh-advisors");
  refreshAdvisorsBtn?.addEventListener("click", () => {
    loadAdvisors();
  });

  advisorListEl.addEventListener("click", (e) => {
    const item = e.target.closest(".pc-advisor-item");
    if (!item) return;
    const idNv = item.getAttribute("data-id-nv");
    if (!idNv) return;
    selectAdvisor(idNv);
  });

  advisorSearchInputEl?.addEventListener("input", () => {
    loadAdvisors();
  });

  advisorFilterChucVuEl?.addEventListener("change", () => {
    loadAdvisors();
  });

  advisorFilterStatusEl?.addEventListener("change", () => {
    loadAdvisors();
  });

  // tabs
  tabAvailableBtnEl?.addEventListener("click", () => {
    switchTab("available");
  });
  tabAssignedBtnEl?.addEventListener("click", () => {
    switchTab("assigned");
  });

  // student filters
  studentSearchInputEl?.addEventListener("input", () => {
    loadStudentsForAdvisor();
  });

  studentFilterStatusEl?.addEventListener("change", () => {
    loadStudentsForAdvisor();
  });

  onlyWithoutAdvisorCheckboxEl?.addEventListener("change", () => {
    loadStudentsForAdvisor();
  });

  // student list actions
  studentListEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='assign-student']");
    if (!btn) return;

    const idHs = btn.getAttribute("data-id-hs");
    const student = availableStudents.find(
      (hs) => String(hs.idHs) === String(idHs)
    );
    if (!student) {
      showToast("Không tìm thấy dữ liệu học sinh.");
      return;
    }

    openAssignModal({ student, assignment: null });
  });

  // assignments filters
  assignmentFilterStatusEl?.addEventListener("change", () => {
    loadAssignmentsForAdvisor();
  });

  // assignment list actions
  assignmentListEl.addEventListener("click", (e) => {
    const endBtn = e.target.closest("[data-action='end-assignment']");
    const editBtn = e.target.closest("[data-action='edit-assignment']");

    if (endBtn) {
      const idNv = endBtn.getAttribute("data-id-nv");
      const idHs = endBtn.getAttribute("data-id-hs");
      const ngayBatDau = endBtn.getAttribute("data-ngaybatdau");
      if (idNv && idHs && ngayBatDau) {
        handleEndAssignmentClick({ idNv, idHs, ngayBatDau });
      }
      return;
    }

    if (editBtn) {
      const idNv = editBtn.getAttribute("data-id-nv");
      const idHs = editBtn.getAttribute("data-id-hs");
      const ngayBatDau = editBtn.getAttribute("data-ngaybatdau");

      const assignment = assignments.find(
        (as) =>
          String(as.idNv) === String(idNv) &&
          String(as.idHs) === String(idHs) &&
          String(as.ngayBatDau) === String(ngayBatDau)
      );
      if (!assignment) {
        showToast("Không tìm thấy dữ liệu phân công.");
        return;
      }

      const student = assignment.hocSinh || null;
      openAssignModal({ student, assignment });
    }
  });

  // modal buttons
  assignModalCloseEl?.addEventListener("click", () => {
    closeAssignModal();
  });
  assignModalCancelEl?.addEventListener("click", () => {
    closeAssignModal();
  });

  assignModalBackdropEl?.addEventListener("click", (e) => {
    if (e.target === assignModalBackdropEl) {
      closeAssignModal();
    }
  });

  assignFormEl?.addEventListener("submit", handleAssignFormSubmit);
}

// ====== INIT ======

export async function initPhanCongPage() {
  panelEl = document.getElementById("phancong-panel");
  if (!panelEl) {
    console.error("Không tìm thấy #phancong-panel trong DOM");
    return;
  }

  // base sections
  emptyStateEl = panelEl.querySelector("#pc-empty-state");
  detailsEl = panelEl.querySelector("#pc-details");

  advisorListEl = panelEl.querySelector("#pc-advisor-list");
  advisorSearchInputEl = panelEl.querySelector("#pc-advisor-search-input");
  advisorFilterChucVuEl = panelEl.querySelector("#pc-advisor-filter-chucvu");
  advisorFilterStatusEl = panelEl.querySelector("#pc-advisor-filter-status");

  tabAvailableBtnEl = panelEl.querySelector("#pc-tab-available");
  tabAssignedBtnEl = panelEl.querySelector("#pc-tab-assigned");
  tabAvailablePanelEl = panelEl.querySelector("#pc-tab-panel-available");
  tabAssignedPanelEl = panelEl.querySelector("#pc-tab-panel-assigned");
  countAvailableEl = panelEl.querySelector("#pc-count-available");
  countAssignedEl = panelEl.querySelector("#pc-count-assigned");

  studentListEl = panelEl.querySelector("#pc-student-list");
  studentSearchInputEl = panelEl.querySelector("#pc-student-search-input");
  studentFilterStatusEl = panelEl.querySelector("#pc-student-filter-status");
  onlyWithoutAdvisorCheckboxEl = panelEl.querySelector(
    "#pc-only-without-advisor"
  );

  assignmentListEl = panelEl.querySelector("#pc-assignment-list");
  assignmentFilterStatusEl = panelEl.querySelector(
    "#pc-assignment-filter-status"
  );

  // modal
  assignModalBackdropEl = panelEl.querySelector("#pc-assign-modal-backdrop");
  assignModalCloseEl = panelEl.querySelector("#pc-assign-modal-close");
  assignModalCancelEl = panelEl.querySelector("#pc-assign-modal-cancel");
  assignModalTitleEl = panelEl.querySelector("#pc-assign-modal-title");
  assignModalSummaryEl = panelEl.querySelector("#pc-assign-modal-summary");
  assignFormEl = panelEl.querySelector("#pc-assign-form");
  inputNgayBatDauEl = panelEl.querySelector("#pc-input-ngaybatdau");
  inputNgayKetThucEl = panelEl.querySelector("#pc-input-ngayketthuc");
  inputTrangThaiEl = panelEl.querySelector("#pc-input-trangthai");
  inputGhiChuEl = panelEl.querySelector("#pc-input-ghichu");

  if (!advisorListEl || !studentListEl || !assignmentListEl) {
    console.error("Thiếu một số phần tử DOM cần thiết cho trang phân công.");
    return;
  }

  if (assignModalBackdropEl) {
    assignModalBackdropEl.hidden = true; // ẩn khi load trang
    assignModalBackdropEl.style.display = "none";
  }

  bindEvents();
  switchTab("available");
  await loadAdvisors();
}
