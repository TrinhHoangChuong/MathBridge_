// portal/admin/js/pages/lichhoc.pages.js
// Logic FE cho module "Lịch học & Lịch làm"

import {
  apiGetClassOptions,
  apiGetClassDetail,
  apiSearchClassSchedule,
  apiAutoGenerateSchedule,
  apiGetCampuses,
  apiGetRoomsByCampus,
  apiGetTeacherOptions,
  apiSearchTeacherSchedule,
  apiGetStudentOptions,
  apiSearchStudentSchedule,
  apiUpdateSession,
} from "../api/lichhoc.api.js";

let classScheduleCache = []; // cache lịch lớp (dùng cho nút Sửa)
/**
 * Entry chính, được gọi từ admin.js sau khi load lichhoc.html.
 */
export async function initLichHocPage() {
  setupTabs();
  setupHeaderAutoGenerateShortcut();

  await Promise.all([
    initClassView(),
    initTeacherView(),
    initStudentView(),
  ]).catch((err) => {
    console.error("[LICHHOC INIT ERROR]", err);
  });
}

/* ==========================
 *  Tabs switching
 * ========================== */

function setupTabs() {
  const tabs = document.querySelectorAll(".lh-tab");
  const views = document.querySelectorAll(".lh-view");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const view = tab.getAttribute("data-view");
      tabs.forEach((t) => t.classList.remove("active"));
      views.forEach((v) => v.classList.remove("active"));

      tab.classList.add("active");
      const targetView = document.querySelector(
        `.lh-view[data-view="${view}"]`
      );
      if (targetView) {
        targetView.classList.add("active");
      }
    });
  });
}

/**
 * Nút ở header để cuộn xuống khu auto-generate.
 */
