// portal/admin/js/pages/tkphanquyen.pages.js
import {
  apiSearchAccounts,
  apiGetAccountDetail,
  apiCreateAccount,
  apiUpdateAccount,
  apiSearchRoles,
  apiGetAllRoles,
  apiCreateRole,
  apiUpdateRole,
  apiDeleteRole,
} from "../api/tkphanquyen.api.js";

let accountFilters = {
  searchKeyword: "",
  roleId: "",
  ownerType: "ALL", // ALL | HS | NV | OTHER
  status: "ALL", // ALL | ACTIVE | INACTIVE | LOCKED
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
      if (!targetView) return;

      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      views.forEach((v) => {
        const viewKey = v.getAttribute("data-view");
        v.hidden = viewKey !== targetView;
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
    backdrop.hidden = true;
    backdrop.classList.remove("is-open");
  }
}

function setupModalBackdropClose() {
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
    const roles = await apiGetAllRoles();
    allRolesCache = Array.isArray(roles) ? roles : [];

    // Fill dropdown filter (vai trò)
    const filterSelect = document.getElementById("tkpq-filter-role");
    if (filterSelect) {
      const currentValue = filterSelect.value;
      filterSelect.innerHTML =
        '<option value="">Tất cả vai trò</option>' +
        allRolesCache
          .map(
            (r) =>
              `<option value="${r.idRole}">${r.tenVaiTro || r.idRole}</option>`
          )
          .join("");
      if (currentValue) {
        filterSelect.value = currentValue;
      }
    }

    // Fill multiselect trong modal tài khoản
    const multiSelect = document.getElementById("tkpq-account-roles");
    if (multiSelect) {
      multiSelect.innerHTML = allRolesCache
        .map(
          (r) =>
            `<option value="${r.idRole}">${r.tenVaiTro || r.idRole}</option>`
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
          title="Chỉnh sửa tài khoản"
        >
          <i class="ri-edit-line"></i>
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

function setupAccountFilters() {
  const searchInput = document.getElementById("tkpq-filter-search");
  const roleSelect = document.getElementById("tkpq-filter-role");
  const typeSelect = document.getElementById("tkpq-filter-owner-type");
  const statusSelect = document.getElementById("tkpq-filter-status");
  const resetBtn = document.getElementById("tkpq-filter-reset");
  const refreshBtn = document.getElementById("tkpq-refresh-all");

  if (searchInput) {
    let searchTimeout = null;
    searchInput.addEventListener("input", () => {
      const value = searchInput.value || "";
      if (searchTimeout) clearTimeout(searchTimeout);

      searchTimeout = setTimeout(() => {
        accountFilters.searchKeyword = value.trim();
        accountFilters.page = 0;
        loadAccounts();
      }, 300);
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

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
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
      loadRolesForFilterAndMultiselect();
    });
  }
}

function resetAccountModal() {
  const form = document.getElementById("tkpq-account-form");
  if (!form) return;

  form.reset();
  const idField = document.getElementById("tkpq-account-idTk");
  const idHsSpan = document.getElementById("tkpq-account-idHs");
  const idNvSpan = document.getElementById("tkpq-account-idNv");
  const rolesSelect = document.getElementById("tkpq-account-roles");
  const titleEl = document.getElementById("tkpq-account-modal-title");

  if (idField) idField.value = "";
  if (idHsSpan) idHsSpan.textContent = "-";
  if (idNvSpan) idNvSpan.textContent = "-";
  if (rolesSelect) {
    for (const opt of rolesSelect.options) {
      opt.selected = false;
    }
  }
  if (titleEl) {
    titleEl.textContent = "Thêm tài khoản";
  }
}

async function openAccountModalForCreate() {
  resetAccountModal();
  openModal("tkpq-account-modal");
}

async function openAccountModalForEdit(idTk) {
  resetAccountModal();
  try {
    const acc = await apiGetAccountDetail(idTk);
    const idField = document.getElementById("tkpq-account-idTk");
    const emailInput = document.getElementById("tkpq-account-email");
    const statusSelect = document.getElementById("tkpq-account-status");
    const idHsSpan = document.getElementById("tkpq-account-idHs");
    const idNvSpan = document.getElementById("tkpq-account-idNv");
    const rolesSelect = document.getElementById("tkpq-account-roles");
    const titleEl = document.getElementById("tkpq-account-modal-title");

    if (idField) idField.value = acc.idTk || "";
    if (emailInput) emailInput.value = acc.email || "";
    if (statusSelect && acc.trangThai) {
      statusSelect.value = acc.trangThai;
    }
    if (idHsSpan) idHsSpan.textContent = acc.idHs || "-";
    if (idNvSpan) idNvSpan.textContent = acc.idNv || "-";

    if (rolesSelect && Array.isArray(acc.roles)) {
      const roleIds = acc.roles.map((r) => r.idRole);
      for (const opt of rolesSelect.options) {
        opt.selected = roleIds.includes(opt.value);
      }
    }

    if (titleEl) {
      titleEl.textContent = `Chỉnh sửa tài khoản ${acc.idTk || ""}`;
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

    const idField = document.getElementById("tkpq-account-idTk");
    const emailInput = document.getElementById("tkpq-account-email");
    const passwordInput = document.getElementById("tkpq-account-password");
    const statusSelect = document.getElementById("tkpq-account-status");
    const rolesSelect = document.getElementById("tkpq-account-roles");

    const idTk = idField?.value?.trim();
    const email = emailInput?.value?.trim();
    const password = passwordInput?.value?.trim();
    const trangThai = statusSelect?.value || "ACTIVE";

    const selectedRoleIds = [];
    if (rolesSelect) {
      for (const opt of rolesSelect.options) {
        if (opt.selected) selectedRoleIds.push(opt.value);
      }
    }

    if (!email) {
      alert("Email không được để trống.");
      return;
    }

    const payload = {
      email,
      trangThai,
      roleIds: selectedRoleIds,
    };

    // ===============================
    // QUAN TRỌNG: logic password
    // ===============================
    // - Tạo mới (idTk rỗng): bắt buộc nhập mật khẩu
    // - Sửa: chỉ gửi passWord nếu user nhập (đổi mật khẩu)
    if (!idTk) {
      // CREATE
      if (!password) {
        alert("Mật khẩu không được để trống khi tạo mới tài khoản.");
        return;
      }
      payload.passWord = password;
    } else {
      // UPDATE
      if (password) {
        payload.passWord = password;
      }
    }

    try {
      if (!idTk) {
        await apiCreateAccount(payload);
      } else {
        await apiUpdateAccount(idTk, payload);
      }
      closeModal("tkpq-account-modal");
      await loadAccounts();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Không thể lưu tài khoản.");
    }
  });
}

function setupAccountRowActions() {
  const tbody = document.getElementById("tkpq-accounts-tbody");
  if (!tbody) return;

  tbody.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".tkpq-btn-edit-account");

    if (editBtn) {
      const idTk = editBtn.getAttribute("data-id");
      if (idTk) {
        await openAccountModalForEdit(idTk);
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

  if (!tbody) return;

  const items = Array.isArray(response)
    ? response
    : response?.content || [];

  tbody.innerHTML = "";

  if (!items.length) {
    if (emptyState) emptyState.hidden = false;
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

function setupRoleFilters() {
  const searchInput = document.getElementById("tkpq-role-search");
  if (!searchInput) return;

  let timeout = null;
  searchInput.addEventListener("input", () => {
    const value = searchInput.value || "";
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      roleFilters.searchKeyword = value.trim();
      roleFilters.page = 0;
      loadRoles();
    }, 300);
  });
}

function resetRoleModal() {
  const form = document.getElementById("tkpq-role-form");
  if (!form) return;

  form.reset();
  const idInput = document.getElementById("tkpq-role-id");
  const modeInput = document.getElementById("tkpq-role-mode");
  const titleEl = document.getElementById("tkpq-role-modal-title");

  if (idInput) {
    idInput.disabled = false;
  }
  if (modeInput) {
    modeInput.value = "create";
  }
  if (titleEl) {
    titleEl.textContent = "Thêm vai trò";
  }
}

function setupRoleModalSubmit() {
  const form = document.getElementById("tkpq-role-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idInput = document.getElementById("tkpq-role-id");
    const nameInput = document.getElementById("tkpq-role-name");
    const noteInput = document.getElementById("tkpq-role-note");
    const modeInput = document.getElementById("tkpq-role-mode");

    const idRole = idInput?.value?.trim();
    const tenVaiTro = nameInput?.value?.trim();
    const ghiChu = noteInput?.value?.trim();
    const mode = modeInput?.value || "create";

    if (!idRole || !tenVaiTro) {
      alert("ID_Role và Tên vai trò không được để trống.");
      return;
    }

    const payload = {
      idRole,
      tenVaiTro,
      ghiChu,
    };

    try {
      if (mode === "create") {
        await apiCreateRole(payload);
      } else {
        await apiUpdateRole(idRole, payload);
      }
      closeModal("tkpq-role-modal");
      await loadRoles();
      await loadRolesForFilterAndMultiselect();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Không thể lưu vai trò.");
    }
  });
}

function setupRoleRowActions() {
  const tbody = document.getElementById("tkpq-roles-tbody");
  const addBtn = document.getElementById("tkpq-btn-add-role");
  if (!tbody) return;

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      resetRoleModal();
      openModal("tkpq-role-modal");
    });
  }

  tbody.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".tkpq-btn-edit-role");
    const delBtn = e.target.closest(".tkpq-btn-delete-role");

    if (editBtn) {
      const idRole = editBtn.getAttribute("data-id");
      if (idRole) {
        const rows = tbody.querySelectorAll("tr");
        let selectedRole = null;
        rows.forEach((row) => {
          const firstCell = row.querySelector("td");
          if (firstCell && firstCell.textContent === idRole) {
            const cells = row.querySelectorAll("td");
            selectedRole = {
              idRole,
              tenVaiTro: cells[1]?.textContent || "",
              ghiChu: cells[2]?.textContent || "",
            };
          }
        });

        if (selectedRole) {
          const idInput = document.getElementById("tkpq-role-id");
          const nameInput = document.getElementById("tkpq-role-name");
          const noteInput = document.getElementById("tkpq-role-note");
          const modeInput = document.getElementById("tkpq-role-mode");
          const titleEl = document.getElementById("tkpq-role-modal-title");

          if (idInput) {
            idInput.value = selectedRole.idRole;
            idInput.disabled = true;
          }
          if (nameInput)
            nameInput.value = selectedRole.tenVaiTro || "";
          if (noteInput) noteInput.value = selectedRole.ghiChu || "";
          if (modeInput) modeInput.value = "edit";
          if (titleEl)
            titleEl.textContent = `Chỉnh sửa vai trò ${selectedRole.idRole}`;

          openModal("tkpq-role-modal");
        }
      }
    }

    if (delBtn) {
      const idRole = delBtn.getAttribute("data-id");
      if (
        idRole &&
        confirm(
          "Xóa vai trò này? Nếu đang được gán cho tài khoản nào đó sẽ không xóa được."
        )
      ) {
        try {
          await apiDeleteRole(idRole);
          await loadRoles();
          await loadRolesForFilterAndMultiselect();
        } catch (err) {
          console.error(err);
          alert(
            err?.message ||
              "Không thể xóa vai trò. Kiểm tra ràng buộc dữ liệu."
          );
        }
      }
    }
  });
}

/* ==========================
   INIT
   ========================== */

export async function initTkPhanQuyenPage() {
  setupTabs();
  setupModalBackdropClose();

  setupAccountFilters();
  setupAccountModalSubmit();
  setupAccountRowActions();

  setupRoleFilters();
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
