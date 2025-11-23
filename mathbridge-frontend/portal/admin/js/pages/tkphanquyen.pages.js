// portal/admin/js/pages/tkphanquyen.pages.js
import {
  apiSearchAccounts,
  apiGetAccountDetail,
  apiCreateAccount,
  apiUpdateAccount,
  apiDeleteAccount,
  apiSearchRoles,
  apiGetAllRoles,
  apiCreateRole,
  apiUpdateRole,
  apiDeleteRole,
} from "../api/tkphanquyen.api.js";

let accountFilters = {
  searchKeyword: "",
  roleId: "",
  ownerType: "ALL",
  status: "ALL",
  page: 0,
  size: 10,
};

let roleFilters = {
  searchKeyword: "",
  page: 0,
  size: 10,
};

let allRolesCache = [];

/**
 * Helper: toggle view theo tab
 */
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tkpq-tab");
  const views = document.querySelectorAll(".tkpq-view");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetView = btn.getAttribute("data-view");

      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      views.forEach((v) => {
        if (v.getAttribute("data-view") === targetView) {
          v.classList.remove("hidden");
        } else {
          v.classList.add("hidden");
        }
      });

      if (targetView === "accounts") {
        loadAccounts();
      } else if (targetView === "roles") {
        loadRoles();
      }
    });
  });
}

/**
 * Helper: mở / đóng modal
 */
function openModal(id) {
  const backdrop = document.getElementById(id);
  if (backdrop) {
    backdrop.hidden = false;
    backdrop.classList.add("is-open");
  }
}

function closeModal(id) {
  const backdrop = document.getElementById(id);
  if (backdrop) {
    backdrop.classList.remove("is-open");
    // delay nhỏ cho animation (nếu có)
    setTimeout(() => {
      backdrop.hidden = true;
    }, 120);
  }
}

function setupModalCloseHandlers() {
  document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-close-modal]");
    if (closeBtn) {
      const id = closeBtn.getAttribute("data-close-modal");
      closeModal(id);
    }
  });

  // click ra ngoài modal
  ["tkpq-account-modal", "tkpq-role-modal"].forEach((id) => {
    const backdrop = document.getElementById(id);
    if (!backdrop) return;
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeModal(id);
      }
    });
  });
}

/* ==========================
   ACCOUNTS VIEW
   ========================== */

async function loadRolesForFilterAndMultiselect() {
  try {
    allRolesCache = await apiGetAllRoles();

    const filterSelect = document.getElementById("tkpq-filter-role");
    const multiSelect = document.getElementById("tkpq-account-roles");

    if (filterSelect) {
      const currentValue = filterSelect.value;
      filterSelect.innerHTML =
        '<option value="">Tất cả vai trò</option>' +
        allRolesCache
          .map(
            (r) =>
              `<option value="${r.idRole}">${r.idRole} - ${r.tenVaiTro}</option>`
          )
          .join("");
      filterSelect.value = currentValue;
    }

    if (multiSelect) {
      multiSelect.innerHTML = allRolesCache
        .map(
          (r) =>
            `<option value="${r.idRole}">${r.idRole} - ${r.tenVaiTro}</option>`
        )
        .join("");
    }
  } catch (err) {
    console.error(err);
    alert("Không thể tải danh sách vai trò cho bộ lọc.");
  }
}

function getStatusChip(trangThai) {
  const text = trangThai || "N/A";
  let dotClass = "tkpq-chip-dot inactive";
  if (trangThai === "ACTIVE") dotClass = "tkpq-chip-dot";
  if (trangThai === "LOCKED") dotClass = "tkpq-chip-dot locked";

  return `<span class="tkpq-chip">
    <span class="${dotClass}"></span>
    <span>${text}</span>
  </span>`;
}

function getOwnerTypeFromAccount(acc) {
  if (acc.idHs) return "Học sinh";
  if (acc.idNv) return "Nhân viên";
  return "Khác";
}

function formatOwnerText(acc) {
  if (acc.idHs && acc.idNv) {
    return `ID_HS: ${acc.idHs} / ID_NV: ${acc.idNv}`;
  }
  if (acc.idHs) return `ID_HS: ${acc.idHs}`;
  if (acc.idNv) return `ID_NV: ${acc.idNv}`;
  return "-";
}

