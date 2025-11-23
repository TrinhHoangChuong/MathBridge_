// NHÂN SỰ & GIẢNG VIÊN - PAGE LOGIC
// admin.js sẽ gọi initNhansuPage() sau khi load nhansu.html + nhansu.css

import {
  apiGetCampuses,
  apiGetRoles,
  apiGetAvailableAccounts,
  apiSearchStaff,
  apiGetStaffDetail,
  apiCreateStaff,
  apiUpdateStaff,
  apiUpdateStaffStatus,
  apiDeleteStaff,
  apiSearchContracts,
  apiGetContractDetail,
  apiCreateContract,
  apiUpdateContract,
  apiDeleteContract,
  apiGetStaffForDropdown,
} from "../api/nhansu.api.js";
// ====== STATE ======

const staffState = {
  page: 0,
  size: 10000,
  totalPages: 0,
  filters: {
    searchKeyword: "",
    campusId: "",
    roleId: "",
    status: "",
  },
  list: [],
};

const contractState = {
  page: 0,
  size: 10000,
  totalPages: 0,
  filters: {
    searchKeyword: "",
    staffId: "",
    contractType: "",
    status: "",
  },
  list: [],
};

let staffOptionsForContracts = [];
let accountOptionsForStaff = [];

// ====== UTILS ======

function $(selector) {
  return document.querySelector(selector);
}

function createEl(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
}

function fullNameFromStaff(staff) {
  if (!staff) return "";
  if (staff.fullName) return staff.fullName;
  const parts = [staff.ho, staff.tenDem, staff.ten].filter(Boolean);
  return parts.join(" ");
}

function campusNameFromStaff(staff) {
  return (
    staff.campusName ||
    staff.tenCoSo ||
    staff.coso?.tenCoSo ||
    staff.coSo?.tenCoSo ||
    ""
  );
}

function rolesFromStaff(staff) {
  if (!staff) return [];
  if (Array.isArray(staff.roleNames)) return staff.roleNames;
  if (Array.isArray(staff.roles)) return staff.roles;
  if (typeof staff.role === "string") return [staff.role];
  return [];
}

function statusBadge(active) {
  const span = createEl("span", "ns-badge ns-badge-pill");
  if (active) {
    span.classList.add("ns-badge-success");
    span.textContent = "Đang hoạt động";
  } else {
    span.classList.add("ns-badge-muted");
    span.textContent = "Ngưng hoạt động";
  }
  return span;
}

function contractStatusBadge(contract) {
  const span = createEl("span", "ns-badge ns-badge-pill");
  const now = new Date();
  const ngayKetThuc = new Date(
    contract.ngayKetThuc || contract.NgayKetThuc || contract.ngayKetThucStr
  );
  const chamDut = contract.chamDutHd ?? contract.chamDutHD;

  if (chamDut) {
    span.classList.add("ns-badge-danger");
    span.textContent = "Đã chấm dứt";
  } else if (!Number.isNaN(ngayKetThuc.getTime()) && ngayKetThuc < now) {
    span.classList.add("ns-badge-warning");
    span.textContent = "Hết hạn";
  } else {
    span.classList.add("ns-badge-success");
    span.textContent = "Đang hiệu lực";
  }

  return span;
}

function showToast(message, type = "success") {
  console.log(`[NS-${type.toUpperCase()}]`, message);
}

// ====== DROPDOWNS (CƠ SỞ, VAI TRÒ) ======

async function loadDropdownData() {
  try {
    const campuses = await apiGetCampuses();
    const campusFilter = $("#ns-staff-campus");
    const campusModal = $("#ns-staff-campus-modal");

    if (campusFilter) {
      campusFilter.innerHTML =
        '<option value="">Tất cả cơ sở</option>' +
        campuses
          .map(
            (cs) =>
              `<option value="${cs.idCs}">${
                cs.tenCoSo || cs.tencoso || cs.tenCOSO
              }</option>`
          )
          .join("");
    }

    if (campusModal) {
      campusModal.innerHTML =
        '<option value="">Chọn cơ sở</option>' +
        campuses
          .map(
            (cs) =>
              `<option value="${cs.idCs}">${
                cs.tenCoSo || cs.tencoso || cs.tenCOSO
              }</option>`
          )
          .join("");
    }

    const roles = await apiGetRoles();
    const roleFilter = $("#ns-staff-role");
    // Không còn roleModal (không gán role ở màn Nhân sự)
    if (roleFilter) {
      roleFilter.innerHTML =
        '<option value="">Tất cả vai trò</option>' +
        roles
          .map(
            (r) =>
              `<option value="${r.idRole}">${
                r.tenVaiTro || r.tenvaitro
              }</option>`
          )
          .join("");
    }
  } catch (err) {
    console.error("Không thể tải dropdown Nhân sự:", err);
  }
}