function setupHeaderAutoGenerateShortcut() {
  const btn = document.getElementById("lh-btn-auto-generate");
  const section = document.getElementById("lh-auto-section");
  if (!btn || !section) return;

  btn.addEventListener("click", () => {
    const classTabBtn = document.querySelector('.lh-tab[data-view="class"]');
    if (classTabBtn && !classTabBtn.classList.contains("active")) {
      classTabBtn.click();
    }

    section.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/* ==========================
 *  CLASS VIEW
 * ========================== */

let classOptionsCache = [];
let campusOptionsCache = [];
const roomOptionsByCampus = new Map();

// refs modal chỉnh sửa buổi
const editModalRefs = {
  backdrop: null,
  idBhInput: null,
  dateInput: null,
  startInput: null,
  endInput: null,
  campusSelect: null,
  roomSelect: null,
  tenCaInput: null,
  noiDungInput: null,
  ghiChuInput: null,
  closeBtn: null,
  cancelBtn: null,
  saveBtn: null,
};

async function initClassView() {
  await loadClassDropdowns();
  await loadCampusDropdown();
  setupClassFilterHandlers();
  setupAutoGenerateHandlers();
  setupEditSessionModal(); // chuẩn bị modal chỉnh sửa buổi
}

/**
 * Load dropdown lớp cho cả filter & auto-generate.
 */
async function loadClassDropdowns() {
  const filterSelect = document.getElementById("lh-class-filter");
  const autoSelect = document.getElementById("lh-auto-class");

  if (!filterSelect || !autoSelect) return;

  try {
    const data = await apiGetClassOptions();
    classOptionsCache = Array.isArray(data) ? data : [];

    const makeOptionLabel = (item) =>
      item.tenLop
        ? `${item.tenLop} (${item.idLh})`
        : item.idLh || "Lớp không tên";

    const createOptions = (select) => {
      select.innerHTML = '<option value="">-- Chọn lớp --</option>';
      classOptionsCache.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.idLh;
        opt.textContent = makeOptionLabel(item);
        select.appendChild(opt);
      });
    };

    createOptions(filterSelect);
    createOptions(autoSelect);
  } catch (err) {
    console.error("Không thể tải danh sách lớp:", err);
  }
}

/**
 * Load dropdown cơ sở cho auto-generate.
 */
async function loadCampusDropdown() {
  const campusSelect = document.getElementById("lh-auto-campus");
  if (!campusSelect) return;

  try {
    const data = await apiGetCampuses();
    campusOptionsCache = Array.isArray(data) ? data : [];

    campusSelect.innerHTML = '<option value="">-- Chọn cơ sở --</option>';
    campusOptionsCache.forEach((cs) => {
      const opt = document.createElement("option");
      opt.value = cs.idCs; // ID_CS
      opt.textContent = cs.tenCoSo || `${cs.idCs} - ${cs.tenCoSo}`;
      campusSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Không thể tải danh sách cơ sở:", err);
  }

  campusSelect.addEventListener("change", async () => {
    const idCs = campusSelect.value;
    await loadRoomsByCampus(idCs);
  });
}

/**
 * Load phòng theo cơ sở (auto-generate).
 */
async function loadRoomsByCampus(idCs) {
  const roomSelect = document.getElementById("lh-auto-room");
  if (!roomSelect) return;

  roomSelect.innerHTML = '<option value="">-- Chọn phòng --</option>';
  roomSelect.disabled = true;

  if (!idCs) return;

  try {
    if (roomOptionsByCampus.has(idCs)) {
      const cached = roomOptionsByCampus.get(idCs);
      populateRoomOptions(roomSelect, cached);
      return;
    }

    const data = await apiGetRoomsByCampus(idCs);
    const rooms = Array.isArray(data) ? data : [];
    roomOptionsByCampus.set(idCs, rooms);
    populateRoomOptions(roomSelect, rooms);
  } catch (err) {
    console.error("Không thể tải danh sách phòng:", err);
  }
}

// cho auto-generate & modal edit (selectedIdPhong optional)
function populateRoomOptions(select, rooms, selectedIdPhong) {
  select.innerHTML = '<option value="">-- Chọn phòng --</option>';
  (rooms || []).forEach((room) => {
    const opt = document.createElement("option");
    opt.value = room.idPhong; // ID_Phong
    opt.textContent =
      room.tenPhong ||
      `${room.idPhong}${room.tang ? ` - Tầng ${room.tang}` : ""}`;
    if (selectedIdPhong && room.idPhong === selectedIdPhong) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
  select.disabled = false;
}

/**
 * Xử lý filter lịch lớp.
 */
function setupClassFilterHandlers() {
  const filterBtn = document.getElementById("lh-class-filter-btn");
  const resetBtn = document.getElementById("lh-class-reset-btn");

  if (filterBtn) {
    filterBtn.addEventListener("click", () => refreshClassSchedule());
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const classSelect = document.getElementById("lh-class-filter");
      const from = document.getElementById("lh-class-from-date");
      const to = document.getElementById("lh-class-to-date");
      if (classSelect) classSelect.value = "";
      if (from) from.value = "";
      if (to) to.value = "";
      clearClassScheduleTable();
    });
  }

  // Tự load lịch khi chọn lớp
  const select = document.getElementById("lh-class-filter");
  if (select) {
    select.addEventListener("change", () => refreshClassSchedule());
  }
}

/**
 * Load chi tiết lớp khi chọn ở form auto-generate.
 */
function setupAutoGenerateHandlers() {
  const classSelect = document.getElementById("lh-auto-class");
  const soBuoiInput = document.getElementById("lh-auto-so-buoi");
  const loaiNgayInput = document.getElementById("lh-auto-loai-ngay");
  const ngayBdInput = document.getElementById("lh-auto-ngay-bat-dau");
  const hinhThucInput = document.getElementById("lh-auto-hinh-thuc");

  if (classSelect) {
    classSelect.addEventListener("change", async () => {
      const idLh = classSelect.value;
      if (!idLh) {
        if (soBuoiInput) soBuoiInput.value = "";
        if (loaiNgayInput) loaiNgayInput.value = "";
        if (ngayBdInput) ngayBdInput.value = "";
        if (hinhThucInput) hinhThucInput.value = "";
        return;
      }

      try {
        const detail = await apiGetClassDetail(idLh);
        if (soBuoiInput && detail.soBuoi != null) {
          soBuoiInput.value = detail.soBuoi;
        }
        if (loaiNgayInput && detail.loaiNgay) {
          loaiNgayInput.value = detail.loaiNgay;
        }
        if (ngayBdInput && detail.ngayBatDau) {
          ngayBdInput.value = detail.ngayBatDau.substring(0, 10);
        }
        if (hinhThucInput && detail.hinhThucHoc) {
          hinhThucInput.value = detail.hinhThucHoc;
        }
      } catch (err) {
        console.error("Không thể tải chi tiết lớp:", err);
      }
    });
  }

  // Map ca học -> giờ
  const shiftSelect = document.getElementById("lh-auto-shift");
  const gioBdInput = document.getElementById("lh-auto-gio-bat-dau");
  const gioKtInput = document.getElementById("lh-auto-gio-ket-thuc");

  if (shiftSelect) {
    shiftSelect.addEventListener("change", () => {
      const val = shiftSelect.value;
      if (!gioBdInput || !gioKtInput) return;

      if (val === "SANG_08_10") {
        gioBdInput.value = "08:00";
        gioKtInput.value = "10:00";
      } else if (val === "CHIEU_14_16") {
        gioBdInput.value = "14:00";
        gioKtInput.value = "16:00";
      } else if (val === "TOI_18_20") {
        gioBdInput.value = "18:00";
        gioKtInput.value = "20:00";
      }
    });
  }

  const submitBtn = document.getElementById("lh-auto-generate-submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", onAutoGenerateSubmit);
  }
}

/**
 * Modal chỉnh sửa buổi học – lấy refs & gắn event.
 */
function setupEditSessionModal() {
  editModalRefs.backdrop = document.getElementById("lh-edit-modal-backdrop");
  if (!editModalRefs.backdrop) {
    // nếu chưa thêm HTML modal thì bỏ qua
    return;
  }

  editModalRefs.idBhInput = document.getElementById("lh-edit-idBh");
  editModalRefs.dateInput = document.getElementById("lh-edit-date");
  editModalRefs.startInput = document.getElementById("lh-edit-start");
  editModalRefs.endInput = document.getElementById("lh-edit-end");
  editModalRefs.campusSelect = document.getElementById("lh-edit-campus");
  editModalRefs.roomSelect = document.getElementById("lh-edit-room");
  editModalRefs.tenCaInput = document.getElementById("lh-edit-tenCa");
  editModalRefs.noiDungInput = document.getElementById("lh-edit-noiDung");
  editModalRefs.ghiChuInput = document.getElementById("lh-edit-ghiChu");
  editModalRefs.closeBtn = document.getElementById("lh-edit-modal-close");
  editModalRefs.cancelBtn = document.getElementById("lh-edit-modal-cancel");
  editModalRefs.saveBtn = document.getElementById("lh-edit-modal-save");

  const { backdrop, closeBtn, cancelBtn, campusSelect, roomSelect, saveBtn } =
    editModalRefs;

  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeEditSessionModal();
      }
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", closeEditSessionModal);
  }
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeEditSessionModal);
  }

  if (campusSelect && roomSelect) {
    campusSelect.addEventListener("change", async () => {
      const idCs = campusSelect.value;
      await populateRoomsForEditModal(idCs, null);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", onEditSessionSave);
  }
}

/**
 * Gọi API auto-generate schedule.
 */
async function onAutoGenerateSubmit() {
  const statusEl = document.getElementById("lh-auto-status");
  const classSelect = document.getElementById("lh-auto-class");
  const soBuoiInput = document.getElementById("lh-auto-so-buoi");
  const loaiNgayInput = document.getElementById("lh-auto-loai-ngay");
  const ngayBdInput = document.getElementById("lh-auto-ngay-bat-dau");
  const hinhThucInput = document.getElementById("lh-auto-hinh-thuc");
  const campusSelect = document.getElementById("lh-auto-campus");
  const roomSelect = document.getElementById("lh-auto-room");
  const shiftSelect = document.getElementById("lh-auto-shift");
  const gioBdInput = document.getElementById("lh-auto-gio-bat-dau");
  const gioKtInput = document.getElementById("lh-auto-gio-ket-thuc");

  if (!classSelect || !statusEl) return;

  const idLh = classSelect.value;
  if (!idLh) {
    setStatus(statusEl, "Vui lòng chọn lớp.", "error");
    return;
  }

  const soBuoi = soBuoiInput?.value;
  const loaiNgay = loaiNgayInput?.value;
  const ngayBatDau = ngayBdInput?.value;
  const hinhThucHoc = hinhThucInput?.value;
  const idCs = campusSelect?.value;
  const idPhong = roomSelect?.value;
  const tenCaHoc =
    shiftSelect?.options[shiftSelect.selectedIndex || 0]?.textContent || "";

  const gioBatDau = gioBdInput?.value;
  const gioKetThuc = gioKtInput?.value;

  if (!soBuoi || !loaiNgay || !ngayBatDau) {
    setStatus(
      statusEl,
      "Thiếu thông tin lớp: Số buổi, Loại ngày, Ngày bắt đầu.",
      "error"
    );
    return;
  }

  if (!gioBatDau || !gioKetThuc) {
    setStatus(
      statusEl,
      "Vui lòng chọn ca học hoặc nhập giờ bắt/ kết thúc.",
      "error"
    );
    return;
  }

  if (!idCs || !idPhong) {
    setStatus(statusEl, "Vui lòng chọn cơ sở và phòng học.", "error");
    return;
  }

  setStatus(statusEl, "Đang tạo lịch tự động cho lớp...", null);

  try {
    const payload = {
      idLh,
      soBuoi: Number(soBuoi),
      loaiNgay,
      ngayBatDau, // ISO date string
      hinhThucHoc,
      idCs,
      idPhong,
      tenCaHoc,
      gioBatDau,
      gioKetThuc,
    };

    const result = await apiAutoGenerateSchedule(payload);

    const created = result?.createdCount ?? 0;
    const skipped = result?.skippedCount ?? 0;
    const conflicts = Array.isArray(result?.conflicts)
      ? result.conflicts
      : [];

    let msg = `Đã tạo ${created} buổi học mới`;
    if (skipped > 0) msg += `, bỏ qua ${skipped} buổi đã tồn tại`;
    if (conflicts.length > 0) {
      msg += `. Có ${conflicts.length} xung đột (phòng / giáo viên).`;
    }

    setStatus(statusEl, msg, "success");

    // Reload bảng lịch lớp nếu filter đang chọn đúng lớp này
    const currentFilterSelect = document.getElementById("lh-class-filter");
    if (currentFilterSelect && currentFilterSelect.value === idLh) {
      await refreshClassSchedule();
    }
  } catch (err) {
    console.error("Auto-generate schedule error", err);
    setStatus(
      statusEl,
      err?.message || "Không thể tạo lịch tự động cho lớp",
      "error"
    );
  }
}

function setStatus(el, text, type) {
  el.textContent = text || "";
  el.classList.remove("success", "error");
  if (type) el.classList.add(type);
}

/**
 * Load lịch lớp (BuoiHocChiTiet) cho lớp được chọn.
 */
async function refreshClassSchedule() {
  const classSelect = document.getElementById("lh-class-filter");
  const fromInput = document.getElementById("lh-class-from-date");
  const toInput = document.getElementById("lh-class-to-date");

  if (!classSelect) return;

  const idLh = classSelect.value;
  if (!idLh) {
    clearClassScheduleTable();
    return;
  }

  const payload = {
    idLh,
    fromDate: fromInput?.value || null,
    toDate: toInput?.value || null,
  };

  try {
    const data = await apiSearchClassSchedule(payload);
    renderClassScheduleTable(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Không thể tải lịch lớp:", err);
    clearClassScheduleTable();
  }
}

function clearClassScheduleTable() {
  renderClassScheduleTable([]);
}

/**
 * Render bảng lịch lớp + cột Hành động (Sửa).
 */
function renderClassScheduleTable(items) {
  const table = document.querySelector("#lh-class-schedule-table");
  if (!table) return;

  const tbody = table.querySelector("tbody");
  const wrapper = table.closest(".lh-table-wrapper");
  const empty = document.getElementById("lh-class-empty-state");

  if (!tbody || !wrapper || !empty) return;

  classScheduleCache = Array.isArray(items) ? items : [];

  tbody.innerHTML = "";

  if (!classScheduleCache.length) {
    wrapper.classList.add("empty");
    return;
  }

  wrapper.classList.remove("empty");

  classScheduleCache.forEach((item) => {
    const tr = document.createElement("tr");
    tr.dataset.idBh = item.idBh || "";

    const buoiCell = document.createElement("td");
    buoiCell.textContent = item.thuTuBuoiHoc ?? "";
    tr.appendChild(buoiCell);

    const ngayCell = document.createElement("td");
    ngayCell.textContent = formatDate(item.ngayHoc);
    tr.appendChild(ngayCell);

    const gioCell = document.createElement("td");
    gioCell.textContent = `${formatTime(item.gioBatDau)} - ${formatTime(
      item.gioKetThuc
    )}`;
    tr.appendChild(gioCell);

    const caCell = document.createElement("td");
    caCell.textContent = item.tenCaHoc || "";
    tr.appendChild(caCell);

    const phongCell = document.createElement("td");
    phongCell.textContent = item.tenPhong || item.idPhong || "";
    tr.appendChild(phongCell);

    const csCell = document.createElement("td");
    csCell.textContent = item.tenCoSo || item.idCs || "";
    tr.appendChild(csCell);

    const ndCell = document.createElement("td");
    ndCell.textContent = item.noiDung || "";
    tr.appendChild(ndCell);

    const gcCell = document.createElement("td");
    gcCell.textContent = item.ghiChu || "";
    tr.appendChild(gcCell);

    // cột Hành động: nút Sửa
    const actionCell = document.createElement("td");
    actionCell.className = "lh-table-actions";
    actionCell.innerHTML = `
      <button
        type="button"
        class="lh-action-btn lh-session-edit-btn"
        title="Chỉnh sửa buổi học"
        data-id-bh="${item.idBh || ""}"
      >
        <i class="ri-edit-2-line"></i>
      </button>
    `;
    tr.appendChild(actionCell);

    tbody.appendChild(tr);
  });

  // gắn event cho nút Sửa
  tbody.querySelectorAll(".lh-session-edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idBh = btn.getAttribute("data-id-bh");
      const session = classScheduleCache.find((s) => s.idBh === idBh);
      if (session) {
        openEditSessionModal(session);
      }
    });
  });
}