function formatDateTime(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString("vi-VN");
}

function renderAccountsTable(response) {
  const tbody = document.getElementById("tkpq-accounts-tbody");
  const emptyState = document.getElementById("tkpq-accounts-empty");
  const paginationEl = document.getElementById("tkpq-accounts-pagination");

  if (!tbody) return;

  const items = Array.isArray(response)
    ? response
    : response?.content || [];

  tbody.innerHTML = "";

  if (!items.length) {
    if (emptyState) emptyState.hidden = false;
    if (paginationEl) paginationEl.innerHTML = "";
    return;
  }

  if (emptyState) emptyState.hidden = true;

  items.forEach((acc) => {
    const rolesText = Array.isArray(acc.roles)
      ? acc.roles.map((r) => r.tenVaiTro || r.idRole).join(", ")
      : "-";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${acc.idTk || ""}</td>
      <td>${acc.email || ""}</td>
      <td>${getOwnerTypeFromAccount(acc)}</td>
      <td>${formatOwnerText(acc)}</td>
      <td>
        ${
          rolesText
            ? `<span class="tkpq-chip small">${rolesText}</span>`
            : "-"
        }
      </td>
      <td>${getStatusChip(acc.trangThai)}</td>
      <td>${formatDateTime(acc.thoiDiemTao)}</td>
      <td>
        <button
          type="button"
          class="btn ghost tkpq-btn-edit-account"
          data-id="${acc.idTk}"
        >
          <i class="ri-edit-line"></i>
        </button>
        <button
          type="button"
          class="btn ghost tkpq-btn-delete-account"
          data-id="${acc.idTk}"
        >
          <i class="ri-delete-bin-line"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Simple pagination render nếu response có thông tin
  if (!paginationEl) return;
  paginationEl.innerHTML = "";

  if (response && typeof response.totalPages === "number") {
    const totalPages = response.totalPages;
    const currentPage = response.page ?? 0;

    if (totalPages > 1) {
      for (let p = 0; p < totalPages; p++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tkpq-page-btn" + (p === currentPage ? " active" : "");
        btn.textContent = p + 1;
        btn.addEventListener("click", () => {
          accountFilters.page = p;
          loadAccounts();
        });
        paginationEl.appendChild(btn);
      }
    }
  }
}

async function loadAccounts() {
  try {
    const result = await apiSearchAccounts(accountFilters);
    renderAccountsTable(result);
  } catch (err) {
    console.error(err);
    alert("Không thể tải danh sách tài khoản.");
  }
}

function setupAccountsFilters() {
  const searchInput = document.getElementById("tkpq-account-search");
  const roleSelect = document.getElementById("tkpq-filter-role");
  const typeSelect = document.getElementById("tkpq-filter-type");
  const statusSelect = document.getElementById("tkpq-filter-status");
  const refreshBtn = document.getElementById("tkpq-btn-refresh-accounts");

  if (searchInput) {
    let searchTimeout = null;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        accountFilters.searchKeyword = searchInput.value.trim();
        accountFilters.page = 0;
        loadAccounts();
      }, 400);
    });
  }

  if (roleSelect) {
    roleSelect.addEventListener("change", () => {
      accountFilters.roleId = roleSelect.value || "";
      accountFilters.page = 0;
      loadAccounts();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      accountFilters.ownerType = typeSelect.value || "ALL";
      accountFilters.page = 0;
      loadAccounts();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener("change", () => {
      accountFilters.status = statusSelect.value || "ALL";
      accountFilters.page = 0;
      loadAccounts();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      accountFilters = {
        searchKeyword: "",
        roleId: "",
        ownerType: "ALL",
        status: "ALL",
        page: 0,
        size: 10,
      };
      if (searchInput) searchInput.value = "";
      if (roleSelect) roleSelect.value = "";
      if (typeSelect) typeSelect.value = "ALL";
      if (statusSelect) statusSelect.value = "ALL";
      loadAccounts();
    });
  }

  const globalRefresh = document.getElementById("tkpq-refresh-all");
  if (globalRefresh) {
    globalRefresh.addEventListener("click", () => {
      loadRolesForFilterAndMultiselect();
      loadAccounts();
      loadRoles();
    });
  }
}

/**
 * Mở modal account (create / edit)
 */
function openAccountModalForCreate() {
  const titleEl = document.getElementById("tkpq-account-modal-title");
  const idTkInput = document.getElementById("tkpq-account-idTk");
  const emailInput = document.getElementById("tkpq-account-email");
  const pwInput = document.getElementById("tkpq-account-password");
  const statusSelect = document.getElementById("tkpq-account-status");
  const idHsSpan = document.getElementById("tkpq-account-idHs");
  const idNvSpan = document.getElementById("tkpq-account-idNv");
  const rolesSelect = document.getElementById("tkpq-account-roles");

  if (titleEl) titleEl.textContent = "Thêm tài khoản";
  if (idTkInput) idTkInput.value = "";
  if (emailInput) emailInput.value = "";
  if (pwInput) pwInput.value = "";
  if (statusSelect) statusSelect.value = "ACTIVE";
  if (idHsSpan) idHsSpan.textContent = "-";
  if (idNvSpan) idNvSpan.textContent = "-";
  if (rolesSelect) {
    Array.from(rolesSelect.options).forEach((opt) => {
      opt.selected = false;
    });
  }

  openModal("tkpq-account-modal");
}

async function openAccountModalForEdit(idTk) {
  try {
    const acc = await apiGetAccountDetail(idTk);

    const titleEl = document.getElementById("tkpq-account-modal-title");
    const idTkInput = document.getElementById("tkpq-account-idTk");
    const emailInput = document.getElementById("tkpq-account-email");
    const pwInput = document.getElementById("tkpq-account-password");
    const statusSelect = document.getElementById("tkpq-account-status");
    const idHsSpan = document.getElementById("tkpq-account-idHs");
    const idNvSpan = document.getElementById("tkpq-account-idNv");
    const rolesSelect = document.getElementById("tkpq-account-roles");

    if (titleEl) titleEl.textContent = `Cập nhật tài khoản (${acc.idTk})`;
    if (idTkInput) idTkInput.value = acc.idTk || "";
    if (emailInput) emailInput.value = acc.email || "";
    if (pwInput) pwInput.value = ""; // để trống, BE tự xử lý nếu không gửi
    if (statusSelect) statusSelect.value = acc.trangThai || "ACTIVE";
    if (idHsSpan) idHsSpan.textContent = acc.idHs || "-";
    if (idNvSpan) idNvSpan.textContent = acc.idNv || "-";

    if (rolesSelect) {
      const currentRoleIds = Array.isArray(acc.roles)
        ? acc.roles.map((r) => r.idRole)
        : [];
      Array.from(rolesSelect.options).forEach((opt) => {
        opt.selected = currentRoleIds.includes(opt.value);
      });
    }

    openModal("tkpq-account-modal");
  } catch (err) {
    console.error(err);
    alert("Không thể tải chi tiết tài khoản.");
  }
}

function setupAccountModalSubmit() {
  const form = document.getElementById("tkpq-account-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idTkInput = document.getElementById("tkpq-account-idTk");
    const emailInput = document.getElementById("tkpq-account-email");
    const pwInput = document.getElementById("tkpq-account-password");
    const statusSelect = document.getElementById("tkpq-account-status");
    const idHsSpan = document.getElementById("tkpq-account-idHs");
    const idNvSpan = document.getElementById("tkpq-account-idNv");
    const rolesSelect = document.getElementById("tkpq-account-roles");

    const idTk = idTkInput?.value?.trim() || "";
    const email = emailInput?.value?.trim() || "";
    const passWord = pwInput?.value || "";
    const trangThai = statusSelect?.value || "ACTIVE";
    const idHs =
      idHsSpan && idHsSpan.textContent !== "-" ? idHsSpan.textContent : null;
    const idNv =
      idNvSpan && idNvSpan.textContent !== "-" ? idNvSpan.textContent : null;

    const roleIds = rolesSelect
      ? Array.from(rolesSelect.selectedOptions).map((opt) => opt.value)
      : [];

    const payload = {
      email,
      trangThai,
      idHs,
      idNv,
      roleIds,
    };

    // Chỉ gửi passWord nếu tạo mới hoặc thực sự nhập
    if (!idTk || passWord) {
      payload.passWord = passWord;
    }

    try {
      if (idTk) {
        await apiUpdateAccount(idTk, payload);
      } else {
        await apiCreateAccount(payload);
      }
      closeModal("tkpq-account-modal");
      await loadAccounts();
    } catch (err) {
      console.error(err);
      alert("Không thể lưu tài khoản. Vui lòng kiểm tra lại dữ liệu.");
    }
  });
}

