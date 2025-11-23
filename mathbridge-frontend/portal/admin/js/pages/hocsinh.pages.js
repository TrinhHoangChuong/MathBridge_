// portal/admin/js/pages/hocsinh.pages.js
import {
  apiSearchStudents,
  apiGetStudentDetail,
  apiAddStudentToClass,
  apiRemoveStudentFromClass,
  apiSearchAssignments,
  apiSearchSubmissions,
  apiGetClassEvaluation,
} from "../api/hocsinh.api.js";

import { apiGetAllPrograms } from "../api/programApi.js";
import { apiGetAllClasses } from "../api/classApi.js";

// ===============================
// STATE
// ===============================
let isLoadingStudents = false;
let currentStudentId = null;
let currentStudentDetail = null;
let currentStudentClasses = [];
let currentStudentStats = null;

let programsCache = [];
let classesCache = [];

// cờ lazy-load cho các tab
let assignmentsTabInitialized = false;
let submissionsTabInitialized = false;
let resultsTabInitialized = false;

// ===============================
// ENTRY POINT
// ===============================
export async function initHocSinhPage() {
  try {
    setupMainTabs();
    setupRefreshButton();

    setupStudentFilters();
    setupAddClassButton();
    setupAssignmentFilters();
    setupSubmissionFilters();
    setupResultsFilters();

    await loadProgramAndClassFilters(); // CT + Lớp cho tất cả tab
    await loadStudentList();
  } catch (err) {
    console.error("Lỗi initHocSinhPage:", err);
  }
}

// ===============================
// 0. MAIN TABS
// ===============================
function setupMainTabs() {
  const tabButtons = document.querySelectorAll(".hsht-main-tab");
  const views = document.querySelectorAll(".hsht-main-view");

  if (!tabButtons.length || !views.length) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const view = btn.getAttribute("data-view");
      if (!view) return;

      // toggle active trên nút
      tabButtons.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
      });

      // toggle active trên view
      views.forEach((v) => {
        const contentKey = v.getAttribute("data-view-content");
        v.classList.toggle("is-active", contentKey === view);
      });

      // lazy-load dữ liệu cho từng tab
      try {
        if (view === "students") {
          // tab Học sinh đã load sẵn
        } else if (view === "assignments") {
          if (!assignmentsTabInitialized) {
            assignmentsTabInitialized = true;
            await loadAssignmentList();
          }
        } else if (view === "submissions") {
          if (!submissionsTabInitialized) {
            submissionsTabInitialized = true;
            // chỉ load khi user bấm "Áp dụng", nên ở đây không cần gọi gì thêm
          }
        } else if (view === "results") {
          if (!resultsTabInitialized) {
            resultsTabInitialized = true;
            // tương tự, chờ user chọn lớp + bấm "Áp dụng"
          }
        }
      } catch (err) {
        console.error("Lỗi khi chuyển tab:", err);
      }
    });
  });
}

function setupRefreshButton() {
  const btn = document.getElementById("btn-hsht-refresh");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      await loadStudentList();
      if (currentStudentId) {
        await handleViewStudentDetail(currentStudentId);
      }
    } catch (err) {
      console.error("Lỗi làm mới Học sinh & Học tập:", err);
    }
  });
}

