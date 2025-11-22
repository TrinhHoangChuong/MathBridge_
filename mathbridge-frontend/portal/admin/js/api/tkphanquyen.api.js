// portal/admin/js/api/tkphanquyen.api.js
import { CONFIG } from "../../../../assets/js/config.js";

const BASE_URL = `${CONFIG.BASE_URL}/api/portal/admin/tk-phanquyen`;

/**
 * Tìm kiếm / lọc danh sách tài khoản
 *
 * Body:
 * {
 *   searchKeyword,
 *   roleId,
 *   ownerType, // ALL | HS | NV | OTHER
 *   status,    // ALL | ACTIVE | INACTIVE | LOCKED
 *   page,
 *   size
 * }
 */
export async function apiSearchAccounts(filterPayload = {}) {
  const res = await fetch(`${BASE_URL}/accounts/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filterPayload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách tài khoản");
  }
  return res.json();
}

/**
 * Lấy chi tiết 1 tài khoản theo ID_TK
 */
export async function apiGetAccountDetail(idTk) {
  const res = await fetch(
    `${BASE_URL}/accounts/${encodeURIComponent(idTk)}`
  );

  if (!res.ok) {
    throw new Error("Không thể tải chi tiết tài khoản");
  }
  return res.json();
}

/**
 * Tạo mới tài khoản
 *
 * Payload:
 * {
 *   email,
 *   passWord,
 *   trangThai,
 *   idHs,
 *   idNv,
 *   roleIds: []
 * }
 */
export async function apiCreateAccount(payload) {
  const res = await fetch(`${BASE_URL}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo tài khoản mới");
  }
  return res.json();
}

/**
 * Cập nhật tài khoản + phân quyền
 */
export async function apiUpdateAccount(idTk, payload) {
  const res = await fetch(
    `${BASE_URL}/accounts/${encodeURIComponent(idTk)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể cập nhật tài khoản");
  }
  return res.json();
}

/**
 * Xóa tài khoản
 * BE trả 204 No Content → KHÔNG parse JSON
 */
export async function apiDeleteAccount(idTk) {
  const res = await fetch(
    `${BASE_URL}/accounts/${encodeURIComponent(idTk)}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error("Không thể xóa tài khoản");
  }
  // không return gì thêm
}

/**
 * Tìm kiếm / lọc danh sách vai trò (bảng Role)
 *
 * Body:
 * {
 *   searchKeyword,
 *   page,
 *   size
 * }
 */
export async function apiSearchRoles(filterPayload = {}) {
  const res = await fetch(`${BASE_URL}/roles/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filterPayload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách vai trò");
  }
  return res.json();
}

/**
 * Lấy toàn bộ roles (dropdown filter, multiselect)
 * Response: Array<{ idRole, tenVaiTro, ghiChu }>
 */
export async function apiGetAllRoles() {
  const res = await fetch(`${BASE_URL}/roles/all`);

  if (!res.ok) {
    throw new Error("Không thể tải danh sách vai trò");
  }
  return res.json();
}

/**
 * Tạo mới vai trò (bảng Role)
 * Payload: { idRole, tenVaiTro, ghiChu }
 */
export async function apiCreateRole(payload) {
  const res = await fetch(`${BASE_URL}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo vai trò mới");
  }
  return res.json();
}

/**
 * Cập nhật vai trò
 */
export async function apiUpdateRole(idRole, payload) {
  const res = await fetch(
    `${BASE_URL}/roles/${encodeURIComponent(idRole)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể cập nhật vai trò");
  }
  return res.json();
}

/**
 * Xóa vai trò – BE trả 204 No Content
 */
export async function apiDeleteRole(idRole) {
  const res = await fetch(
    `${BASE_URL}/roles/${encodeURIComponent(idRole)}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error("Không thể xóa vai trò");
  }
  // không return gì thêm
}