// ====== DROPDOWN TÀI KHOẢN CHO NHÂN SỰ ======

async function fetchAccountOptionsIfNeeded() {
  if (accountOptionsForStaff.length) return;

  try {
    const accounts = await apiGetAvailableAccounts();
    accountOptionsForStaff = Array.isArray(accounts) ? accounts : [];
  } catch (err) {
    console.error("Không thể tải danh sách tài khoản khả dụng:", err);
  }
}

function fillAccountSelectForCreate() {
  const select = $("#ns-staff-account-modal");
  if (!select) return;

  select.disabled = false;
  select.innerHTML =
    '<option value="">Chọn tài khoản đã tạo</option>' +
    accountOptionsForStaff
      .map((acc) => {
        const idTk = acc.idTk || acc.ID_TK || acc.id || "";
        const email = acc.email || acc.Email || "";
        const rolesArr = acc.roleNames || acc.roles || [];
        const rolesText = Array.isArray(rolesArr) ? rolesArr.join(", ") : "";
        const ownerType =
          acc.ownerType ||
          acc.owner ||
          (acc.idNv || acc.ID_NV
            ? "NV"
            : acc.idHs || acc.ID_HS
            ? "HS"
            : "OTHER");

        const parts = [
          email || idTk,
          rolesText ? `(${rolesText})` : null,
          ownerType ? `- ${ownerType}` : null,
        ].filter(Boolean);

        const label = parts.join(" ");
        return `<option value="${idTk}">${label}</option>`;
      })
      .join("");
}

function syncEmailFromSelectedAccount() {
  const select = $("#ns-staff-account-modal");
  const emailInput = $("#ns-staff-email");
  if (!select || !emailInput) return;

  const selectedId = select.value;
  const acc =
    accountOptionsForStaff.find((a) => {
      const idTk = a.idTk || a.ID_TK || a.id || "";
      return String(idTk) === String(selectedId);
    }) || null;

  emailInput.value = acc ? acc.email || acc.Email || "" : "";
}

// ====== STAFF: API -> STATE & RENDER ======

async function fetchStaff() {
  const payload = {
    searchKeyword: staffState.filters.searchKeyword || null,
    campusId: staffState.filters.campusId || null,
    roleId: staffState.filters.roleId || null,
    status: staffState.filters.status || null,
    page: staffState.page,
    size: staffState.size,
  };

  const res = await apiSearchStaff(payload);

  if (Array.isArray(res)) {
    staffState.list = res;
    staffState.totalPages = 1;
  } else {
    staffState.list = res.content || [];
    staffState.totalPages = res.totalPages ?? 1;
  }
}