function setupAccountRowActions() {
  const tbody = document.getElementById("tkpq-accounts-tbody");
  if (!tbody) return;

  tbody.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".tkpq-btn-edit-account");
    const delBtn = e.target.closest(".tkpq-btn-delete-account");

    if (editBtn) {
      const idTk = editBtn.getAttribute("data-id");
      if (idTk) {
        await openAccountModalForEdit(idTk);
      }
    }

    if (delBtn) {
      const idTk = delBtn.getAttribute("data-id");
      if (idTk && confirm("Xóa tài khoản này?")) {
        try {
          await apiDeleteAccount(idTk);
          await loadAccounts();
        } catch (err) {
          console.error(err);
          alert("Không thể xóa tài khoản. Kiểm tra ràng buộc dữ liệu.");
        }
      }
    }
  });

  const addBtn = document.getElementById("tkpq-btn-add-account");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      openAccountModalForCreate();
    });
  }
}

/* ==========================
   ROLES VIEW
   ========================== */

function renderRolesTable(response) {
  const tbody = document.getElementById("tkpq-roles-tbody");
  const emptyState = document.getElementById("tkpq-roles-empty");
  const paginationEl = document.getElementById("tkpq-roles-pagination");

  if (!tbody) return;

  const items = Array.isArray(response)
    ? response
    : response?.content || [];

  tbody.innerHTML = "";

  if (!items.length) {
    if (emptyState) emptyState.hidden = false;
    if (paginationEl) paginationEl.innerHTML = "";
    return;
  }

  if (emptyState) emptyState.hidden = true;

  items.forEach((role) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${role.idRole || ""}</td>
      <td>${role.tenVaiTro || ""}</td>
      <td>${role.ghiChu || ""}</td>
      <td>
        <button
          type="button"
          class="btn ghost tkpq-btn-edit-role"
          data-id="${role.idRole}"
        >
          <i class="ri-edit-line"></i>
        </button>
        <button
          type="button"
          class="btn ghost tkpq-btn-delete-role"
          data-id="${role.idRole}"
        >
          <i class="ri-delete-bin-line"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (!paginationEl) return;
  paginationEl.innerHTML = "";

  if (response && typeof response.totalPages === "number") {
    const totalPages = response.totalPages;
    const currentPage = response.page ?? 0;

    if (totalPages > 1) {
      for (let p = 0; p < totalPages; p++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tkpq-page-btn" + (p === currentPage ? " active" : "");
        btn.textContent = p + 1;
        btn.addEventListener("click", () => {
          roleFilters.page = p;
          loadRoles();
        });
        paginationEl.appendChild(btn);
      }
    }
  }
}

async function loadRoles() {
  try {
    const result = await apiSearchRoles(roleFilters);
    renderRolesTable(result);
  } catch (err) {
    console.error(err);
    alert("Không thể tải danh sách vai trò.");
  }
}

function setupRolesFilters() {
  const searchInput = document.getElementById("tkpq-role-search");
  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        roleFilters.searchKeyword = searchInput.value.trim();
        roleFilters.page = 0;
        loadRoles();
      }, 400);
    });
  }

  const addBtn = document.getElementById("tkpq-btn-add-role");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      openRoleModalForCreate();
    });
  }
}

