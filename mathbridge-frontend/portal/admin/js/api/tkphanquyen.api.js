// portal/admin/js/api/tkphanquyen.api.js
import { CONFIG } from "../../../../assets/js/config.js";
import { getAuthHeaders } from "../admin-auth-guard.js";

const BASE_URL = `${CONFIG.BASE_URL}/api/portal/admin/tk-phanquyen`;

/**
 * Helper: parse JSON an toàn, BE có thể trả 201/204 không body
 */
async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn("[TKPQ] Không parse được JSON, trả về null.", err);
    return null;
  }
}

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
export async function apiSearchAccounts(filters) {
  const res = await fetch(`${BASE_URL}/accounts/search`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(filters || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách tài khoản");
  }

  const data = await parseJsonSafe(res);
  return (
    data || {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 0,
    }
  );
}

/**
 * Lấy chi tiết 1 tài khoản
 */
export async function apiGetAccountDetail(idTk) {
  const res = await fetch(
    `${BASE_URL}/accounts/${encodeURIComponent(idTk)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể tải chi tiết tài khoản");
  }

  return await parseJsonSafe(res);
}

/**
 * Tạo tài khoản mới + gán quyền
 */
export async function apiCreateAccount(payload) {
  const res = await fetch(`${BASE_URL}/accounts`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo tài khoản mới");
  }

  return await parseJsonSafe(res);
}

/**
 * Cập nhật tài khoản + phân quyền
 */
export async function apiUpdateAccount(idTk, payload) {
  const res = await fetch(
    `${BASE_URL}/accounts/${encodeURIComponent(idTk)}`,
    {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload || {}),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể cập nhật tài khoản");
  }

  return await parseJsonSafe(res);
}

/**
 * Xóa tài khoản
 * BE thường trả 204 No Content → KHÔNG parse JSON
 */
export async function apiDeleteAccount(idTk) {
  const res = await fetch(
    `${BASE_URL}/accounts/${encodeURIComponent(idTk)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
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
export async function apiSearchRoles(filters) {
  const res = await fetch(`${BASE_URL}/roles/search`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(filters || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách vai trò");
  }

  const data = await parseJsonSafe(res);
  return (
    data || {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 0,
    }
  );
}

/**
 * Lấy toàn bộ Role, dùng cho dropdown filter + multiselect
 */
export async function apiGetAllRoles() {
  const res = await fetch(`${BASE_URL}/roles/all`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách vai trò");
  }

  const data = await parseJsonSafe(res);
  return Array.isArray(data) ? data : [];
}

/**
 * Tạo role mới
 */
export async function apiCreateRole(payload) {
  const res = await fetch(`${BASE_URL}/roles`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo vai trò mới");
  }

  return await parseJsonSafe(res);
}

/**
 * Cập nhật role
 */
export async function apiUpdateRole(idRole, payload) {
  const res = await fetch(
    `${BASE_URL}/roles/${encodeURIComponent(idRole)}`,
    {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload || {}),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể cập nhật vai trò");
  }

  return await parseJsonSafe(res);
}

/**
 * Xóa vai trò – BE trả 204 No Content
 */
export async function apiDeleteRole(idRole) {
  const res = await fetch(
    `${BASE_URL}/roles/${encodeURIComponent(idRole)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể xóa vai trò");
  }
  // không return gì thêm
}