function renderStaffTable() {
  const tbody =
    document.querySelector("#ns-staff-table tbody") ||
    document.getElementById("ns-staff-tbody");
  const empty = document.getElementById("ns-staff-empty");

  if (!tbody) return;
  tbody.innerHTML = "";

  if (!staffState.list.length) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  staffState.list.forEach((staff) => {
    const tr = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = staff.idNv || staff.ID_NV || staff.maNv || staff.id;
    tr.appendChild(idCell);

    const nameCell = document.createElement("td");
    nameCell.textContent = fullNameFromStaff(staff);
    tr.appendChild(nameCell);

    const campusCell = document.createElement("td");
    campusCell.textContent = campusNameFromStaff(staff);
    tr.appendChild(campusCell);

    const emailCell = document.createElement("td");
    emailCell.textContent = staff.email || staff.Email || "";
    tr.appendChild(emailCell);

    const phoneCell = document.createElement("td");
    phoneCell.textContent =
      staff.sdt || staff.SDT || staff.soDienThoai || "";
    tr.appendChild(phoneCell);

    const cvCell = document.createElement("td");
    cvCell.textContent =
      staff.chucVu || staff.ChucVu || staff.position || "—";
    tr.appendChild(cvCell);

    const roleCell = document.createElement("td");
    roleCell.textContent = rolesFromStaff(staff).join(", ");
    tr.appendChild(roleCell);

    const statusCell = document.createElement("td");
    const active =
      staff.trangThaiHoatDong ??
      staff.trangThai ??
      staff.active ??
      staff.isActive ??
      true;
    statusCell.appendChild(statusBadge(Boolean(active)));
    tr.appendChild(statusCell);

    const actionsCell = document.createElement("td");
    actionsCell.classList.add("actions");

    const editBtn = createEl("button", "btn icon-only");
    editBtn.type = "button";
    editBtn.innerHTML = '<i class="ri-pencil-line"></i>';
    editBtn.title = "Chỉnh sửa nhân sự";
    editBtn.addEventListener("click", () =>
      openStaffModal(
        "edit",
        staff.idNv || staff.ID_NV || staff.maNv || staff.id
      )
    );

    const toggleBtn = createEl("button", "btn icon-only");
    toggleBtn.type = "button";
    toggleBtn.innerHTML = '<i class="ri-toggle-line"></i>';
    toggleBtn.title = "Đổi trạng thái hoạt động";
    toggleBtn.addEventListener("click", () =>
      onToggleStaffStatus(
        staff.idNv || staff.ID_NV || staff.maNv || staff.id,
        !Boolean(active)
      )
    );

    const delBtn = createEl("button", "btn icon-only danger");
    delBtn.type = "button";
    delBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
    delBtn.title = "Xóa nhân sự";
    delBtn.addEventListener("click", () =>
      onDeleteStaff(staff.idNv || staff.ID_NV || staff.maNv || staff.id)
    );

    actionsCell.append(editBtn, toggleBtn, delBtn);
    tr.appendChild(actionsCell);

    tbody.appendChild(tr);
  });
}

function renderStaffPagination() {
  const container = document.getElementById("ns-staff-pagination");
  if (!container) return;

  container.innerHTML = "";

  if (staffState.totalPages <= 1) return;

  const createPageButton = (label, page, disabled = false, active = false) => {
    const btn = createEl("button", "ns-page-btn");
    btn.textContent = label;
    if (disabled) btn.disabled = true;
    if (active) btn.classList.add("active");
    btn.addEventListener("click", () => {
      staffState.page = page;
      refreshStaffList();
    });
    return btn;
  };

  container.appendChild(createPageButton("«", 0, staffState.page === 0));
  container.appendChild(
    createPageButton(
      "‹",
      Math.max(0, staffState.page - 1),
      staffState.page === 0
    )
  );

  for (let p = 0; p < staffState.totalPages; p += 1) {
    container.appendChild(
      createPageButton(p + 1, p, false, p === staffState.page)
    );
  }

  container.appendChild(
    createPageButton(
      "›",
      Math.min(staffState.totalPages - 1, staffState.page + 1),
      staffState.page >= staffState.totalPages - 1
    )
  );
  container.appendChild(
    createPageButton(
      "»",
      staffState.totalPages - 1,
      staffState.page >= staffState.totalPages - 1
    )
  );
}

async function refreshStaffList() {
  try {
    await fetchStaff();
    renderStaffTable();
    renderStaffPagination();
    await loadStaffOptionsForContracts();
  } catch (err) {
    console.error(err);
    showToast("Không thể tải danh sách nhân sự", "error");
  }
}

// ====== STAFF MODAL ======

function resetStaffForm() {
  $("#ns-staff-id").value = "";
  $("#ns-staff-ho").value = "";
  $("#ns-staff-tendem").value = "";
  $("#ns-staff-ten").value = "";

  const emailInput = $("#ns-staff-email");
  if (emailInput) {
    emailInput.value = "";
    emailInput.readOnly = true; // email luôn lấy từ tài khoản
  }

  $("#ns-staff-sdt").value = "";
  $("#ns-staff-gioitinh").value = "";
  $("#ns-staff-campus-modal").value = "";
  $("#ns-staff-chucvu").value = "";
  $("#ns-staff-chuyenmon").value = "";
  $("#ns-staff-kinhnghiem").value = "";

  const accountSelect = $("#ns-staff-account-modal");
  if (accountSelect) {
    accountSelect.disabled = false;
    // nội dung sẽ được fill khi create (fillAccountSelectForCreate)
  }

  $("#ns-staff-active").checked = true;
}

