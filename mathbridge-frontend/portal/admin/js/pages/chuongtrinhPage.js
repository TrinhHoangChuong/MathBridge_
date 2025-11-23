//  CHUONGTRINH PAGE
import {
  apiGetAllPrograms,
  apiCreateProgram,
  apiUpdateProgram,
  apiDeleteProgram,
  apiGetProgramById,
} from "../api/programApi.js";

import {
  apiGetAllClasses,
  apiGetClassById,
  apiCreateClass,
  apiUpdateClass,
  apiDeleteClass,
} from "../api/classApi.js";

import { apiGetStaffForDropdown } from "../api/nhansu.api.js"; // lấy nhân sự từ module Nhân sự

// Hình thức học cố định (FE only, không đổi schema BE)
const CLASS_MODES = [
  { value: "Online", label: "Online" },
  { value: "Offline", label: "Offline" },
  { value: "Gia Sư", label: "Gia Sư" },
];

// Trạng thái lớp – mẫu (FE only, tuỳ chỉnh cho khớp data thật)
const CLASS_STATUS = ["Đang mở", "Đang tuyển sinh", "Tạm dừng", "Đã kết thúc"];

// State
let programsLoaded = false;
let classesLoaded = false;
let classListCache = [];

let programGridEl;
let classTbodyEl;

let editingProgramId = null;
let editingClassId = null;

// ---------------------------
// ENTRY POINT SPA
// ---------------------------
export async function initChuongTrinhPage() {
  console.log("▶ initChuongTrinhPage (Program + Class + Tabs)");

  programGridEl = document.getElementById("ct-program-list");
  classTbodyEl = document.getElementById("ct-class-tbody");

  setupTabs();
  setupProgramActions();
  setupClassActions();
  setupProgramModal();
  setupClassModal();
  setupGlobalClickCloseMenus();
}

/* ================================================================
   TABS (Chương trình / Lớp học)
================================================================ */
function setupTabs() {
  const tabProgram = document.getElementById("ctTabProgram");
  const tabClass = document.getElementById("ctTabClass");
  const panelProgram = document.getElementById("ctPanelProgram");
  const panelClass = document.getElementById("ctPanelClass");

  if (!tabProgram || !tabClass || !panelProgram || !panelClass) {
    console.warn("⛔ Thiếu element tab/panel cho Chương trình / Lớp học");
    return;
  }

  const activateTab = async (key) => {
    const isProgram = key === "program";

    tabProgram.classList.toggle("ct-tab-active", isProgram);
    tabClass.classList.toggle("ct-tab-active", !isProgram);

    panelProgram.classList.toggle("ct-tab-panel-active", isProgram);
    panelClass.classList.toggle("ct-tab-panel-active", !isProgram);

    if (isProgram && !programsLoaded) {
      await loadPrograms();
    }
    if (!isProgram && !classesLoaded) {
      await loadClasses();
    }
  };

  tabProgram.addEventListener("click", () => activateTab("program"));
  tabClass.addEventListener("click", () => activateTab("class"));

  // Mặc định vào tab Chương trình
  activateTab("program");
}

/* ================================================================
   PROGRAM SECTION
================================================================ */
function setupProgramActions() {
  const btnCard = document.getElementById("btnProgramDetail");
  const btnHeader = document.getElementById("ctAddProgramHeader");

  if (btnCard) {
    btnCard.addEventListener("click", () => {
      const tab = document.getElementById("ctTabProgram");
      if (tab) tab.click();
    });
  }

  if (btnHeader) {
    btnHeader.addEventListener("click", () => openCreateProgramForm());
  }
}

async function loadPrograms() {
  if (!programGridEl) return;

  try {
    const list = await apiGetAllPrograms();
    renderProgramList(list || []);
    programsLoaded = true;
  } catch (err) {
    console.error(err);
    alert("Không thể tải danh sách chương trình.");
  }
}