// ===============================
// 1. LOAD COMBO CHƯƠNG TRÌNH + LỚP
// ===============================
async function loadProgramAndClassFilters() {
  try {
    const [programs, classes] = await Promise.all([
      apiGetAllPrograms(),
      apiGetAllClasses(),
    ]);

    programsCache = programs || [];
    classesCache = classes || [];

    // --- Tab Học sinh ---
    const stuProgramSelect = document.getElementById("filter-student-program");
    const stuClassSelect = document.getElementById("filter-student-class");

    if (stuProgramSelect) {
      stuProgramSelect.innerHTML = `
        <option value="">Tất cả</option>
        ${programsCache
          .map(
            (p) =>
              `<option value="${escapeHtml(p.idCt)}">${escapeHtml(
                p.tenCt || p.tenCT || ""
              )}</option>`
          )
          .join("")}
      `;
    }

    if (stuClassSelect) {
      renderClassOptionsForFilter();
    }

    if (stuProgramSelect) {
      stuProgramSelect.addEventListener("change", () => {
        renderClassOptionsForFilter();
        loadStudentList().catch((err) =>
          console.error("Lỗi load danh sách học sinh:", err)
        );
      });
    }

    // --- Tab Bài tập ---
    const assignProgramSelect = document.getElementById("filter-assign-program");
    const assignClassSelect = document.getElementById("filter-assign-class");

    if (assignProgramSelect) {
      assignProgramSelect.innerHTML = `
        <option value="">Tất cả</option>
        ${programsCache
          .map(
            (p) =>
              `<option value="${escapeHtml(p.idCt)}">${escapeHtml(
                p.tenCt || p.tenCT || ""
              )}</option>`
          )
          .join("")}
      `;
    }

    if (assignClassSelect) {
      renderAssignClassOptions();
    }

    // --- Tab Bài nộp & Chấm điểm ---
    const subProgramSelect = document.getElementById("filter-sub-program");
    const subClassSelect = document.getElementById("filter-sub-class");

    if (subProgramSelect) {
      subProgramSelect.innerHTML = `
        <option value="">Tất cả</option>
        ${programsCache
          .map(
            (p) =>
              `<option value="${escapeHtml(p.idCt)}">${escapeHtml(
                p.tenCt || p.tenCT || ""
              )}</option>`
          )
          .join("")}
      `;
    }

    if (subClassSelect) {
      renderSubClassOptions();
    }

    // --- Tab Đánh giá & Kết quả ---
    const resClassSelect = document.getElementById("filter-res-class");
    if (resClassSelect) {
      renderResClassOptions();
    }
  } catch (err) {
    console.error("Không thể load danh sách CT / Lớp:", err);
  }
}

// lớp cho filter tab Học sinh
function renderClassOptionsForFilter() {
  const programSelect = document.getElementById("filter-student-program");
  const classSelect = document.getElementById("filter-student-class");
  if (!classSelect) return;

  const selectedProgramId = programSelect?.value || "";

  let filteredClasses = classesCache;
  if (selectedProgramId) {
    filteredClasses = classesCache.filter(
      (c) => c.idCt === selectedProgramId || c.idCT === selectedProgramId
    );
  }

  classSelect.innerHTML = `
    <option value="">Tất cả</option>
    ${filteredClasses
      .map(
        (c) =>
          `<option value="${escapeHtml(c.idLh)}">${escapeHtml(
            c.tenLop || ""
          )}</option>`
      )
      .join("")}
  `;
}

// lớp cho filter tab Bài tập
function renderAssignClassOptions() {
  const programSelect = document.getElementById("filter-assign-program");
  const classSelect = document.getElementById("filter-assign-class");
  if (!classSelect) return;

  const selectedProgramId = programSelect?.value || "";

  let filteredClasses = classesCache;
  if (selectedProgramId) {
    filteredClasses = classesCache.filter(
      (c) => c.idCt === selectedProgramId || c.idCT === selectedProgramId
    );
  }

  classSelect.innerHTML = `
    <option value="">Chọn lớp học</option>
    ${filteredClasses
      .map(
        (c) =>
          `<option value="${escapeHtml(c.idLh)}">${escapeHtml(
            c.tenLop || ""
          )}</option>`
      )
      .join("")}
  `;
}

// lớp cho filter tab Bài nộp
function renderSubClassOptions() {
  const programSelect = document.getElementById("filter-sub-program");
  const classSelect = document.getElementById("filter-sub-class");
  if (!classSelect) return;

  const selectedProgramId = programSelect?.value || "";

  let filteredClasses = classesCache;
  if (selectedProgramId) {
    filteredClasses = classesCache.filter(
      (c) => c.idCt === selectedProgramId || c.idCT === selectedProgramId
    );
  }

  classSelect.innerHTML = `
    <option value="">Tất cả lớp</option>
    ${filteredClasses
      .map(
        (c) =>
          `<option value="${escapeHtml(c.idLh)}">${escapeHtml(
            c.tenLop || ""
          )}</option>`
      )
      .join("")}
  `;
}

// lớp cho filter tab Kết quả (dùng tất cả lớp)
function renderResClassOptions() {
  const classSelect = document.getElementById("filter-res-class");
  if (!classSelect) return;

  classSelect.innerHTML = `
    <option value="">Tất cả lớp</option>
    ${classesCache
      .map(
        (c) =>
          `<option value="${escapeHtml(c.idLh)}">${escapeHtml(
            c.tenLop || ""
          )}</option>`
      )
      .join("")}
  `;
}