function populateStaffForm(staff) {
  $("#ns-staff-id").value =
    staff.idNv || staff.ID_NV || staff.maNv || staff.id || "";

  $("#ns-staff-ho").value = staff.ho || "";
  $("#ns-staff-tendem").value = staff.tenDem || "";
  $("#ns-staff-ten").value = staff.ten || "";

  const emailInput = $("#ns-staff-email");
  if (emailInput) {
    emailInput.value = staff.email || staff.Email || "";
    emailInput.readOnly = true;
  }

  $("#ns-staff-sdt").value = staff.sdt || staff.SDT || "";

  const gioiTinh = staff.gioiTinh ?? staff.gender ?? null;
  $("#ns-staff-gioitinh").value =
    gioiTinh === null || gioiTinh === undefined
      ? ""
      : gioiTinh
      ? "male"
      : "female";

  const campusId =
    staff.idCs || staff.ID_CS || staff.campusId || staff.coSo?.idCs;
  if (campusId) $("#ns-staff-campus-modal").value = campusId;

  $("#ns-staff-chucvu").value =
    staff.chucVu || staff.ChucVu || staff.position || "";
  $("#ns-staff-chuyenmon").value =
    staff.chuyenMon || staff.ChuyenMon || staff.specialization || "";
  $("#ns-staff-kinhnghiem").value =
    staff.kinhNghiem ?? staff.KinhNghiem ?? staff.experience ?? "";

  // Tài khoản: không cho đổi ở màn chỉnh sửa
  const accountSelect = $("#ns-staff-account-modal");
  if (accountSelect) {
    const idTk =
      staff.idTk ||
      staff.ID_TK ||
      staff.taiKhoanId ||
      staff.idTkNhanVien ||
      "";
    const email = staff.email || staff.Email || "";
    const label = idTk ? `${idTk} - ${email}` : email || "Không có tài khoản";
    accountSelect.disabled = true;
    accountSelect.innerHTML = `<option value="${idTk}">${label}</option>`;
  }

  const active =
    staff.trangThaiHoatDong ??
    staff.trangThai ??
    staff.active ??
    staff.isActive ??
    true;
  $("#ns-staff-active").checked = Boolean(active);
}

function buildStaffPayloadFromForm() {
  const idNv = $("#ns-staff-id").value || null;
  const ho = $("#ns-staff-ho").value.trim();
  const tenDem = $("#ns-staff-tendem").value.trim() || null;
  const ten = $("#ns-staff-ten").value.trim();
  const email = $("#ns-staff-email").value.trim();
  const sdt = $("#ns-staff-sdt").value.trim();
  const gioiTinhVal = $("#ns-staff-gioitinh").value;
  const idCs = $("#ns-staff-campus-modal").value || null;
  const chucVu = $("#ns-staff-chucvu").value.trim() || null;
  const chuyenMon = $("#ns-staff-chuyenmon").value.trim() || null;
  const kinhNghiemStr = $("#ns-staff-kinhnghiem").value;
  const active = $("#ns-staff-active").checked;

  const kinhNghiem = kinhNghiemStr ? parseInt(kinhNghiemStr, 10) : null;

  const accountSelect = $("#ns-staff-account-modal");
  // Nếu đang chỉnh sửa (idNv != null) thì không cho đổi ID_TK → không gửi idTk mới
  const idTk =
    idNv || !accountSelect
      ? null
      : accountSelect.value
      ? accountSelect.value
      : null;

  return {
    idNv,
    idTk, // chỉ set khi tạo mới
    ho,
    tenDem,
    ten,
    email, // BE có thể bỏ qua và tự sync = TaiKhoan.Email
    sdt,
    gioiTinh: gioiTinhVal === "" ? null : gioiTinhVal === "male",
    idCs,
    chucVu,
    chuyenMon,
    kinhNghiem,
    trangThaiHoatDong: active,
  };
}

async function openStaffModal(mode, staffId) {
  const modal = $("#ns-staff-modal");
  const titleEl = $("#ns-staff-modal-title");
  resetStaffForm();
  if (modal) {
    modal.dataset.mode = mode || "create";
  }

  if (mode === "edit" && staffId) {
    titleEl.textContent = "Chỉnh sửa nhân sự";
    try {
      const staff = await apiGetStaffDetail(staffId);
      populateStaffForm(staff);
    } catch (err) {
      console.error(err);
      showToast("Không thể tải chi tiết nhân sự", "error");
      return;
    }
  } else {
    titleEl.textContent = "Thêm nhân sự";
    // Tạo mới → cần danh sách tài khoản khả dụng
    await fetchAccountOptionsIfNeeded();
    fillAccountSelectForCreate();
  }

  modal.classList.remove("hidden");
}

