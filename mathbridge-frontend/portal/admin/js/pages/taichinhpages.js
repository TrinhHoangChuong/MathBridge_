// portal/admin/js/pages/taichinhpages.js

import {
  apiSearchHoaDon,
  apiCreateHoaDon,
  apiUpdateHoaDon,
  apiDeleteHoaDon,
  apiSearchLichSuThanhToan,
  apiCreateLichSuThanhToan,
  apiUpdateLichSuThanhToan,
  apiDeleteLichSuThanhToan,
  apiGetPhuongThucThanhToanList,
  apiCreatePhuongThucThanhToan,
  apiUpdatePhuongThucThanhToan,
  apiDeletePhuongThucThanhToan,
  apiGetDropdownClasses,
  apiGetDropdownStudents,
} from "../api/taichinh.api.js";

// ====== STATE ======
let hoaDonList = [];
let lichSuList = [];
let ptList = [];

let editingHoaDonId = null;
let editingLsId = null;
let editingPtId = null;

// ====== CONSTANTS (LABEL MAP CHO TRẠNG THÁI) ======

const INVOICE_STATUS_LABELS = {
  CHO_THANH_TOAN: "Chờ thanh toán",
  DA_THANH_TOAN: "Đã thanh toán",
  QUA_HAN: "Quá hạn",
};

const PAYMENT_STATUS_LABELS = {
  DA_THANH_TOAN: "Đã thanh toán",
  HOAN_TIEN: "Hoàn tiền",
  HUY: "Hủy",
};

// ====== HELPER: LỌC UNIQUE THEO 1 KEY (DÙNG CHO TẤT CẢ DROPDOWN) ======

function uniqueBy(list, key) {
  const seen = new Set();
  const result = [];
  (list || []).forEach((item) => {
    if (!item || item[key] == null) return;
    const val = item[key];
    if (!seen.has(val)) {
      seen.add(val);
      result.push(item);
    }
  });
  return result;
}

// ====== UTILS UI ======

function showToast(message) {
  // Nếu bạn có hệ thống toast global thì hook vào đây.
  // Tạm thời dùng alert cho chắc.
  alert(message);
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("open");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("open");
}

function formatCurrency(value) {
  if (value == null || isNaN(value)) return "";
  try {
    return Number(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
}

function createStatusChip(status, type = "invoice") {
  if (!status) return "";
  const className = `tc-status-chip tc-status-${status}`;
  let icon = "ri-question-line";

  if (status === "DA_THANH_TOAN") icon = "ri-checkbox-circle-line";
  else if (status === "CHO_THANH_TOAN") icon = "ri-time-line";
  else if (status === "QUA_HAN") icon = "ri-error-warning-line";
  else if (status === "HOAN_TIEN") icon = "ri-arrow-go-back-line";
  else if (status === "HUY") icon = "ri-close-circle-line";

  return `<span class="${className}">
    <i class="${icon}"></i>
    <span>${status}</span>
  </span>`;
}

function safeDateStr(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    if (typeof value === "string") {
      return value.substring(0, 10);
    }
    return "";
  }
  return date.toISOString().substring(0, 10);
}

// ====== DROPDOWN LOADERS (HỌC SINH, LỚP, PHƯƠNG THỨC) ======

async function loadDropdownsForHoaDon() {
  const [classesRaw, studentsRaw] = await Promise.all([
    apiGetDropdownClasses(),
    apiGetDropdownStudents(),
  ]);

  // Lọc UNIQUE theo idLh / idHs đúng theo CSDL, tránh trùng do join nhiều lần
  const classes = uniqueBy(classesRaw || [], "idLh");
  const students = uniqueBy(studentsRaw || [], "idHs");

  const filterStudentSelect = document.getElementById(
    "tc-filter-hoadon-student"
  );
  const filterClassSelect = document.getElementById("tc-filter-hoadon-class");
  const formStudentSelect = document.getElementById("tc-hoadon-student");
  const formClassSelect = document.getElementById("tc-hoadon-class");

  const renderOptions = (
    select,
    list,
    valueKey,
    labelKey,
    includeAll = false
  ) => {
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = "";
    if (includeAll) {
      const optAll = document.createElement("option");
      optAll.value = "";
      optAll.textContent = "Tất cả";
      select.appendChild(optAll);
    }
    (list || []).forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item[valueKey];
      opt.textContent = item[labelKey];
      select.appendChild(opt);
    });
    if (
      currentValue &&
      [...select.options].some((o) => o.value === currentValue)
    ) {
      select.value = currentValue;
    }
  };

  // classes: [{idLh, tenLop}], students: [{idHs, hoTen}]
  renderOptions(filterStudentSelect, students, "idHs", "hoTen", true);
  renderOptions(filterClassSelect, classes, "idLh", "tenLop", true);
  renderOptions(formStudentSelect, students, "idHs", "hoTen", false);
  renderOptions(formClassSelect, classes, "idLh", "tenLop", false);
}