function renderProgramList(list) {
  if (!programGridEl) return;

  if (!list || list.length === 0) {
    programGridEl.innerHTML = `<p>Chưa có chương trình nào.</p>`;
    return;
  }

  const html = list
    .map(
      (p) => `
      <article class="prog-card">
        <div class="prog-title-row">
          <div>
            <h4 class="prog-title">${p.tenCT}</h4>
            <p class="prog-desc">${p.moTa ?? ""}</p>
          </div>
          <span class="prog-code">${p.idCT}</span>
        </div>
        <div class="prog-actions">
          <button class="prog-btn prog-edit" data-id="${p.idCT}">Sửa</button>
          <button class="prog-btn danger prog-delete" data-id="${p.idCT}">Xóa</button>
        </div>
      </article>
    `
    )
    .join("");

  programGridEl.innerHTML = html;

  programGridEl.querySelectorAll(".prog-edit").forEach((btn) => {
    btn.addEventListener("click", () =>
      openEditProgramForm(btn.getAttribute("data-id"))
    );
  });

  programGridEl.querySelectorAll(".prog-delete").forEach((btn) => {
    btn.addEventListener("click", () =>
      handleDeleteProgram(btn.getAttribute("data-id"))
    );
  });
}

/* ----- Modal Program ----- */
function setupProgramModal() {
  const cancelBtn = document.getElementById("ctCancelBtn");
  const form = document.getElementById("ctProgramForm");

  if (!form) {
    console.warn("⛔ Không tìm thấy form ctProgramForm");
    return;
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => closeProgramModal());
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      idCT: form.idCT.value.trim(),
      tenCT: form.tenCT.value.trim(),
      moTa: form.moTa.value.trim(),
    };

    try {
      if (editingProgramId) {
        await apiUpdateProgram(editingProgramId, {
          tenCT: payload.tenCT,
          moTa: payload.moTa,
        });
        alert("Cập nhật chương trình thành công.");
      } else {
        await apiCreateProgram(payload);
        alert("Thêm chương trình thành công.");
      }

      await loadPrograms();
      closeProgramModal();
    } catch (err) {
      console.error(err);
      alert("Không thể lưu chương trình.");
    }
  });
}

function openCreateProgramForm() {
  editingProgramId = null;

  const modal = document.getElementById("ctProgramModal");
  const titleEl = document.getElementById("ctModalTitle");
  const idInput = document.getElementById("ct-idCT");
  const tenInput = document.getElementById("ct-tenCT");
  const moTaInput = document.getElementById("ct-moTa");

  if (!modal || !idInput || !tenInput || !moTaInput) return;

  if (titleEl) titleEl.textContent = "Thêm chương trình";

  idInput.disabled = false;
  idInput.value = "";
  tenInput.value = "";
  moTaInput.value = "";

  modal.classList.remove("hidden");
}

async function openEditProgramForm(id) {
  editingProgramId = id;

  const modal = document.getElementById("ctProgramModal");
  const titleEl = document.getElementById("ctModalTitle");
  const idInput = document.getElementById("ct-idCT");
  const tenInput = document.getElementById("ct-tenCT");
  const moTaInput = document.getElementById("ct-moTa");

  if (!modal || !idInput || !tenInput || !moTaInput) return;

  try {
    const data = await apiGetProgramById(id);
    console.log("▶ Program detail from BE:", data);

    if (titleEl) titleEl.textContent = "Sửa chương trình";

    idInput.value = data.idCT;
    idInput.disabled = true;
    tenInput.value = data.tenCT ?? "";
    moTaInput.value = data.moTa ?? "";

    modal.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("Không thể tải chi tiết chương trình.");
  }
}

function closeProgramModal() {
  const modal = document.getElementById("ctProgramModal");
  if (modal) modal.classList.add("hidden");
}

async function handleDeleteProgram(id) {
  if (!id) return;
  if (!confirm("Xóa chương trình này?")) return;

  try {
    await apiDeleteProgram(id);
    await loadPrograms();
    alert("Xóa chương trình thành công.");
  } catch (err) {
    console.error(err);
    alert("Không thể xóa chương trình.");
  }
}