function closeStaffModal() {
  const modal = $("#ns-staff-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.dataset.mode = "";
  }
}

async function onStaffFormSubmit(e) {
  e.preventDefault();
  const payload = buildStaffPayloadFromForm();
  const staffId = payload.idNv;

  try {
    if (staffId) {
      await apiUpdateStaff(staffId, payload);
      showToast("Cập nhật nhân sự thành công");
    } else {
      if (!payload.idTk) {
        showToast("Vui lòng chọn tài khoản hệ thống cho nhân sự", "error");
        return;
      }
      await apiCreateStaff(payload);
      showToast("Thêm nhân sự thành công");
      // Sau khi tạo thành công, có thể invalid cache account để lần sau load lại
      accountOptionsForStaff = [];
    }
    closeStaffModal();
    await refreshStaffList();
  } catch (err) {
    console.error(err);
    showToast(err.message || "Lưu nhân sự thất bại", "error");
  }
}

async function onDeleteStaff(idNv) {
  const ok = window.confirm(
    "Bạn chắc chắn muốn xóa nhân sự này?\n(BE sẽ xử lý xóa/chấm dứt toàn bộ hợp đồng liên quan và giữ lại tài khoản đăng nhập theo đúng nghiệp vụ.)"
  );
  if (!ok) return;

  try {
    await apiDeleteStaff(idNv);
    showToast("Xóa nhân sự thành công");
    await refreshStaffList();
  } catch (err) {
    console.error(err);
    showToast("Không thể xóa nhân sự", "error");
  }
}

async function onToggleStaffStatus(idNv, active) {
  try {
    await apiUpdateStaffStatus(idNv, active);
    showToast("Cập nhật trạng thái nhân sự thành công");
    await refreshStaffList();
  } catch (err) {
    console.error(err);
    showToast("Không thể cập nhật trạng thái nhân sự", "error");
  }
}

// ====== CONTRACTS: API -> STATE & RENDER ======

async function fetchContracts() {
  const payload = {
    searchKeyword: contractState.filters.searchKeyword || null,
    staffId: contractState.filters.staffId || null,
    contractType: contractState.filters.contractType || null,
    status: contractState.filters.status || null,
    page: contractState.page,
    size: contractState.size,
  };

  const res = await apiSearchContracts(payload);

  if (Array.isArray(res)) {
    contractState.list = res;
    contractState.totalPages = 1;
  } else {
    contractState.list = res.content || [];
    contractState.totalPages = res.totalPages ?? 1;
  }
}

function staffNameFromContract(contract) {
  return (
    contract.staffName ||
    contract.nhanVienName ||
    fullNameFromStaff(contract.nhanVien || contract.staff)
  );
}

function buildContractTypeFilterOptionsFromState() {
  const select = document.getElementById("ns-contract-type");
  if (!select) return;

  const current = select.value;
  const types = [
    ...new Set(
      contractState.list
        .map(
          (c) =>
            c.loaiHopDong || c.LoaiHopDong || c.contractType || ""
        )
        .filter((t) => t && String(t).trim() !== "")
    ),
  ];

  select.innerHTML =
    '<option value="">Tất cả loại HĐ</option>' +
    types.map((t) => `<option value="${t}">${t}</option>`).join("");

  if (types.includes(current)) {
    select.value = current;
  }
}