/**
 * Mở modal chỉnh sửa buổi học, pre-fill dữ liệu từ session.
 */
async function openEditSessionModal(session) {
  const {
    backdrop,
    idBhInput,
    dateInput,
    startInput,
    endInput,
    campusSelect,
    tenCaInput,
    noiDungInput,
    ghiChuInput,
  } = editModalRefs;

  if (!backdrop || !idBhInput) {
    // chưa khai báo modal trong HTML
    return;
  }

  idBhInput.value = session.idBh || "";
  if (dateInput) {
    dateInput.value = normalizeDateForInput(session.ngayHoc);
  }
  if (startInput) {
    startInput.value = normalizeTimeForInput(session.gioBatDau);
  }
  if (endInput) {
    endInput.value = normalizeTimeForInput(session.gioKetThuc);
  }
  if (tenCaInput) {
    tenCaInput.value = session.tenCaHoc || "";
  }
  if (noiDungInput) {
    noiDungInput.value = session.noiDung || "";
  }
  if (ghiChuInput) {
    ghiChuInput.value = session.ghiChu || "";
  }

  await populateCampusForEditModal(session.idCs, session.idPhong);

  backdrop.hidden = false;
}

function closeEditSessionModal() {
  if (editModalRefs.backdrop) {
    editModalRefs.backdrop.hidden = true;
  }
}