async function openRoleModalForEdit(idRole) {
  try {
    // Thử lấy từ cache
    let role =
      allRolesCache.find((r) => r.idRole === idRole) || null;

    // Nếu không có trong cache, gọi search 1 item
    if (!role) {
      const res = await apiSearchRoles({
        searchKeyword: idRole,
        page: 0,
        size: 1,
      });
      const list = Array.isArray(res) ? res : res?.content || [];
      role = list[0];
    }

    if (!role) {
      alert("Không tìm thấy vai trò.");
      return;
    }

    const titleEl = document.getElementById("tkpq-role-modal-title");
    const idInput = document.getElementById("tkpq-role-id");
    const nameInput = document.getElementById("tkpq-role-name");
    const noteInput = document.getElementById("tkpq-role-note");

    if (titleEl) titleEl.textContent = `Cập nhật vai trò (${role.idRole})`;
    if (idInput) {
      idInput.value = role.idRole || "";
      idInput.disabled = true; // không cho sửa PK
    }
    if (nameInput) nameInput.value = role.tenVaiTro || "";
    if (noteInput) noteInput.value = role.ghiChu || "";

    openModal("tkpq-role-modal");
  } catch (err) {
    console.error(err);
    alert("Không thể tải chi tiết vai trò.");
  }
}