function renderContractTable() {
  const tbody =
    document.querySelector("#ns-contract-table tbody") ||
    document.getElementById("ns-contract-tbody");
  const empty = document.getElementById("ns-contract-empty");

  if (!tbody) return;
  tbody.innerHTML = "";

  if (!contractState.list.length) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  contractState.list.forEach((ct) => {
    const tr = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = ct.idHd || ct.ID_HD || ct.maHd || ct.id;
    tr.appendChild(idCell);

    const staffCell = document.createElement("td");
    staffCell.textContent = staffNameFromContract(ct);
    tr.appendChild(staffCell);

    const loaiCell = document.createElement("td");
    loaiCell.textContent =
      ct.loaiHopDong || ct.LoaiHopDong || ct.contractType || "";
    tr.appendChild(loaiCell);

    const hinhThucCell = document.createElement("td");
    hinhThucCell.textContent =
      ct.hinhThucDay || ct.HinhThucDay || ct.hinhThuc || "";
    tr.appendChild(hinhThucCell);

    const hlCell = document.createElement("td");
    hlCell.textContent = formatDate(
      ct.ngayHieuLuc || ct.NgayHieuLuc || ct.ngayHieuLucStr
    );
    tr.appendChild(hlCell);

    const ktCell = document.createElement("td");
    ktCell.textContent = formatDate(
      ct.ngayKetThuc || ct.NgayKetThuc || ct.ngayKetThucStr
    );
    tr.appendChild(ktCell);

    const statusCell = document.createElement("td");
    statusCell.appendChild(contractStatusBadge(ct));
    tr.appendChild(statusCell);

    const actionsCell = document.createElement("td");
    actionsCell.classList.add("actions");

    const editBtn = createEl("button", "btn icon-only");
    editBtn.type = "button";
    editBtn.innerHTML = '<i class="ri-pencil-line"></i>';
    editBtn.title = "Chỉnh sửa hợp đồng";
    editBtn.addEventListener("click", () =>
      openContractModal(
        "edit",
        ct.idHd || ct.ID_HD || ct.maHd || ct.id
      )
    );

    // KHÔNG còn nút Xóa HĐ lẻ để bám rule nghiệp vụ
    actionsCell.append(editBtn);
    tr.appendChild(actionsCell);

    tbody.appendChild(tr);
  });
}

function renderContractPagination() {
  const container = document.getElementById("ns-contract-pagination");
  if (!container) return;

  container.innerHTML = "";

  if (contractState.totalPages <= 1) return;

  const createPageButton = (label, page, disabled = false, active = false) => {
    const btn = createEl("button", "ns-page-btn");
    btn.textContent = label;
    if (disabled) btn.disabled = true;
    if (active) btn.classList.add("active");
    btn.addEventListener("click", () => {
      contractState.page = page;
      refreshContractList();
    });
    return btn;
  };

  container.appendChild(createPageButton("«", 0, contractState.page === 0));
  container.appendChild(
    createPageButton(
      "‹",
      Math.max(0, contractState.page - 1),
      contractState.page === 0
    )
  );

  for (let p = 0; p < contractState.totalPages; p += 1) {
    container.appendChild(
      createPageButton(p + 1, p, false, p === contractState.page)
    );
  }

  container.appendChild(
    createPageButton(
      "›",
      Math.min(contractState.totalPages - 1, contractState.page + 1),
      contractState.page >= contractState.totalPages - 1
    )
  );
  container.appendChild(
    createPageButton(
      "»",
      contractState.totalPages - 1,
      contractState.page >= contractState.totalPages - 1
    )
  );
}

async function refreshContractList() {
  try {
    await fetchContracts();
    renderContractTable();
    renderContractPagination();
    buildContractTypeFilterOptionsFromState(); // tạo dropdown loại HĐ unique
  } catch (err) {
    console.error(err);
    showToast("Không thể tải danh sách hợp đồng", "error");
  }
}

// ====== DROPDOWN STAFF CHO HỢP ĐỒNG ======

async function loadStaffOptionsForContracts() {
  try {
    staffOptionsForContracts = await apiGetStaffForDropdown();

    const selects = [$("#ns-contract-staff"), $("#ns-contract-staff-modal")].filter(
      Boolean
    );

    selects.forEach((sel) => {
      if (!sel) return;
      const first = sel.querySelector("option");
      sel.innerHTML = "";
      if (first) sel.appendChild(first);

      staffOptionsForContracts.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.idNv || s.ID_NV || s.maNv || s.id;
        opt.textContent = fullNameFromStaff(s);
        sel.appendChild(opt);
      });
    });
  } catch (err) {
    console.error("Không thể tải danh sách nhân sự cho Hợp đồng:", err);
  }
}

// ====== CONTRACT MODAL ======

function resetContractForm() {
  $("#ns-contract-id").value = "";
  $("#ns-contract-staff-modal").value = "";
  $("#ns-contract-loaihd").value = "";
  $("#ns-contract-hinhthuc").value = "";
  $("#ns-contract-ngayky").value = "";
  $("#ns-contract-ngayhl").value = "";
  $("#ns-contract-ngaykt").value = "";
  $("#ns-contract-phamvi").value = "";
  $("#ns-contract-chamdut").checked = false;
  $("#ns-contract-ngaychamdut").value = "";
}