/**
 * Fill dropdown cơ sở & phòng cho modal edit.
 */
async function populateCampusForEditModal(selectedIdCs, selectedIdPhong) {
  const { campusSelect } = editModalRefs;
  if (!campusSelect) return;

  // đảm bảo đã có danh sách cơ sở
  if (!campusOptionsCache || !campusOptionsCache.length) {
    try {
      const data = await apiGetCampuses();
      campusOptionsCache = Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Không thể tải danh sách cơ sở (edit):", err);
    }
  }

  campusSelect.innerHTML = '<option value="">-- Chọn cơ sở --</option>';
  campusOptionsCache.forEach((cs) => {
    const opt = document.createElement("option");
    opt.value = cs.idCs;
    opt.textContent = cs.tenCoSo || cs.idCs;
    if (selectedIdCs && cs.idCs === selectedIdCs) {
      opt.selected = true;
    }
    campusSelect.appendChild(opt);
  });

  const idCsToUse = selectedIdCs || campusSelect.value || "";
  await populateRoomsForEditModal(idCsToUse, selectedIdPhong);
}

async function populateRoomsForEditModal(idCs, selectedIdPhong) {
  const { roomSelect } = editModalRefs;
  if (!roomSelect) return;

  roomSelect.innerHTML = '<option value="">-- Chọn phòng --</option>';

  if (!idCs) return;

  let rooms = [];
  if (roomOptionsByCampus.has(idCs)) {
    rooms = roomOptionsByCampus.get(idCs) || [];
  } else {
    try {
      const data = await apiGetRoomsByCampus(idCs);
      rooms = Array.isArray(data) ? data : [];
      roomOptionsByCampus.set(idCs, rooms);
    } catch (err) {
      console.error("Không thể tải danh sách phòng (edit):", err);
    }
  }

  populateRoomOptions(roomSelect, rooms, selectedIdPhong);
}

