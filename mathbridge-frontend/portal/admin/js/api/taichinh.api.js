// portal/admin/js/api/taichinh.api.js
import { CONFIG } from "../../../../assets/js/config.js";
import { getAuthHeaders } from "../admin-auth-guard.js";

const BASE_URL = `${CONFIG.BASE_URL}/api/portal/admin/taichinh`;

// ================= HÓA ĐƠN (HoaDon) =================

/**
 * Tìm kiếm / lọc danh sách hóa đơn
 * POST /hoadon/search
 * body: { studentId, classId, status, fromDate, toDate }
 */
export async function apiSearchHoaDon(filterPayload = {}) {
  const res = await fetch(`${BASE_URL}/hoadon/search`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(filterPayload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách hóa đơn");
  }
  return res.json();
}

/**
 * Tạo mới 1 hóa đơn
 * POST /hoadon
 * body: HoaDonUpsertRequest
 */
export async function apiCreateHoaDon(payload) {
  const res = await fetch(`${BASE_URL}/hoadon`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo hóa đơn");
  }
  return res.json();
}

/**
 * Cập nhật 1 hóa đơn
 * PUT /hoadon/{idHoaDon}
 */
export async function apiUpdateHoaDon(idHoaDon, payload) {
  const res = await fetch(
    `${BASE_URL}/hoadon/${encodeURIComponent(idHoaDon)}`,
    {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload || {}),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể cập nhật hóa đơn");
  }
  return res.json();
}

/**
 * Xóa 1 hóa đơn
 * DELETE /hoadon/{idHoaDon}
 * BE trả 204 No Content → không có body
 */
export async function apiDeleteHoaDon(idHoaDon) {
  const res = await fetch(
    `${BASE_URL}/hoadon/${encodeURIComponent(idHoaDon)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể xoá hóa đơn");
  }
  // 204 → không return gì thêm
}

// ================= LỊCH SỬ THANH TOÁN =================

/**
 * Tìm kiếm danh sách lịch sử thanh toán
 * POST /lichsu/search
 * body: { status, methodId, month }
 */
export async function apiSearchLichSuThanhToan(filterPayload = {}) {
  const res = await fetch(`${BASE_URL}/lichsu/search`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(filterPayload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách lịch sử thanh toán");
  }
  return res.json();
}

/**
 * Tạo mới 1 bản ghi lịch sử thanh toán
 * POST /lichsu
 * body: LichSuUpsertRequest
 */
export async function apiCreateLichSuThanhToan(payload) {
  const res = await fetch(`${BASE_URL}/lichsu`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo lịch sử thanh toán");
  }
  return res.json();
}

/**
 * Cập nhật 1 bản ghi lịch sử thanh toán
 * PUT /lichsu/{idLs}
 */
export async function apiUpdateLichSuThanhToan(idLs, payload) {
  const res = await fetch(
    `${BASE_URL}/lichsu/${encodeURIComponent(idLs)}`,
    {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload || {}),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể cập nhật lịch sử thanh toán");
  }
  return res.json();
}

/**
 * Xóa 1 bản ghi lịch sử thanh toán
 * DELETE /lichsu/{idLs}
 * BE trả 204 No Content → không có body
 */
export async function apiDeleteLichSuThanhToan(idLs) {
  const res = await fetch(
    `${BASE_URL}/lichsu/${encodeURIComponent(idLs)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể xoá lịch sử thanh toán");
  }
  // 204 → không return gì thêm
}

// ================= PHƯƠNG THỨC THANH TOÁN =================

/**
 * Lấy danh sách tất cả phương thức thanh toán
 * GET /phuongthuc
 */
export async function apiGetPhuongThucThanhToanList() {
  const res = await fetch(`${BASE_URL}/phuongthuc`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách phương thức thanh toán");
  }
  return res.json();
}

/**
 * Tạo mới phương thức thanh toán
 * POST /phuongthuc
 * body: PhuongThucUpsertRequest
 */
export async function apiCreatePhuongThucThanhToan(payload) {
  const res = await fetch(`${BASE_URL}/phuongthuc`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo phương thức thanh toán");
  }
  return res.json();
}

/**
 * Cập nhật phương thức thanh toán
 * PUT /phuongthuc/{idPt}
 */
export async function apiUpdatePhuongThucThanhToan(idPt, payload) {
  const res = await fetch(
    `${BASE_URL}/phuongthuc/${encodeURIComponent(idPt)}`,
    {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload || {}),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể cập nhật phương thức thanh toán");
  }
  return res.json();
}

/**
 * Xóa phương thức thanh toán
 * DELETE /phuongthuc/{idPt}
 * BE trả 204 No Content
 */
export async function apiDeletePhuongThucThanhToan(idPt) {
  const res = await fetch(
    `${BASE_URL}/phuongthuc/${encodeURIComponent(idPt)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể xoá phương thức thanh toán");
  }
  // 204 → không return gì thêm
}

// ================= DROPDOWN PHỤ TRỢ =================

/**
 * Lấy danh sách lớp học cho dropdown
 * GET /dropdowns/lophoc
 * response: [{ idLh, tenLop }]
 */
export async function apiGetDropdownClasses() {
  const res = await fetch(`${BASE_URL}/dropdowns/lophoc`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách lớp học");
  }
  return res.json();
}

/**
 * Lấy danh sách học sinh cho dropdown
 * GET /dropdowns/hocsinh
 * response: [{ idHs, hoTen }]
 */
export async function apiGetDropdownStudents() {
  const res = await fetch(`${BASE_URL}/dropdowns/hocsinh`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách học sinh");
  }
  return res.json();
}
