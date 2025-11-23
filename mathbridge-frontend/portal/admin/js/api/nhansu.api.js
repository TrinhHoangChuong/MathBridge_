// portal/admin/js/api/nhansu.api.js
import { CONFIG } from "../../../../assets/js/config.js";
import { getAuthHeaders } from "../admin-auth-guard.js";

const BASE_URL = `${CONFIG.BASE_URL}/api/portal/admin/nhansu`;

// ================= DROPDOWN CƠ SỞ & VAI TRÒ =================

/**
 * Lấy danh sách cơ sở (bảng CoSo)
 * GET /coso
 */
export async function apiGetCampuses() {
  const res = await fetch(`${BASE_URL}/coso`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách cơ sở");
  }
  return res.json();
}

/**
 * Lấy danh sách vai trò (bảng Role)
 * GET /roles
 *
 * Dùng cho:
 *  - Lọc danh sách nhân sự theo role.
 *  - Hiển thị cột "Vai trò" (từ backend trả về).
 */
export async function apiGetRoles() {
  const res = await fetch(`${BASE_URL}/roles`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách vai trò");
  }
  return res.json();
}

/**
 * Lấy danh sách tài khoản khả dụng để gán cho nhân sự mới.
 *
 * GET /accounts/available
 */
export async function apiGetAvailableAccounts() {
  const res = await fetch(`${BASE_URL}/accounts/available`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách tài khoản khả dụng");
  }
  return res.json();
}

// ================= NHÂN SỰ (STAFF) =================

/**
 * Tìm kiếm / lọc danh sách nhân sự
 * POST /staff/search
 * body: {
 *   searchKeyword, campusId, roleId, status, page, size
 * }
 */
export async function apiSearchStaff(filterPayload = {}) {
  const res = await fetch(`${BASE_URL}/staff/search`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(filterPayload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách nhân sự");
  }
  return res.json();
}

/**
 * Lấy chi tiết 1 nhân sự
 * GET /staff/{idNv}
 */
export async function apiGetStaffDetail(idNv) {
  const res = await fetch(`${BASE_URL}/staff/${encodeURIComponent(idNv)}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải chi tiết nhân sự");
  }
  return res.json();
}

/**
 * Tạo mới 1 nhân sự
 * POST /staff
 */
export async function apiCreateStaff(payload) {
  const res = await fetch(`${BASE_URL}/staff`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo nhân sự");
  }
  return res.json();
}

/**
 * Cập nhật 1 nhân sự
 * PUT /staff/{idNv}
 */
export async function apiUpdateStaff(idNv, payload) {
  const res = await fetch(`${BASE_URL}/staff/${encodeURIComponent(idNv)}`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể cập nhật nhân sự");
  }
  return res.json();
}

/**
 * Cập nhật trạng thái hoạt động của nhân sự
 * PATCH /staff/{idNv}/status?active=true|false
 * BE trả 204 No Content
 */
export async function apiUpdateStaffStatus(idNv, active) {
  const res = await fetch(
    `${BASE_URL}/staff/${encodeURIComponent(idNv)}/status?active=${
      active ? "true" : "false"
    }`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể cập nhật trạng thái nhân sự");
  }
  // 204 → không có body
}

/**
 * Xóa 1 nhân sự
 * DELETE /staff/{idNv}
 * BE trả 204 No Content
 */
export async function apiDeleteStaff(idNv) {
  const res = await fetch(`${BASE_URL}/staff/${encodeURIComponent(idNv)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể xóa nhân sự");
  }
  // 204 → không có body
}

// ================= HỢP ĐỒNG =================

/**
 * Tìm kiếm / lọc danh sách hợp đồng
 * POST /contracts/search
 * body: {
 *   searchKeyword, staffId, contractType, status, page, size
 * }
 */
export async function apiSearchContracts(filterPayload = {}) {
  const res = await fetch(`${BASE_URL}/contracts/search`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(filterPayload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách hợp đồng");
  }
  return res.json();
}

/**
 * Lấy chi tiết 1 hợp đồng
 * GET /contracts/{idHd}
 */
export async function apiGetContractDetail(idHd) {
  const res = await fetch(
    `${BASE_URL}/contracts/${encodeURIComponent(idHd)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể tải chi tiết hợp đồng");
  }
  return res.json();
}

/**
 * Tạo mới 1 hợp đồng
 * POST /contracts
 */
export async function apiCreateContract(payload) {
  const res = await fetch(`${BASE_URL}/contracts`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo hợp đồng");
  }
  return res.json();
}

/**
 * Cập nhật 1 hợp đồng
 * PUT /contracts/{idHd}
 */
export async function apiUpdateContract(idHd, payload) {
  const res = await fetch(
    `${BASE_URL}/contracts/${encodeURIComponent(idHd)}`,
    {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload || {}),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể cập nhật hợp đồng");
  }
  return res.json();
}

/**
 * Xóa 1 hợp đồng
 * DELETE /contracts/{idHd}
 * BE trả 204 No Content
 */
export async function apiDeleteContract(idHd) {
  const res = await fetch(
    `${BASE_URL}/contracts/${encodeURIComponent(idHd)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể xóa hợp đồng");
  }
  // 204 → không có body
}

/**
 * Lấy danh sách nhân sự dùng cho DROPDOWN (Hợp đồng)
 */
export async function apiGetStaffForDropdown() {
  const payload = {
    page: 0,
    size: 1000, // đủ lớn để cover hết nhân sự
  };

  const data = await apiSearchStaff(payload);

  // Trường hợp BE trả về kiểu Page<>: { content: [...] }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  if (Array.isArray(data.items)) return data.items;

  return [];
}