/**
 * Lưu thay đổi buổi học -> gọi BE updateSession.
 */
async function onEditSessionSave() {
  const {
    idBhInput,
    dateInput,
    startInput,
    endInput,
    roomSelect,
    tenCaInput,
    noiDungInput,
    ghiChuInput,
  } = editModalRefs;

  if (!idBhInput) return;

  const idBh = idBhInput.value;
  if (!idBh) {
    alert("Thiếu ID buổi học.");
    return;
  }

  const ngayHoc = dateInput?.value;
  const gioBatDau = startInput?.value;
  const gioKetThuc = endInput?.value;
  const idPhong = roomSelect?.value;

  if (!ngayHoc || !gioBatDau || !gioKetThuc || !idPhong) {
    alert("Vui lòng nhập đầy đủ ngày, giờ và phòng học.");
    return;
  }

  const payload = {
    idPhong,
    ngayHoc, // "yyyy-MM-dd"
    gioBatDau, // "HH:mm"
    gioKetThuc, // "HH:mm"
    tenCaHoc: tenCaInput?.value || null,
    noiDung: noiDungInput?.value || null,
    ghiChu: ghiChuInput?.value || null,
  };

  try {
    const res = await apiUpdateSession(idBh, payload);

    const conflicts = Array.isArray(res?.conflicts) ? res.conflicts : [];
    if (conflicts.length > 0) {
      const msg = conflicts
        .map((c) => c.message || "Xung đột lịch")
        .join("\n");
      alert("Không thể cập nhật vì:\n" + msg);
      return;
    }

    closeEditSessionModal();
    await refreshClassSchedule();
  } catch (err) {
    console.error("[LICHHOC] Không thể cập nhật buổi học:", err);
    alert(err?.message || "Không thể cập nhật buổi học");
  }
}