// ===============================
// 2. FILTER & DANH SÁCH HỌC SINH
// ===============================
function setupStudentFilters() {
  const searchInput = document.getElementById("filter-student-search");
  const programSelect = document.getElementById("filter-student-program");
  const classSelect = document.getElementById("filter-student-class");
  const statusSelect = document.getElementById("filter-student-status");

  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        loadStudentList().catch((err) =>
          console.error("Lỗi load danh sách học sinh:", err)
        );
      }
    });
  }

  [programSelect, classSelect, statusSelect].forEach((el) => {
    if (!el) return;
    el.addEventListener("change", () => {
      loadStudentList().catch((err) =>
        console.error("Lỗi load danh sách học sinh:", err)
      );
    });
  });
}

async function loadStudentList() {
  const tbody = document.querySelector("#tbl-student-list tbody");
  if (!tbody) return;

  if (isLoadingStudents) return;
  isLoadingStudents = true;

  try {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">Đang tải danh sách học sinh...</td>
      </tr>
    `;

    const searchInput = document.getElementById("filter-student-search");
    const programSelect = document.getElementById("filter-student-program");
    const classSelect = document.getElementById("filter-student-class");
    const statusSelect = document.getElementById("filter-student-status");

    const payload = {
      searchKeyword: searchInput?.value?.trim() || null,
      programId: programSelect?.value || null,
      classId: classSelect?.value || null,
      status: statusSelect?.value || null,
    };

    const res = await apiSearchStudents(payload);
    const students = res?.students || [];

    if (!students.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="7">Chưa có dữ liệu học sinh.</td>
        </tr>
      `;
      renderStudentPanels(null);
      return;
    }

    const rowsHtml = students
      .map(
        (s) => `
        <tr data-student-id="${escapeHtml(s.idHs)}">
          <td>${escapeHtml(s.idHs)}</td>
          <td>${escapeHtml(s.fullName || "")}</td>
          <td>${escapeHtml(s.email || "")}</td>
          <td>${escapeHtml(s.sdt || "")}</td>
          <td>${s.soLopDangHoc != null ? s.soLopDangHoc : "-"}</td>
          <td>
            ${
              s.trangThaiHoatDong
                ? '<span class="pill pill-success">Đang học</span>'
                : '<span class="pill pill-muted">Ngưng</span>'
            }
          </td>
          <td>
            <button class="btn-link" type="button" data-action="view-detail">
              Chi tiết
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    tbody.innerHTML = rowsHtml;

    tbody
      .querySelectorAll('button[data-action="view-detail"]')
      .forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const tr = e.target.closest("tr[data-student-id]");
          if (!tr) return;
          const idHs = tr.getAttribute("data-student-id");
          await handleViewStudentDetail(idHs);
        });
      });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">Lỗi tải dữ liệu học sinh.</td>
      </tr>
    `;
  } finally {
    isLoadingStudents = false;
  }
}

// ===============================
// 3. PANEL CHI TIẾT BÊN PHẢI
// ===============================
async function handleViewStudentDetail(idHs) {
  if (!idHs) return;
  try {
    const res = await apiGetStudentDetail(idHs);
    currentStudentId = idHs;
    currentStudentDetail = res?.studentDetail || null;
    currentStudentClasses = res?.studentClasses || [];
    currentStudentStats = res?.studentStats || null;

    renderStudentPanels(res);
  } catch (err) {
    console.error("Không thể lấy chi tiết học sinh", err);
    alert("Không thể lấy chi tiết học sinh. Vui lòng thử lại.");
  }
}