function populateContractForm(ct) {
  $("#ns-contract-id").value = ct.idHd || ct.ID_HD || ct.maHd || ct.id || "";

  const staffId =
    ct.idNv ||
    ct.ID_NV ||
    ct.nhanVien?.idNv ||
    ct.staff?.idNv ||
    null;
  if (staffId) $("#ns-contract-staff-modal").value = staffId;

  $("#ns-contract-loaihd").value =
    ct.loaiHopDong || ct.LoaiHopDong || ct.contractType || "";
  $("#ns-contract-hinhthuc").value =
    ct.hinhThucDay || ct.HinhThucDay || ct.hinhThuc || "";

  const ngayKy = ct.ngayKy || ct.NgayKy || ct.ngayKyStr;
  const ngayHl = ct.ngayHieuLuc || ct.NgayHieuLuc || ct.ngayHieuLucStr;
  const ngayKt = ct.ngayKetThuc || ct.NgayKetThuc || ct.ngayKetThucStr;

  if (ngayKy) $("#ns-contract-ngayky").value = ngayKy.slice(0, 10);
  if (ngayHl) $("#ns-contract-ngayhl").value = ngayHl.slice(0, 10);
  if (ngayKt) $("#ns-contract-ngaykt").value = ngayKt.slice(0, 10);

  $("#ns-contract-phamvi").value =
    ct.phamViCongViec || ct.PhamViCongViec || "";

  const chamDut = ct.chamDutHd ?? ct.chamDutHD ?? false;
  $("#ns-contract-chamdut").checked = Boolean(chamDut);

  const ngayCd =
    ct.ngayChamDutHd || ct.NgayChamDutHD || ct.ngayChamDutHD;
  if (ngayCd) $("#ns-contract-ngaychamdut").value = ngayCd.slice(0, 10);
}

function buildContractPayloadFromForm() {
  const idHd = $("#ns-contract-id").value || null;
  const idNv = $("#ns-contract-staff-modal").value || null;
  const loaiHopDong = $("#ns-contract-loaihd").value.trim();
  const hinhThucDay = $("#ns-contract-hinhthuc").value.trim();
  const ngayKy = $("#ns-contract-ngayky").value;
  const ngayHieuLuc = $("#ns-contract-ngayhl").value;
  const ngayKetThuc = $("#ns-contract-ngaykt").value;
  const phamViCongViec = $("#ns-contract-phamvi").value.trim() || null;
  const chamDutHD = $("#ns-contract-chamdut").checked;
  const ngayChamDutHD = $("#ns-contract-ngaychamdut").value || null;

  return {
    idHd,
    idNv,
    loaiHopDong,
    hinhThucDay,
    ngayKy,
    ngayHieuLuc,
    ngayKetThuc,
    phamViCongViec,
    chamDutHD,
    ngayChamDutHD,
  };
}

async function openContractModal(mode, idHd) {
  const modal = $("#ns-contract-modal");
  const titleEl = $("#ns-contract-modal-title");
  resetContractForm();

  if (mode === "edit" && idHd) {
    titleEl.textContent = "Chỉnh sửa hợp đồng";
    try {
      const ct = await apiGetContractDetail(idHd);
      populateContractForm(ct);
    } catch (err) {
      console.error(err);
      showToast("Không thể tải chi tiết hợp đồng", "error");
      return;
    }
  } else {
    titleEl.textContent = "Thêm hợp đồng";
  }

  modal.classList.remove("hidden");
}

function closeContractModal() {
  $("#ns-contract-modal").classList.add("hidden");
}

async function onContractFormSubmit(e) {
  e.preventDefault();
  const payload = buildContractPayloadFromForm();
  const idHd = payload.idHd;

  try {
    if (idHd) {
      await apiUpdateContract(idHd, payload);
      showToast("Cập nhật hợp đồng thành công");
    } else {
      await apiCreateContract(payload);
      showToast("Thêm hợp đồng thành công");
    }
    closeContractModal();
    await refreshContractList();
  } catch (err) {
    console.error(err);
    showToast(err.message || "Lưu hợp đồng thất bại", "error");
  }
}

// Gợi ý: onDeleteContract vẫn giữ, nhưng hiện tại không gắn với nút UI.
async function onDeleteContract(idHd) {
  const ok = window.confirm(
    "Bạn chắc chắn muốn xóa hợp đồng này?\n(Theo rule nghiệp vụ, nên thực hiện trong quy trình nghỉ việc nhân sự.)"
  );
  if (!ok) return;

  try {
    await apiDeleteContract(idHd);
    showToast("Xóa hợp đồng thành công");
    await refreshContractList();
  } catch (err) {
    console.error(err);
    showToast("Không thể xóa hợp đồng", "error");
  }
}