/* ================================================================
   CLASS SECTION
   - Table + menu 3 chấm
================================================================ */
function setupClassActions() {
  const cardBtn = document.getElementById("btnClassDetail");
  const headerBtn = document.getElementById("ctAddClassHeader");

  if (cardBtn) {
    cardBtn.addEventListener("click", () => {
      const tab = document.getElementById("ctTabClass");
      if (tab) tab.click();
    });
  }

  if (headerBtn) {
    headerBtn.addEventListener("click", () => openCreateClassForm());
  }
}

async function loadClasses() {
  if (!classTbodyEl) return;

  try {
    const list = await apiGetAllClasses();
    classListCache = Array.isArray(list) ? list : [];
    renderClassTable(classListCache);
    classesLoaded = true;
  } catch (err) {
    console.error(err);
    alert("Không thể tải danh sách lớp học.");
  }
}

function renderClassTable(list) {
  if (!classTbodyEl) return;

  if (!list || list.length === 0) {
    classTbodyEl.innerHTML =
      `<tr><td colspan="8">Chưa có lớp học nào.</td></tr>`;
    return;
  }

  const html = list
    .map(
      (cl) => `
      <tr>
        <td>
          <div class="class-name">${cl.tenLop}</div>
          <div class="class-sub">Mã lớp: ${cl.idLh}</div>
        </td>
        <td>${cl.idCt}</td>
        <td>${cl.tenNv ? `${cl.idNv} - ${cl.tenNv}` : cl.idNv ?? ""}</td>
        <td>${cl.loaiNgay} • ${cl.soBuoi} buổi</td>
        <td>${cl.hinhThucHoc ?? ""}</td>
        <td>${cl.mucGiaThang ?? ""}</td>
        <td>
          <span class="class-status">
            ${cl.trangThai ?? ""}
          </span>
        </td>
        <td class="class-actions">
          <button
            type="button"
            class="class-menu-trigger"
            data-id="${cl.idLh}"
          >
            ⋯
          </button>
          <div class="class-menu" data-id="${cl.idLh}">
            <button
              type="button"
              class="class-menu-edit"
              data-id="${cl.idLh}"
            >
              Sửa
            </button>
            <button
              type="button"
              class="class-menu-delete danger"
              data-id="${cl.idLh}"
            >
              Xóa
            </button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");

  classTbodyEl.innerHTML = html;
  bindClassRowEvents();
}

/**
 * Gợi ý mã lớp tiếp theo dựa trên classListCache
 */
function getNextClassIdFromCache() {
  if (!classListCache || classListCache.length === 0) {
    return "";
  }

  const last = classListCache[classListCache.length - 1];
  const current = last && last.idLh ? String(last.idLh) : "";
  if (!current) return "";

  const match = current.match(/^(\D*)(\d*)$/);
  if (!match) return current;

  const prefix = match[1];
  const numPart = match[2] || "";
  if (!numPart) return current;

  const length = numPart.length;
  const nextNum = String(parseInt(numPart, 10) + 1).padStart(length, "0");
  return prefix + nextNum;
}

/**
 * Đổ dữ liệu dropdown trong form Lớp học
 * - cl-idCt: danh sách chương trình từ apiGetAllPrograms()
 * - cl-idNv: dùng idNv + tenNv từ BE / Nhân sự
 * - cl-hinhThucHoc: CLASS_MODES
 * - cl-trangThai: CLASS_STATUS
 */
async function populateClassFormDropdowns() {
  const programSelect = document.getElementById("cl-idCt");
  const staffSelect = document.getElementById("cl-idNv");
  const modeSelect = document.getElementById("cl-hinhThucHoc");
  const statusSelect = document.getElementById("cl-trangThai");

  /* --------- 1. CHƯƠNG TRÌNH --------- */
  if (programSelect) {
    try {
      const programs = await apiGetAllPrograms();
      const currentValue = programSelect.value;

      programSelect.innerHTML = `<option value="">-- Chọn chương trình --</option>`;

      (programs || []).forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.idCT;
        opt.textContent = `${p.idCT} - ${p.tenCT}`;
        programSelect.appendChild(opt);
      });

      if (currentValue) {
        programSelect.value = currentValue;
      }
    } catch (err) {
      console.error("Không thể tải danh sách chương trình cho form lớp:", err);
    }
  }

  /* --------- 2. NHÂN VIÊN --------- */
  if (staffSelect) {
    try {
      const currentStaffVal = staffSelect.value;

      const staffList = await apiGetStaffForDropdown();

      staffSelect.innerHTML = "";
      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.textContent = "-- Chọn nhân viên --";
      staffSelect.appendChild(defaultOpt);

      (staffList || []).forEach((nv) => {
        if (!nv || !nv.idNv) return;

        const opt = document.createElement("option");
        opt.value = nv.idNv;

        const tenDayDu =
          nv.hoTenDayDu ||
          nv.hoTen ||
          nv.fullName ||
          [nv.ho, nv.tenDem, nv.ten].filter(Boolean).join(" ");

        opt.textContent = tenDayDu
          ? `${nv.idNv} - ${tenDayDu}`
          : nv.idNv;

        staffSelect.appendChild(opt);
      });

      if (currentStaffVal) {
        staffSelect.value = currentStaffVal;
      }
    } catch (err) {
      console.error(
        "Không thể tải danh sách nhân viên cho dropdown lớp:",
        err
      );
    }
  }

  /* --------- 3. HÌNH THỨC HỌC --------- */
  if (modeSelect && modeSelect.tagName === "SELECT") {
    const currentMode = modeSelect.value;
    modeSelect.innerHTML = `<option value="">-- Chọn hình thức --</option>`;

    CLASS_MODES.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.value;
      opt.textContent = m.label;
      modeSelect.appendChild(opt);
    });

    if (currentMode) {
      ensureSelectOption(modeSelect, currentMode, currentMode);
    }
  }

  /* --------- 4. TRẠNG THÁI LỚP --------- */
  if (statusSelect && statusSelect.tagName === "SELECT") {
    const currentStatus = statusSelect.value;
    statusSelect.innerHTML = `<option value="">-- Chọn trạng thái --</option>`;

    CLASS_STATUS.forEach((st) => {
      const opt = document.createElement("option");
      opt.value = st;
      opt.textContent = st;
      statusSelect.appendChild(opt);
    });

    if (currentStatus) {
      ensureSelectOption(statusSelect, currentStatus, currentStatus);
    }
  }
}

/* ----- menu 3 chấm + CRUD ----- */
function bindClassRowEvents() {
  if (!classTbodyEl) return;

  const triggers = classTbodyEl.querySelectorAll(".class-menu-trigger");
  const menus = classTbodyEl.querySelectorAll(".class-menu");

  const closeAllMenus = () => menus.forEach((m) => m.classList.remove("open"));

  triggers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const menu = classTbodyEl.querySelector(`.class-menu[data-id="${id}"]`);
      if (!menu) return;

      const isOpen = menu.classList.contains("open");
      closeAllMenus();
      if (!isOpen) menu.classList.add("open");
    });
  });

  classTbodyEl.querySelectorAll(".class-menu-edit").forEach((btn) => {
    btn.addEventListener("click", () =>
      openEditClassForm(btn.getAttribute("data-id"))
    );
  });

  classTbodyEl.querySelectorAll(".class-menu-delete").forEach((btn) => {
    btn.addEventListener("click", () =>
      handleDeleteClass(btn.getAttribute("data-id"))
    );
  });
}

function setupGlobalClickCloseMenus() {
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".class-menu.open")
      .forEach((m) => m.classList.remove("open"));
  });
}

/* ----- Modal Class ----- */
function setupClassModal() {
  const form = document.getElementById("ctClassForm");
  const cancelBtn = document.getElementById("clCancelBtn");

  if (!form) {
    console.warn("⛔ Không tìm thấy form ctClassForm");
    return;
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => closeClassModal());
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form));

    try {
      if (editingClassId) {
        await apiUpdateClass(editingClassId, payload);
        alert("Cập nhật lớp học thành công.");
      } else {
        await apiCreateClass(payload);
        alert("Thêm lớp học thành công.");
      }

      await loadClasses();
      closeClassModal();
    } catch (err) {
      console.error(err);
      alert("Không thể lưu lớp học.");
    }
  });
}

async function openCreateClassForm() {
  editingClassId = null;

  const modal = document.getElementById("ctClassModal");
  const titleEl = document.getElementById("ctClassModalTitle");
  const form = document.getElementById("ctClassForm");
  const idInput = document.getElementById("cl-idLh");

  if (!modal || !form || !idInput) return;

  if (titleEl) titleEl.textContent = "Thêm lớp học";

  form.reset();
  idInput.disabled = false;

  const suggestedId = getNextClassIdFromCache();
  idInput.value = suggestedId || "";

  await populateClassFormDropdowns();
  modal.classList.remove("hidden");
}

async function openEditClassForm(id) {
  editingClassId = id;

  const modal = document.getElementById("ctClassModal");
  const titleEl = document.getElementById("ctClassModalTitle");
  const idInput = document.getElementById("cl-idLh");

  if (!modal || !idInput) return;

  try {
    const data = await apiGetClassById(id);
    console.log("▶ Class detail from BE:", data);

    if (titleEl) titleEl.textContent = "Sửa lớp học";

    await populateClassFormDropdowns();

    idInput.value = data.idLh;
    idInput.disabled = true;

    const nvSelect = document.getElementById("cl-idNv");
    ensureSelectOption(nvSelect, data.idNv, data.tenNv);

    const ctSelect = document.getElementById("cl-idCt");
    ensureSelectOption(ctSelect, data.idCt, data.idCt);

    document.getElementById("cl-tenLop").value = data.tenLop ?? "";
    document.getElementById("cl-loaiNgay").value = data.loaiNgay ?? "";
    document.getElementById("cl-soBuoi").value = data.soBuoi ?? "";

    const hthSelect = document.getElementById("cl-hinhThucHoc");
    if (hthSelect) {
      if (hthSelect.tagName === "SELECT") {
        ensureSelectOption(
          hthSelect,
          data.hinhThucHoc,
          data.hinhThucHoc
        );
      } else {
        hthSelect.value = data.hinhThucHoc ?? "";
      }
    }

    const dateInput = document.getElementById("cl-ngayBatDau");
    if (dateInput) {
      dateInput.value = data.ngayBatDau
        ? data.ngayBatDau.slice(0, 10)
        : "";
    }

    const giaInput = document.getElementById("cl-mucGiaThang");
    if (giaInput) giaInput.value = data.mucGiaThang ?? "";

    const dgInput = document.getElementById("cl-danhGia");
    if (dgInput) dgInput.value = data.danhGia ?? "";

    const ttSelect = document.getElementById("cl-trangThai");
    if (ttSelect && ttSelect.tagName === "SELECT") {
      ensureSelectOption(ttSelect, data.trangThai, data.trangThai);
    } else if (ttSelect) {
      ttSelect.value = data.trangThai ?? "";
    }

    const moTaInput = document.getElementById("cl-moTa");
    if (moTaInput) moTaInput.value = data.moTa ?? "";

    modal.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("Không thể tải chi tiết lớp học.");
  }
}

function closeClassModal() {
  const modal = document.getElementById("ctClassModal");
  if (modal) modal.classList.add("hidden");
}

async function handleDeleteClass(id) {
  if (!id) return;
  if (!confirm("Xóa lớp học này?")) return;

  try {
    await apiDeleteClass(id);
    await loadClasses();
    alert("Xóa lớp học thành công.");
  } catch (err) {
    console.error(err);
    alert("Không thể xóa lớp học.");
  }
}

function ensureSelectOption(selectEl, value, label) {
  if (!selectEl || value == null || value === "") return;

  if (selectEl.tagName !== "SELECT") {
    selectEl.value = value;
    return;
  }

  const options = Array.from(selectEl.options);
  const has = options.some((opt) => String(opt.value) === String(value));

  if (!has) {
    const opt = document.createElement("option");
    opt.value = value;

    if (selectEl.id === "cl-idNv") {
      opt.textContent =
        label && String(label).trim() !== ""
          ? `${value} - ${label}`
          : value;
    } else {
      opt.textContent = label || value;
    }

    selectEl.appendChild(opt);
  }

  selectEl.value = value;
}