function renderStudentPanels(resp) {
  const infoRoot = document.getElementById("student-info-panel");
  const selectedPill = document.getElementById("student-selected-pill");
  const classesTbody = document.querySelector("#tbl-student-classes tbody");
  const summaryRoot = document.getElementById("student-summary-panel");

  if (!resp || !resp.studentDetail) {
    if (selectedPill) selectedPill.textContent = "Chưa chọn học sinh";
    if (infoRoot)
      infoRoot.innerHTML =
        "<p class='muted'>Chọn một học sinh ở bảng bên trái.</p>";
    if (classesTbody)
      classesTbody.innerHTML =
        "<tr class='empty-row'><td colspan='6'>Chưa có lớp nào.</td></tr>";
    if (summaryRoot)
      summaryRoot.innerHTML = "<p class='muted'>Chưa có dữ liệu.</p>";
    return;
  }

  const detail = resp.studentDetail;
  const classes = resp.studentClasses || [];
  const stats = resp.studentStats || {};

  const fullName = buildFullName(detail.ho, detail.tenDem, detail.ten);

  if (selectedPill) {
    selectedPill.textContent = `Đang xem: ${detail.idHs} - ${fullName}`;
  }

  if (infoRoot) {
    infoRoot.innerHTML = `
      <div class="hs-info-top">
        <div class="hs-info-main">
          <div class="hs-info-name">${escapeHtml(fullName)}</div>
          <div class="hs-info-id">Mã HS: <span>${escapeHtml(
            detail.idHs
          )}</span></div>
        </div>
        <div class="hs-info-status">
          ${
            detail.trangThaiHoatDong
              ? '<span class="pill pill-success">Đang học</span>'
              : '<span class="pill pill-muted">Ngưng</span>'
          }
        </div>
      </div>

      <div class="hs-info-grid">
        <div class="hs-info-item">
          <div class="info-label">Email</div>
          <div class="info-value">${escapeHtml(detail.email || "")}</div>
        </div>
        <div class="hs-info-item">
          <div class="info-label">SĐT</div>
          <div class="info-value">${escapeHtml(detail.sdt || "")}</div>
        </div>
        <div class="hs-info-item">
          <div class="info-label">Địa chỉ</div>
          <div class="info-value">${escapeHtml(detail.diaChi || "")}</div>
        </div>
        <div class="hs-info-item">
          <div class="info-label">Ngày sinh</div>
          <div class="info-value">${formatDate(detail.ngaySinh)}</div>
        </div>
        <div class="hs-info-item">
          <div class="info-label">Tạo lúc</div>
          <div class="info-value">${formatDateTime(detail.thoiGianTao)}</div>
        </div>
        <div class="hs-info-item">
          <div class="info-label">Cập nhật</div>
          <div class="info-value">${formatDateTime(
            detail.thoiGianCapNhat
          )}</div>
        </div>
      </div>
    `;
  }

  if (classesTbody) {
    if (!classes.length) {
      classesTbody.innerHTML =
        "<tr class='empty-row'><td colspan='6'>Chưa có lớp nào.</td></tr>";
    } else {
      classesTbody.innerHTML = classes
        .map(
          (c) => `
          <tr data-class-id="${escapeHtml(c.idLh)}">
            <td>${escapeHtml(c.idLh)}</td>
            <td>${escapeHtml(c.tenLop || "")}</td>
            <td>${escapeHtml(c.tenCt || "")}</td>
            <td>${formatDate(c.ngayBatDau)}</td>
            <td>${escapeHtml(c.hinhThucHoc || "")}</td>
            <td>
              <button class="btn-link btn-link-danger" type="button" data-action="remove-class">
                Xóa
              </button>
            </td>
          </tr>
        `
        )
        .join("");

      classesTbody
        .querySelectorAll('button[data-action="remove-class"]')
        .forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const tr = e.target.closest("tr[data-class-id]");
            if (!tr || !currentStudentId) return;
            const idLh = tr.getAttribute("data-class-id");
            if (
              !confirm(
                `Xoá học sinh ${currentStudentId} khỏi lớp ${idLh}?`
              )
            ) {
              return;
            }
            try {
              await apiRemoveStudentFromClass(currentStudentId, idLh);
              await handleViewStudentDetail(currentStudentId);
            } catch (err) {
              console.error("Không thể xoá khỏi lớp", err);
              alert("Không thể xoá khỏi lớp. Vui lòng thử lại.");
            }
          });
        });
    }
  }

  if (summaryRoot) {
    const soLopDangHoc = stats.soLopDangHoc ?? classes.length;
    const tongSoBaiTap = stats.tongSoBaiTap ?? 0;
    const soBaiDaNop = stats.soBaiDaNop ?? 0;
    const soBaiChuaNop = stats.soBaiChuaNop ?? 0;
    const diemTb =
      stats.diemTrungBinh != null ? String(stats.diemTrungBinh) : "-";
    const xepLoai = stats.xepLoai || "-";

    summaryRoot.innerHTML = `
      <div class="hs-summary-grid">
        <div class="hs-summary-item">
          <div class="hs-summary-label">Số lớp đang học</div>
          <div class="hs-summary-value">${soLopDangHoc}</div>
        </div>
        <div class="hs-summary-item">
          <div class="hs-summary-label">Tổng số bài tập</div>
          <div class="hs-summary-value">${tongSoBaiTap}</div>
        </div>
        <div class="hs-summary-item">
          <div class="hs-summary-label">Đã nộp</div>
          <div class="hs-summary-value">${soBaiDaNop}</div>
        </div>
        <div class="hs-summary-item">
          <div class="hs-summary-label">Chưa nộp</div>
          <div class="hs-summary-value">${soBaiChuaNop}</div>
        </div>
        <div class="hs-summary-item">
          <div class="hs-summary-label">Điểm trung bình</div>
          <div class="hs-summary-value">${diemTb}</div>
        </div>
        <div class="hs-summary-item">
          <div class="hs-summary-label">Xếp loại</div>
          <div class="hs-summary-value">${escapeHtml(xepLoai)}</div>
        </div>
      </div>
    `;
  }
}