/* ==========================
 *  TEACHER VIEW
 * ========================== */

let teacherOptionsCache = [];

async function initTeacherView() {
  await loadTeacherDropdown();
  setupTeacherFilterHandlers();
}

async function loadTeacherDropdown() {
  const select = document.getElementById("lh-teacher-filter");
  if (!select) return;

  try {
    const data = await apiGetTeacherOptions();
    teacherOptionsCache = Array.isArray(data) ? data : [];

    select.innerHTML = '<option value="">-- Chọn giáo viên --</option>';
    teacherOptionsCache.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.idNv;
      opt.textContent =
        t.hoTen || `${t.idNv}${t.email ? ` (${t.email})` : ""}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Không thể tải danh sách giáo viên:", err);
  }
}

function setupTeacherFilterHandlers() {
  const filterBtn = document.getElementById("lh-teacher-filter-btn");
  const resetBtn = document.getElementById("lh-teacher-reset-btn");
  const select = document.getElementById("lh-teacher-filter");

  if (filterBtn) {
    filterBtn.addEventListener("click", () => refreshTeacherSchedule());
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const from = document.getElementById("lh-teacher-from-date");
      const to = document.getElementById("lh-teacher-to-date");
      if (select) select.value = "";
      if (from) from.value = "";
      if (to) to.value = "";
      renderTeacherScheduleTable([]);
    });
  }

  if (select) {
    select.addEventListener("change", () => refreshTeacherSchedule());
  }
}

async function refreshTeacherSchedule() {
  const select = document.getElementById("lh-teacher-filter");
  const from = document.getElementById("lh-teacher-from-date");
  const to = document.getElementById("lh-teacher-to-date");
  if (!select) return;

  const idNv = select.value;
  if (!idNv) {
    renderTeacherScheduleTable([]);
    return;
  }

  const payload = {
    idNv,
    fromDate: from?.value || null,
    toDate: to?.value || null,
  };

  try {
    const data = await apiSearchTeacherSchedule(payload);
    renderTeacherScheduleTable(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Không thể tải lịch giáo viên:", err);
    renderTeacherScheduleTable([]);
  }
}

function renderTeacherScheduleTable(items) {
  const tbody = document.querySelector("#lh-teacher-schedule-table tbody");
  const wrapper = document
    .querySelector("#lh-teacher-schedule-table")
    .closest(".lh-table-wrapper");
  const empty = document.getElementById("lh-teacher-empty-state");

  if (!tbody || !wrapper || !empty) return;

  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    wrapper.classList.add("empty");
    return;
  }

  wrapper.classList.remove("empty");

  items.forEach((i) => {
    const tr = document.createElement("tr");

    const ngayCell = document.createElement("td");
    ngayCell.textContent = formatDate(i.ngayHoc);
    tr.appendChild(ngayCell);

    const gioCell = document.createElement("td");
    gioCell.textContent = `${formatTime(i.gioBatDau)} - ${formatTime(
      i.gioKetThuc
    )}`;
    tr.appendChild(gioCell);

    const lopCell = document.createElement("td");
    lopCell.textContent = i.tenLop || i.idLh || "";
    tr.appendChild(lopCell);

    const ctCell = document.createElement("td");
    ctCell.textContent = i.tenChuongTrinh || i.idCt || "";
    tr.appendChild(ctCell);

    const phongCell = document.createElement("td");
    phongCell.textContent = i.tenPhong || i.idPhong || "";
    tr.appendChild(phongCell);

    const csCell = document.createElement("td");
    csCell.textContent = i.tenCoSo || i.idCs || "";
    tr.appendChild(csCell);

    tbody.appendChild(tr);
  });
}

/* ==========================
 *  STUDENT VIEW
 * ========================== */

let studentOptionsCache = [];

async function initStudentView() {
  await loadStudentDropdown();
  setupStudentFilterHandlers();
}

async function loadStudentDropdown() {
  const select = document.getElementById("lh-student-filter");
  if (!select) return;

  try {
    const data = await apiGetStudentOptions();
    studentOptionsCache = Array.isArray(data) ? data : [];

    select.innerHTML = '<option value="">-- Chọn học sinh --</option>';
    studentOptionsCache.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.idHs;
      opt.textContent =
        s.hoTen || `${s.idHs}${s.email ? ` (${s.email})` : ""}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Không thể tải danh sách học sinh:", err);
  }
}