async function loadDropdownsForLichSu() {
  const methodsRaw = await apiGetPhuongThucThanhToanList();

  // Lọc UNIQUE theo idPt
  ptList = uniqueBy(methodsRaw || [], "idPt");

  const filterMethodSelect = document.getElementById("tc-filter-ls-method");
  const formMethodSelect = document.getElementById("tc-ls-pt");

  const renderOptions = (select, includeAll = false) => {
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = "";
    if (includeAll) {
      const optAll = document.createElement("option");
      optAll.value = "";
      optAll.textContent = "Tất cả";
      select.appendChild(optAll);
    }
    (ptList || []).forEach((pt) => {
      const opt = document.createElement("option");
      opt.value = pt.idPt;
      opt.textContent = `${pt.tenPt || pt.idPt}`;
      select.appendChild(opt);
    });
    if (
      currentValue &&
      [...select.options].some((o) => o.value === currentValue)
    ) {
      select.value = currentValue;
    }
  };

  renderOptions(filterMethodSelect, true);
  renderOptions(formMethodSelect, false);
}

// ====== REBUILD FILTER OPTIONS THEO UNIQUE TỪ DATA ĐÃ LOAD ======

// Trạng thái hóa đơn
function rebuildHoaDonStatusFilterFromData() {
  const statusSelect = document.getElementById("tc-filter-hoadon-status");
  if (!statusSelect) return;

  const currentValue = statusSelect.value;

  // UNIQUE các giá trị trangThai từ hoaDonList (CSDL trả về)
  const uniqueStatuses = Array.from(
    new Set(
      (hoaDonList || [])
        .map((hd) => hd.trangThai)
        .filter((st) => st && typeof st === "string")
    )
  );

  statusSelect.innerHTML = "";

  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "Tất cả";
  statusSelect.appendChild(optAll);

  uniqueStatuses.forEach((st) => {
    const opt = document.createElement("option");
    opt.value = st;
    opt.textContent = INVOICE_STATUS_LABELS[st] || st;
    statusSelect.appendChild(opt);
  });

  if (
    currentValue &&
    [...statusSelect.options].some((o) => o.value === currentValue)
  ) {
    statusSelect.value = currentValue;
  }
}

// Trạng thái lịch sử thanh toán
function rebuildLichSuStatusFilterFromData() {
  const statusSelect = document.getElementById("tc-filter-ls-status");
  if (!statusSelect) return;

  const currentValue = statusSelect.value;

  const uniqueStatuses = Array.from(
    new Set(
      (lichSuList || [])
        .map((ls) => ls.trangThaiThanhToan)
        .filter((st) => st && typeof st === "string")
    )
  );

  statusSelect.innerHTML = "";

  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "Tất cả";
  statusSelect.appendChild(optAll);

  uniqueStatuses.forEach((st) => {
    const opt = document.createElement("option");
    opt.value = st;
    opt.textContent = PAYMENT_STATUS_LABELS[st] || st;
    statusSelect.appendChild(opt);
  });

  if (
    currentValue &&
    [...statusSelect.options].some((o) => o.value === currentValue)
  ) {
    statusSelect.value = currentValue;
  }
}