function openRoleModalForCreate() {
  const titleEl = document.getElementById("tkpq-role-modal-title");
  const idInput = document.getElementById("tkpq-role-id");
  const nameInput = document.getElementById("tkpq-role-name");
  const noteInput = document.getElementById("tkpq-role-note");

  if (titleEl) titleEl.textContent = "Thêm vai trò";
  if (idInput) {
    idInput.value = "";
    idInput.disabled = false;
  }
  if (nameInput) nameInput.value = "";
  if (noteInput) noteInput.value = "";

  openModal("tkpq-role-modal");
}

function setupRoleModalSubmit() {
  const form = document.getElementById("tkpq-role-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idInput = document.getElementById("tkpq-role-id");
    const nameInput = document.getElementById("tkpq-role-name");
    const noteInput = document.getElementById("tkpq-role-note");

    const idRole = idInput?.value?.trim() || "";
    const tenVaiTro = nameInput?.value?.trim() || "";
    const ghiChu = noteInput?.value?.trim() || "";

    if (!idRole || !tenVaiTro) {
      alert("Vui lòng nhập đầy đủ ID_Role và Tên vai trò.");
      return;
    }

    const payload = { idRole, tenVaiTro, ghiChu };

    try {
      if (idInput.disabled) {
        // đang edit
        await apiUpdateRole(idRole, payload);
      } else {
        await apiCreateRole(payload);
      }

      closeModal("tkpq-role-modal");
      await loadRoles();
      await loadRolesForFilterAndMultiselect();
    } catch (err) {
      console.error(err);
      alert("Không thể lưu vai trò.");
    }
  });
}

function setupRoleRowActions() {
  const tbody = document.getElementById("tkpq-roles-tbody");
  if (!tbody) return;

  tbody.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".tkpq-btn-edit-role");
    const delBtn = e.target.closest(".tkpq-btn-delete-role");

    if (editBtn) {
      const idRole = editBtn.getAttribute("data-id");
      if (idRole) {
        await openRoleModalForEdit(idRole);
      }
    }

    if (delBtn) {
      const idRole = delBtn.getAttribute("data-id");
      if (idRole && confirm("Xóa vai trò này?")) {
        try {
          await apiDeleteRole(idRole);
          await loadRoles();
          await loadRolesForFilterAndMultiselect();
        } catch (err) {
          console.error(err);
          alert(
            "Không thể xóa vai trò. Kiểm tra xem có tài khoản nào đang dùng vai trò này không."
          );
        }
      }
    }
  });
}

/* ==========================
   INIT ENTRY
   ========================== */

/**
 * Hàm nội bộ khởi tạo trang Tài khoản & Phân quyền
 */
async function initTkPhanQuyenPage() {
  setupTabs();
  setupModalCloseHandlers();

  setupAccountsFilters();
  setupAccountModalSubmit();
  setupAccountRowActions();

  setupRolesFilters();
  setupRoleModalSubmit();
  setupRoleRowActions();

  // load dữ liệu ban đầu
  await loadRolesForFilterAndMultiselect();
  await loadAccounts();
}

/**
 * Export đúng tên mà admin.js đang gọi: initTaiKhoanPage
 */
export async function initTaiKhoanPage() {
  await initTkPhanQuyenPage();
}