// ===============================
// 4. THÊM HỌC SINH VÀO LỚP
// ===============================
function setupAddClassButton() {
  const btn = document.getElementById("btn-add-class-for-student");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!currentStudentId) {
      alert("Hãy chọn một học sinh trước.");
      return;
    }
    openAddClassPanel(btn);
  });
}

function openAddClassPanel(triggerBtn) {
  const sectionCard = triggerBtn.closest(".section-card");
  if (!sectionCard) return;

  let panel = sectionCard.querySelector(".hs-add-class-panel");
  if (panel) {
    panel.classList.toggle("is-open");
    return;
  }

  panel = document.createElement("div");
  panel.className = "hs-add-class-panel";

  const currentIds = new Set((currentStudentClasses || []).map((c) => c.idLh));
  const candidateClasses = classesCache.filter(
    (c) => !currentIds.has(c.idLh)
  );

  panel.innerHTML = `
    <div class="hs-add-class-inner">
      <select class="input-select" id="hs-add-class-select">
        <option value="">Chọn lớp để thêm...</option>
        ${candidateClasses
          .map((c) => {
            const ct =
              programsCache.find(
                (p) => p.idCt === c.idCt || p.idCT === c.idCt
              )?.tenCt || "";
            const label = `[${c.idLh}] ${c.tenLop || ""}${ct ? " - " + ct : ""}`;
            return `<option value="${escapeHtml(c.idLh)}">${escapeHtml(
              label
            )}</option>`;
          })
          .join("")}
      </select>
      <button class="btn primary" type="button" id="hs-add-class-confirm">
        Thêm
      </button>
      <button class="btn ghost small" type="button" id="hs-add-class-cancel">
        Hủy
      </button>
    </div>
  `;

  const tableWrapper = sectionCard.querySelector(".table-wrapper");
  sectionCard.insertBefore(panel, tableWrapper || null);

  const selectEl = panel.querySelector("#hs-add-class-select");
  const btnConfirm = panel.querySelector("#hs-add-class-confirm");
  const btnCancel = panel.querySelector("#hs-add-class-cancel");

  btnCancel.addEventListener("click", () => {
    panel.classList.remove("is-open");
  });

  btnConfirm.addEventListener("click", async () => {
    const classId = selectEl.value;
    if (!classId) {
      alert("Hãy chọn một lớp để thêm.");
      return;
    }
    try {
      const res = await apiAddStudentToClass(currentStudentId, classId);
      currentStudentDetail = res?.studentDetail || null;
      currentStudentClasses = res?.studentClasses || [];
      currentStudentStats = res?.studentStats || null;
      renderStudentPanels(res);
      panel.classList.remove("is-open");
    } catch (err) {
      console.error("Không thể thêm học sinh vào lớp", err);
      alert("Không thể thêm học sinh vào lớp. Vui lòng kiểm tra lại mã lớp.");
    }
  });

  panel.classList.add("is-open");
}

// ===============================
// 5. HELPER
// ===============================
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildFullName(ho, tenDem, ten) {
  const parts = [];
  if (ho) parts.push(ho.trim());
  if (tenDem) parts.push(tenDem.trim());
  if (ten) parts.push(ten.trim());
  return parts.join(" ");
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const s = String(dateStr);
  return s.length > 10 ? s.substring(0, 10) : s;
}