function setupStudentFilterHandlers() {
  const filterBtn = document.getElementById("lh-student-filter-btn");
  const resetBtn = document.getElementById("lh-student-reset-btn");
  const select = document.getElementById("lh-student-filter");

  if (filterBtn) {
    filterBtn.addEventListener("click", () => refreshStudentSchedule());
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const from = document.getElementById("lh-student-from-date");
      const to = document.getElementById("lh-student-to-date");
      if (select) select.value = "";
      if (from) from.value = "";
      if (to) to.value = "";
      renderStudentScheduleTable([]);
    });
  }

  if (select) {
    select.addEventListener("change", () => refreshStudentSchedule());
  }
}

async function refreshStudentSchedule() {
  const select = document.getElementById("lh-student-filter");
  const from = document.getElementById("lh-student-from-date");
  const to = document.getElementById("lh-student-to-date");
  if (!select) return;

  const idHs = select.value;
  if (!idHs) {
    renderStudentScheduleTable([]);
    return;
  }

  const payload = {
    idHs,
    fromDate: from?.value || null,
    toDate: to?.value || null,
  };

  try {
    const data = await apiSearchStudentSchedule(payload);
    renderStudentScheduleTable(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Không thể tải lịch học sinh:", err);
    renderStudentScheduleTable([]);
  }
}

function renderStudentScheduleTable(items) {
  const tbody = document.querySelector("#lh-student-schedule-table tbody");
  const wrapper = document
    .querySelector("#lh-student-schedule-table")
    .closest(".lh-table-wrapper");
  const empty = document.getElementById("lh-student-empty-state");

  if (!tbody || !wrapper || !empty) return;

  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    wrapper.classList.add("empty");
    return;
  }

  wrapper.classList.remove("empty");

  items.forEach((i) => {
    const tr = document.createElement("tr");

    const ngayCell = document.createElement("td");
    ngayCell.textContent = formatDate(i.ngayHoc);
    tr.appendChild(ngayCell);

    const gioCell = document.createElement("td");
    gioCell.textContent = `${formatTime(i.gioBatDau)} - ${formatTime(
      i.gioKetThuc
    )}`;
    tr.appendChild(gioCell);

    const lopCell = document.createElement("td");
    lopCell.textContent = i.tenLop || i.idLh || "";
    tr.appendChild(lopCell);

    const ctCell = document.createElement("td");
    ctCell.textContent = i.tenChuongTrinh || i.idCt || "";
    tr.appendChild(ctCell);

    const phongCell = document.createElement("td");
    phongCell.textContent = i.tenPhong || i.idPhong || "";
    tr.appendChild(phongCell);

    const csCell = document.createElement("td");
    csCell.textContent = i.tenCoSo || i.idCs || "";
    tr.appendChild(csCell);

    tbody.appendChild(tr);
  });
}

/* ==========================
 *  Helpers format date/time
 * ========================== */

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const dd = `${d.getDate()}`.padStart(2, "0");
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    const hh = `${d.getHours()}`.padStart(2, "0");
    const mi = `${d.getMinutes()}`.padStart(2, "0");
    return `${hh}:${mi}`;
  }

  // Nếu BE trả về "HH:mm" thuần text, giữ nguyên
  if (typeof value === "string" && value.length <= 5) return value;
  return "";
}

// Chuẩn hóa ngày cho input[type=date] từ giá trị BE trả
function normalizeDateForInput(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Chuẩn hóa giờ cho input[type=time]
function normalizeTimeForInput(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/T(\d{2}:\d{2})| (\d{2}:\d{2})/);
    if (match) return match[1] || match[2];
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const hh = `${d.getHours()}`.padStart(2, "0");
  const mi = `${d.getMinutes()}`.padStart(2, "0");
  return `${hh}:${mi}`;
}