// ====== RENDER: HÓA ĐƠN ======

function renderHoaDonTable() {
  const tbody = document.getElementById("tc-hoadon-tbody");
  if (!tbody) return;

  if (!hoaDonList || hoaDonList.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="10" class="tc-empty-row">Không có hóa đơn nào.</td></tr>';
    return;
  }

  const rowsHtml = hoaDonList
    .map((hd) => {
      const {
        idHoaDon,
        idHs,
        tenHocSinh, // từ BE nếu có join
        idLh,
        tenLop, // từ BE nếu có join
        soThang,
        tongTien,
        ngayDangKy,
        hanThanhToan,
        ngayThanhToan,
        trangThai,
      } = hd;

      return `
        <tr data-id="${idHoaDon}">
          <td>${idHoaDon || ""}</td>
          <td>${tenHocSinh || idHs || ""}</td>
          <td>${tenLop || idLh || ""}</td>
          <td>${soThang || ""}</td>
          <td>${formatCurrency(tongTien)}</td>
          <td>${safeDateStr(ngayDangKy)}</td>
          <td>${safeDateStr(hanThanhToan)}</td>
          <td>${safeDateStr(ngayThanhToan)}</td>
          <td>${createStatusChip(trangThai, "invoice")}</td>
          <td>
            <div class="tc-actions">
              <button class="tc-action-btn" data-tc-edit-hoadon="${idHoaDon}">
                <i class="ri-pencil-line"></i>
              </button>
              <button class="tc-action-btn" data-tc-delete-hoadon="${idHoaDon}">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  tbody.innerHTML = rowsHtml;
}

// ====== RENDER: LỊCH SỬ THANH TOÁN ======

function renderLichSuTable() {
  const tbody = document.getElementById("tc-ls-tbody");
  if (!tbody) return;

  if (!lichSuList || lichSuList.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="tc-empty-row">Không có dữ liệu lịch sử thanh toán.</td></tr>';
    return;
  }

  const rowsHtml = lichSuList
    .map((ls) => {
      const {
        idLs,
        idPt,
        tenPt, // join BE
        tongTien,
        trangThaiThanhToan,
        hinhThuc,
        thang,
        ghiChu,
      } = ls;

      return `
        <tr data-id="${idLs}">
          <td>${idLs || ""}</td>
          <td>${formatCurrency(tongTien)}</td>
          <td>${createStatusChip(trangThaiThanhToan, "payment")}</td>
          <td>${tenPt || idPt || ""}</td>
          <td>${hinhThuc || ""}</td>
          <td>${thang || ""}</td>
          <td>${ghiChu || ""}</td>
          <td>
            <div class="tc-actions">
              <button class="tc-action-btn" data-tc-edit-ls="${idLs}">
                <i class="ri-pencil-line"></i>
              </button>
              <button class="tc-action-btn" data-tc-delete-ls="${idLs}">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  tbody.innerHTML = rowsHtml;
}

// ====== RENDER: PHƯƠNG THỨC THANH TOÁN ======

function renderPhuongThucTable() {
  const tbody = document.getElementById("tc-pt-tbody");
  if (!tbody) return;

  if (!ptList || ptList.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="tc-empty-row">Chưa có phương thức thanh toán nào.</td></tr>';
    return;
  }

  const rowsHtml = ptList
    .map((pt) => {
      const { idPt, tenPt, hinhThucTt, ghiChu } = pt;
      return `
        <tr data-id="${idPt}">
          <td>${idPt || ""}</td>
          <td>${tenPt || ""}</td>
          <td>${hinhThucTt || ""}</td>
          <td>${ghiChu || ""}</td>
          <td>
            <div class="tc-actions">
              <button class="tc-action-btn" data-tc-edit-pt="${idPt}">
                <i class="ri-pencil-line"></i>
              </button>
              <button class="tc-action-btn" data-tc-delete-pt="${idPt}">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  tbody.innerHTML = rowsHtml;
}

// ====== LOADERS ======

async function loadHoaDonWithFilter() {
  const studentSelect = document.getElementById("tc-filter-hoadon-student");
  const classSelect = document.getElementById("tc-filter-hoadon-class");
  const statusSelect = document.getElementById("tc-filter-hoadon-status");
  const fromInput = document.getElementById("tc-filter-hoadon-from");
  const toInput = document.getElementById("tc-filter-hoadon-to");

  const payload = {
    studentId: studentSelect?.value || "",
    classId: classSelect?.value || "",
    status: statusSelect?.value || "",
    fromDate: fromInput?.value || "",
    toDate: toInput?.value || "",
  };

  const data = await apiSearchHoaDon(payload);
  hoaDonList = data || [];
  renderHoaDonTable();
  rebuildHoaDonStatusFilterFromData(); // đảm bảo filter trạng thái là UNIQUE từ CSDL
}

async function loadLichSuWithFilter() {
  const statusSelect = document.getElementById("tc-filter-ls-status");
  const methodSelect = document.getElementById("tc-filter-ls-method");
  const monthInput = document.getElementById("tc-filter-ls-month");

  const payload = {
    status: statusSelect?.value || "",
    methodId: methodSelect?.value || "",
    month: monthInput?.value || "",
  };

  const data = await apiSearchLichSuThanhToan(payload);
  lichSuList = data || [];
  renderLichSuTable();
  rebuildLichSuStatusFilterFromData(); // đảm bảo filter trạng thái là UNIQUE từ CSDL
}

async function loadPhuongThuc() {
  const data = await apiGetPhuongThucThanhToanList();
  // vẫn đảm bảo UNIQUE khi load bảng => dùng uniqueBy
  ptList = uniqueBy(data || [], "idPt");
  renderPhuongThucTable();
}

// ====== HANDLERS: HÓA ĐƠN ======

function resetHoaDonForm() {
  const form = document.getElementById("tc-hoadon-form");
  if (!form) return;
  form.reset();
  editingHoaDonId = null;
  const idInput = document.getElementById("tc-hoadon-id");
  if (idInput) idInput.disabled = false;
  const title = document.getElementById("tc-hoadon-modal-title");
  if (title) title.textContent = "Thêm hóa đơn";
}

function fillHoaDonForm(hd) {
  const {
    idHoaDon,
    idHs,
    idLh,
    soThang,
    tongTien,
    ngayDangKy,
    hanThanhToan,
    ngayThanhToan,
    trangThai,
  } = hd;

  const idInput = document.getElementById("tc-hoadon-id");
  const hsSelect = document.getElementById("tc-hoadon-student");
  const lhSelect = document.getElementById("tc-hoadon-class");
  const soThangInput = document.getElementById("tc-hoadon-so-thang");
  const tongTienInput = document.getElementById("tc-hoadon-tong-tien");
  const ngayDkInput = document.getElementById("tc-hoadon-ngay-dk");
  const hanInput = document.getElementById("tc-hoadon-han-tt");
  const ngayTtInput = document.getElementById("tc-hoadon-ngay-tt");
  const statusSelect = document.getElementById("tc-hoadon-status");

  if (idInput) {
    idInput.value = idHoaDon || "";
    idInput.disabled = true; // không cho đổi mã khi edit
  }
  if (hsSelect && idHs) hsSelect.value = idHs;
  if (lhSelect && idLh) lhSelect.value = idLh;
  if (soThangInput) soThangInput.value = soThang ?? "";
  if (tongTienInput) tongTienInput.value = tongTien ?? "";
  if (ngayDkInput) ngayDkInput.value = safeDateStr(ngayDangKy);
  if (hanInput) hanInput.value = safeDateStr(hanThanhToan);
  if (ngayTtInput) ngayTtInput.value = safeDateStr(ngayThanhToan);
  if (statusSelect && trangThai) statusSelect.value = trangThai;

  const title = document.getElementById("tc-hoadon-modal-title");
  if (title) title.textContent = "Chỉnh sửa hóa đơn";
}

function initHoaDonHandlers() {
  const addBtn = document.getElementById("tc-hoadon-btn-add");
  const filterBtn = document.getElementById("tc-filter-hoadon-apply");
  const form = document.getElementById("tc-hoadon-form");
  const tbody = document.getElementById("tc-hoadon-tbody");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      resetHoaDonForm();
      openModal("tc-hoadon-modal");
    });
  }

  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      loadHoaDonWithFilter();
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      const payload = {
        idHoaDon: formData.get("idHoaDon") || undefined,
        idHs: formData.get("idHs"),
        idLh: formData.get("idLh"),
        soThang: formData.get("soThang"),
        tongTien: formData.get("tongTien"),
        ngayDangKy: formData.get("ngayDangKy"),
        hanThanhToan: formData.get("hanThanhToan"),
        ngayThanhToan: formData.get("ngayThanhToan") || null,
        trangThai: formData.get("trangThai"),
      };

      try {
        if (editingHoaDonId) {
          await apiUpdateHoaDon(editingHoaDonId, payload);
          showToast("Cập nhật hóa đơn thành công.");
        } else {
          await apiCreateHoaDon(payload);
          showToast("Tạo hóa đơn mới thành công.");
        }
        closeModal("tc-hoadon-modal");
        await loadHoaDonWithFilter();
      } catch (err) {
        console.error(err);
        showToast("Có lỗi khi lưu hóa đơn.");
      }
    });
  }

  if (tbody) {
    tbody.addEventListener("click", async (e) => {
      const target = e.target.closest("button");
      if (!target) return;

      // Edit
      const editId = target.getAttribute("data-tc-edit-hoadon");
      if (editId) {
        const hd = hoaDonList.find((x) => x.idHoaDon === editId);
        if (!hd) return;
        editingHoaDonId = editId;
        fillHoaDonForm(hd);
        openModal("tc-hoadon-modal");
        return;
      }

      // Delete
      const deleteId = target.getAttribute("data-tc-delete-hoadon");
      if (deleteId) {
        const confirmDelete = confirm(
          "Bạn có chắc muốn xóa hóa đơn này? Thao tác không thể hoàn tác."
        );
        if (!confirmDelete) return;
        try {
          await apiDeleteHoaDon(deleteId);
          showToast("Đã xóa hóa đơn.");
          await loadHoaDonWithFilter();
        } catch (err) {
          console.error(err);
          showToast("Không thể xóa hóa đơn.");
        }
      }
    });
  }
}

// ====== HANDLERS: LỊCH SỬ THANH TOÁN ======

function resetLsForm() {
  const form = document.getElementById("tc-ls-form");
  if (!form) return;
  form.reset();
  editingLsId = null;
  const idInput = document.getElementById("tc-ls-id");
  if (idInput) idInput.disabled = false;
  const title = document.getElementById("tc-ls-modal-title");
  if (title) title.textContent = "Thêm lịch sử thanh toán";
}

function fillLsForm(ls) {
  const {
    idLs,
    idPt,
    tongTien,
    trangThaiThanhToan,
    hinhThuc,
    thang,
    ghiChu,
  } = ls;

  const idInput = document.getElementById("tc-ls-id");
  const ptSelect = document.getElementById("tc-ls-pt");
  const tongTienInput = document.getElementById("tc-ls-tong-tien");
  const statusSelect = document.getElementById("tc-ls-status");
  const hinhThucInput = document.getElementById("tc-ls-hinh-thuc");
  const thangInput = document.getElementById("tc-ls-thang");
  const ghiChuInput = document.getElementById("tc-ls-ghi-chu");

  if (idInput) {
    idInput.value = idLs || "";
    idInput.disabled = true;
  }
  if (ptSelect && idPt) ptSelect.value = idPt;
  if (tongTienInput) tongTienInput.value = tongTien ?? "";
  if (statusSelect && trangThaiThanhToan)
    statusSelect.value = trangThaiThanhToan;
  if (hinhThucInput) hinhThucInput.value = hinhThuc ?? "";
  if (thangInput) thangInput.value = thang ?? "";
  if (ghiChuInput) ghiChuInput.value = ghiChu ?? "";

  const title = document.getElementById("tc-ls-modal-title");
  if (title) title.textContent = "Chỉnh sửa lịch sử thanh toán";
}

function initLichSuHandlers() {
  const addBtn = document.getElementById("tc-ls-btn-add");
  const filterBtn = document.getElementById("tc-filter-ls-apply");
  const form = document.getElementById("tc-ls-form");
  const tbody = document.getElementById("tc-ls-tbody");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      resetLsForm();
      openModal("tc-ls-modal");
    });
  }

  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      loadLichSuWithFilter();
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      const payload = {
        idLs: formData.get("idLs") || undefined,
        idPt: formData.get("idPt"),
        tongTien: formData.get("tongTien"),
        trangThaiThanhToan: formData.get("trangThaiThanhToan"),
        hinhThuc: formData.get("hinhThuc"),
        thang: formData.get("thang"),
        ghiChu: formData.get("ghiChu"),
      };

      try {
        if (editingLsId) {
          await apiUpdateLichSuThanhToan(editingLsId, payload);
          showToast("Cập nhật lịch sử thanh toán thành công.");
        } else {
          await apiCreateLichSuThanhToan(payload);
          showToast("Tạo lịch sử thanh toán mới thành công.");
        }
        closeModal("tc-ls-modal");
        await loadLichSuWithFilter();
      } catch (err) {
        console.error(err);
        showToast("Có lỗi khi lưu lịch sử thanh toán.");
      }
    });
  }

  if (tbody) {
    tbody.addEventListener("click", async (e) => {
      const target = e.target.closest("button");
      if (!target) return;

      const editId = target.getAttribute("data-tc-edit-ls");
      if (editId) {
        const ls = lichSuList.find((x) => x.idLs === editId);
        if (!ls) return;
        editingLsId = editId;
        fillLsForm(ls);
        openModal("tc-ls-modal");
        return;
      }

      const deleteId = target.getAttribute("data-tc-delete-ls");
      if (deleteId) {
        const confirmDelete = confirm(
          "Bạn có chắc muốn xóa bản ghi lịch sử thanh toán này?"
        );
        if (!confirmDelete) return;
        try {
          await apiDeleteLichSuThanhToan(deleteId);
          showToast("Đã xóa lịch sử thanh toán.");
          await loadLichSuWithFilter();
        } catch (err) {
          console.error(err);
          showToast("Không thể xóa lịch sử thanh toán.");
        }
      }
    });
  }
}

// ====== HANDLERS: PHƯƠNG THỨC THANH TOÁN ======

function resetPtForm() {
  const form = document.getElementById("tc-pt-form");
  if (!form) return;
  form.reset();
  editingPtId = null;
  const idInput = document.getElementById("tc-pt-id");
  if (idInput) idInput.disabled = false;
  const title = document.getElementById("tc-pt-modal-title");
  if (title) title.textContent = "Thêm phương thức thanh toán";
}

function fillPtForm(pt) {
  const { idPt, tenPt, hinhThucTt, ghiChu } = pt;

  const idInput = document.getElementById("tc-pt-id");
  const tenInput = document.getElementById("tc-pt-ten");
  const hinhThucInput = document.getElementById("tc-pt-hinhthuc");
  const ghiChuInput = document.getElementById("tc-pt-ghi-chu");

  if (idInput) {
    idInput.value = idPt || "";
    idInput.disabled = true;
  }
  if (tenInput) tenInput.value = tenPt || "";
  if (hinhThucInput) hinhThucInput.value = hinhThucTt || "";
  if (ghiChuInput) ghiChuInput.value = ghiChu || "";

  const title = document.getElementById("tc-pt-modal-title");
  if (title) title.textContent = "Chỉnh sửa phương thức thanh toán";
}

function initPtHandlers() {
  const addBtn = document.getElementById("tc-pt-btn-add");
  const form = document.getElementById("tc-pt-form");
  const tbody = document.getElementById("tc-pt-tbody");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      resetPtForm();
      openModal("tc-pt-modal");
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      const payload = {
        idPt: formData.get("idPt") || undefined,
        tenPt: formData.get("tenPt"),
        hinhThucTt: formData.get("hinhThucTt"),
        ghiChu: formData.get("ghiChu"),
      };

      try {
        if (editingPtId) {
          await apiUpdatePhuongThucThanhToan(editingPtId, payload);
          showToast("Cập nhật phương thức thanh toán thành công.");
        } else {
          await apiCreatePhuongThucThanhToan(payload);
          showToast("Tạo phương thức thanh toán mới thành công.");
        }
        closeModal("tc-pt-modal");
        await loadPhuongThuc();
        await loadDropdownsForLichSu(); // cập nhật dropdown phương thức (UNIQUE)
      } catch (err) {
        console.error(err);
        showToast("Có lỗi khi lưu phương thức thanh toán.");
      }
    });
  }

  if (tbody) {
    tbody.addEventListener("click", async (e) => {
      const target = e.target.closest("button");
      if (!target) return;

      const editId = target.getAttribute("data-tc-edit-pt");
      if (editId) {
        const pt = ptList.find((x) => x.idPt === editId);
        if (!pt) return;
        editingPtId = editId;
        fillPtForm(pt);
        openModal("tc-pt-modal");
        return;
      }

      const deleteId = target.getAttribute("data-tc-delete-pt");
      if (deleteId) {
        const confirmDelete = confirm(
          "Bạn có chắc muốn xóa phương thức thanh toán này? Hãy đảm bảo không còn bản ghi nào đang dùng."
        );
        if (!confirmDelete) return;
        try {
          await apiDeletePhuongThucThanhToan(deleteId);
          showToast("Đã xóa phương thức thanh toán.");
          await loadPhuongThuc();
          await loadDropdownsForLichSu();
        } catch (err) {
          console.error(err);
          showToast(
            "Không thể xóa phương thức thanh toán (có thể đang được sử dụng)."
          );
        }
      }
    });
  }
}

// ====== TABS & COMMON ======

function initTabs() {
  const tabButtons = document.querySelectorAll("#taichinh-panel .tc-tab");
  const views = document.querySelectorAll("#taichinh-panel .tc-view");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const viewName = btn.getAttribute("data-tc-view");
      if (!viewName) return;

      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      views.forEach((v) => {
        if (v.id === `tc-view-${viewName}`) v.classList.add("active");
        else v.classList.remove("active");
      });
    });
  });
}

function initModalCloseHandlers() {
  document.querySelectorAll("[data-tc-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-tc-close-modal");
      if (id) closeModal(id);
    });
  });
}

// ====== PUBLIC INIT ======

export async function initTaiChinhPage() {
  // Tabs, modal close
  initTabs();
  initModalCloseHandlers();

  // Nút refresh chung
  const refreshBtn = document.getElementById("tc-refresh-all");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      await Promise.all([
        loadDropdownsForHoaDon(),
        loadDropdownsForLichSu(),
        loadHoaDonWithFilter(),
        loadLichSuWithFilter(),
        loadPhuongThuc(),
      ]);
      showToast("Đã làm mới dữ liệu tài chính.");
    });
  }

  // Init handlers cho từng tab
  initHoaDonHandlers();
  initLichSuHandlers();
  initPtHandlers();

  // Load initial data
  try {
    await Promise.all([loadDropdownsForHoaDon(), loadDropdownsForLichSu()]);
    await Promise.all([
      loadHoaDonWithFilter(),
      loadLichSuWithFilter(),
      loadPhuongThuc(),
    ]);
  } catch (err) {
    console.error(err);
    showToast("Không thể tải dữ liệu tài chính ban đầu.");
  }
}