function formatDateTime(dtStr) {
  if (!dtStr) return "-";
  const s = String(dtStr).replace("T", " ");
  return s.length > 16 ? s.substring(0, 16) : s;
}

function formatDateRange(from, to) {
  if (!from && !to) return "-";
  const f = from ? formatDate(from) : "";
  const t = to ? formatDate(to) : "";
  if (f && t) return `${f} - ${t}`;
  return f || t || "-";
}

// ===============================
// 6. TAB BÀI TẬP
// ===============================
function setupAssignmentFilters() {
  const programSelect = document.getElementById("filter-assign-program");
  const btnApply = document.getElementById("btn-assign-apply-filter");

  if (programSelect) {
    programSelect.addEventListener("change", () => {
      renderAssignClassOptions();
    });
  }

  if (btnApply) {
    btnApply.addEventListener("click", () => {
      loadAssignmentList().catch((err) =>
        console.error("Lỗi load danh sách bài tập:", err)
      );
    });
  }
}

async function loadAssignmentList() {
  const tbody = document.querySelector("#tbl-assignments tbody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr class="empty-row">
      <td colspan="7">Đang tải danh sách bài tập...</td>
    </tr>
  `;

  const programSelect = document.getElementById("filter-assign-program");
  const classSelect = document.getElementById("filter-assign-class");
  const fromInput = document.getElementById("filter-assign-from");
  const toInput = document.getElementById("filter-assign-to");

  const payload = {
    programId: programSelect?.value || null,
    classId: classSelect?.value || null,
    fromDate: fromInput?.value || null,
    toDate: toInput?.value || null,
  };

  try {
    const res = await apiSearchAssignments(payload);
    const items = res?.assignments || [];

    if (!items.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="7">Chưa có bài tập cho bộ lọc hiện tại.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items
      .map((a) => {
        const buoi =
          (a.tenBuoiHoc ? `${a.tenBuoiHoc}` : "") +
          (a.ngayHoc ? ` - ${formatDate(a.ngayHoc)}` : "");
        const thoiGian = formatDateRange(a.ngayBatDau, a.ngayKetThuc);
        const soNop = `${a.soLuongNop ?? 0}/${a.soHsTrongLop ?? ""}`;
        const diem =
          a.diemTrungBinh != null ? String(a.diemTrungBinh) : "-";

        return `
          <tr data-assignment-id="${escapeHtml(a.idBt)}">
            <td>${escapeHtml(a.tieuDe || "")}</td>
            <td>${escapeHtml(buoi || "")}</td>
            <td>${escapeHtml(a.loaiBt || "")}</td>
            <td>${escapeHtml(thoiGian)}</td>
            <td>${escapeHtml(soNop)}</td>
            <td>${escapeHtml(diem)}</td>
            <td></td>
          </tr>
        `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">Lỗi tải danh sách bài tập.</td>
      </tr>
    `;
  }
}

// ===============================
// 7. TAB BÀI NỘP & CHẤM ĐIỂM
// ===============================
function setupSubmissionFilters() {
  const programSelect = document.getElementById("filter-sub-program");
  const btnApply = document.getElementById("btn-sub-apply-filter");

  if (programSelect) {
    programSelect.addEventListener("change", () => {
      renderSubClassOptions();
    });
  }

  if (btnApply) {
    btnApply.addEventListener("click", () => {
      loadSubmissionList().catch((err) =>
        console.error("Lỗi load danh sách bài nộp:", err)
      );
    });
  }
}