// ====== TABS & FILTER EVENTS ======

function initTabs() {
  const tabStaff = $("#ns-tab-staff");
  const tabContracts = $("#ns-tab-contracts");
  const viewStaff = $("#ns-view-staff");
  const viewContracts = $("#ns-view-contracts");
  if (!tabStaff || !tabContracts || !viewStaff || !viewContracts) return;

  const setActiveTab = (tab) => {
    [tabStaff, tabContracts].forEach((t) =>
      t.classList.toggle("active", t === tab)
    );
    const showStaff = tab === tabStaff;
    viewStaff.classList.toggle("hidden", !showStaff);
    viewContracts.classList.toggle("hidden", showStaff);
  };

  tabStaff.addEventListener("click", () => setActiveTab(tabStaff));
  tabContracts.addEventListener("click", () => setActiveTab(tabContracts));
}

function initStaffFilters() {
  const filterBtn = $("#ns-staff-filter-btn");
  const clearBtn = $("#ns-staff-clear-btn");
  const createBtn = $("#ns-staff-create-btn");

  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      staffState.filters.searchKeyword = $("#ns-staff-search").value.trim();
      staffState.filters.campusId = $("#ns-staff-campus").value;
      staffState.filters.roleId = $("#ns-staff-role").value;
      const statusVal = $("#ns-staff-status").value;
      staffState.filters.status = statusVal || "";
      staffState.page = 0;
      refreshStaffList();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      $("#ns-staff-search").value = "";
      $("#ns-staff-campus").value = "";
      $("#ns-staff-role").value = "";
      $("#ns-staff-status").value = "";
      staffState.filters = {
        searchKeyword: "",
        campusId: "",
        roleId: "",
        status: "",
      };
      staffState.page = 0;
      refreshStaffList();
    });
  }

  if (createBtn) {
    createBtn.addEventListener("click", () => openStaffModal("create"));
  }
}

function initContractFilters() {
  const filterBtn = $("#ns-contract-filter-btn");
  const clearBtn = $("#ns-contract-clear-btn");
  const createBtn = $("#ns-contract-create-btn");

  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      contractState.filters.searchKeyword =
        $("#ns-contract-search").value.trim();
      contractState.filters.staffId = $("#ns-contract-staff").value;
      contractState.filters.contractType =
        $("#ns-contract-type").value;
      contractState.filters.status =
        $("#ns-contract-status").value || "";
      contractState.page = 0;
      refreshContractList();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      $("#ns-contract-search").value = "";
      $("#ns-contract-staff").value = "";
      $("#ns-contract-type").value = "";
      $("#ns-contract-status").value = "";
      contractState.filters = {
        searchKeyword: "",
        staffId: "",
        contractType: "",
        status: "",
      };
      contractState.page = 0;
      refreshContractList();
    });
  }

  if (createBtn) {
    createBtn.addEventListener("click", () =>
      openContractModal("create")
    );
  }
}

// ====== INIT ======

export async function initNhansuPage() {
  document
    .querySelectorAll("[data-close-staff]")
    .forEach((btn) => btn.addEventListener("click", closeStaffModal));
  document
    .querySelectorAll("[data-close-contract]")
    .forEach((btn) => btn.addEventListener("click", closeContractModal));

  const staffForm = $("#ns-staff-form");
  if (staffForm) {
    staffForm.addEventListener("submit", onStaffFormSubmit);
  }

  const contractForm = $("#ns-contract-form");
  if (contractForm) {
    contractForm.addEventListener("submit", onContractFormSubmit);
  }

  const accountSelect = $("#ns-staff-account-modal");
  if (accountSelect) {
    accountSelect.addEventListener("change", syncEmailFromSelectedAccount);
  }

  initTabs();
  initStaffFilters();
  initContractFilters();

  const refreshBtn = $("#ns-btn-refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      await refreshStaffList();
      await refreshContractList();
    });
  }

  try {
    await loadDropdownData();
    await fetchAccountOptionsIfNeeded(); // preload cho nhanh khi mở modal tạo nhân sự
    await refreshStaffList();
    await refreshContractList();
  } catch (err) {
    console.error(err);
  }
}