async function loadSubmissionList() {
  const tbody = document.querySelector("#tbl-submission-list tbody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr class="empty-row">
      <td colspan="7">Đang tải danh sách bài nộp...</td>
    </tr>
  `;

  const programSelect = document.getElementById("filter-sub-program");
  const classSelect = document.getElementById("filter-sub-class");
  const assignmentSelect = document.getElementById("filter-sub-assignment");
  const statusSelect = document.getElementById("filter-sub-status");

  const payload = {
    programId: programSelect?.value || null,
    classId: classSelect?.value || null,
    assignmentId: assignmentSelect?.value || null,
    status: statusSelect?.value || null,
  };

  try {
    const res = await apiSearchSubmissions(payload);
    const items = res?.submissions || [];

    if (!items.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="7">Chưa có dữ liệu bài nộp.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items
      .map((s) => {
        const diem = s.diemSo != null ? String(s.diemSo) : "-";
        const lop = s.tenLop || s.idLh || "";
        const fileCell = s.fileUrl
          ? `<a href="${escapeHtml(
              s.fileUrl
            )}" target="_blank" rel="noopener noreferrer">Xem file</a>`
          : "-";

        return `
          <tr data-submission-id="${escapeHtml(s.idBn)}">
            <td>${escapeHtml(s.tenHs || s.idHs || "")}</td>
            <td>${escapeHtml(lop)}</td>
            <td>${escapeHtml(s.tieuDeBt || "")}</td>
            <td>${fileCell}</td>
            <td>${escapeHtml(diem)}</td>
            <td>${escapeHtml(s.trangThai || "")}</td>
            <td></td>
          </tr>
        `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">Lỗi tải danh sách bài nộp.</td>
      </tr>
    `;
  }
}

// ===============================
// 8. TAB ĐÁNH GIÁ & KẾT QUẢ
// ===============================
function setupResultsFilters() {
  const btnApply = document.getElementById("btn-res-apply-filter");
  if (!btnApply) return;

  btnApply.addEventListener("click", () => {
    loadResultsData().catch((err) =>
      console.error("Lỗi load Đánh giá & Kết quả:", err)
    );
  });
}

async function loadResultsData() {
  const classSelect = document.getElementById("filter-res-class");
  const classId = classSelect?.value || null;

  const ratingTbody = document.querySelector("#tbl-class-rating tbody");
  const resultTbody = document.querySelector("#tbl-result-list tbody");

  if (!ratingTbody || !resultTbody) return;

  if (!classId) {
    ratingTbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">Hãy chọn một lớp để xem đánh giá.</td>
      </tr>
    `;
    resultTbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">Hãy chọn một lớp để xem kết quả.</td>
      </tr>
    `;
    return;
  }

  ratingTbody.innerHTML = `
    <tr class="empty-row">
      <td colspan="5">Đang tải đánh giá lớp học...</td>
    </tr>
  `;
  resultTbody.innerHTML = `
    <tr class="empty-row">
      <td colspan="4">Đang tải kết quả...</td>
    </tr>
  `;

  const payload = { classId };

  try {
    const res = await apiGetClassEvaluation(payload);
    const classEvals = res?.classEvaluations || [];
    const classResults = res?.classResults || [];

    // Đánh giá lớp
    if (!classEvals.length) {
      ratingTbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="5">Chưa có đánh giá lớp học.</td>
        </tr>
      `;
    } else {
      ratingTbody.innerHTML = classEvals
        .map((e) => {
          const time = e.thoiDiemDanhGia
            ? formatDateTime(e.thoiDiemDanhGia)
            : "-";
          const lop = e.tenLop || e.idLh || "";
          return `
            <tr>
              <td>${escapeHtml(e.tenHs || e.idHs || "")}</td>
              <td>${escapeHtml(lop)}</td>
              <td>${escapeHtml(
                e.diemDanhGia != null ? String(e.diemDanhGia) : "-"
              )}</td>
              <td>${escapeHtml(e.nhanXet || "")}</td>
              <td>${escapeHtml(time)}</td>
            </tr>
          `;
        })
        .join("");
    }

    // Kết quả & xếp loại
    if (!classResults.length) {
      resultTbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="4">Chưa có kết quả kết thúc khóa.</td>
        </tr>
      `;
    } else {
      resultTbody.innerHTML = classResults
        .map((r) => {
          const lop = r.tenLop || "";
          return `
            <tr>
              <td>${escapeHtml(r.tenHs || r.idHs || "")}</td>
              <td>${escapeHtml(lop)}</td>
              <td>${escapeHtml(
                r.diemKetQua != null ? String(r.diemKetQua) : "-"
              )}</td>
              <td>${escapeHtml(r.xepLoai || "")}</td>
            </tr>
          `;
        })
        .join("");
    }
  } catch (err) {
    console.error(err);
    ratingTbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">Lỗi tải đánh giá lớp học.</td>
      </tr>
    `;
    resultTbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">Lỗi tải kết quả.</td>
      </tr>
    `;
  }
}