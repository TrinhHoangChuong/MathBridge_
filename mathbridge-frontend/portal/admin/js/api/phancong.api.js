// portal/admin/js/api/phancong.api.js
import { CONFIG } from "../../../../assets/js/config.js";
import { getAuthHeaders } from "../admin-auth-guard.js";

const BASE_URL = `${CONFIG.BASE_URL}/api/portal/admin/phancong-covan`;

/**
 * Helper xử lý response chung.
 *
 * - Nếu !res.ok: cố gắng đọc body (JSON hoặc text) để lấy message chi tiết,
 *   sau đó throw Error(message).
 * - Nếu res.ok:
 *    + expectJson = false  -> chỉ kiểm tra thành công, không parse body.
 *    + expectJson = true   -> cố gắng parse JSON nếu có nội dung; nếu body rỗng
 *                             hoặc không phải JSON hợp lệ thì trả về null
 *                             (tránh quăng SyntaxError).
 */
async function handleResponse(res, defaultErrorMessage, expectJson = true) {
  let rawBody = null;
  try {
    rawBody = await res.text();
  } catch (_) {
    rawBody = null;
  }

  if (!res.ok) {
    let message = defaultErrorMessage;

    if (rawBody && typeof rawBody === "string") {
      const trimmed = rawBody.trim();
      if (trimmed.length > 0) {
        try {
          const data = JSON.parse(trimmed);
          if (data && data.message) {
            message = data.message;
          }
        } catch {
          // body là text thường
          message = trimmed;
        }
      }
    }

    throw new Error(message);
  }

  // Thành công nhưng không cần JSON (thường cho create/update/end)
  if (!expectJson) {
    return null;
  }

  // Thành công + cần JSON
  if (!rawBody) return null;
  const trimmed = rawBody.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // body không phải JSON hợp lệ -> trả null để tránh SyntaxError
    return null;
  }
}

/**
 * 1. Tìm kiếm / lọc danh sách cố vấn (NhanVien)
 *
 * POST /advisors/search
 */
export async function apiSearchAdvisors(filterPayload = {}) {
  const res = await fetch(`${BASE_URL}/advisors/search`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(filterPayload || {}),
  });
  return handleResponse(res, "Không thể tải danh sách cố vấn");
}

/**
 * 2. Tìm kiếm học sinh khả dụng để phân công cho 1 cố vấn
 *
 * POST /advisors/{idNv}/students/search
 */
export async function apiSearchStudentsForAdvisor(idNv, filterPayload = {}) {
  const res = await fetch(
    `${BASE_URL}/advisors/${encodeURIComponent(idNv)}/students/search`,
    {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(filterPayload || {}),
    }
  );
  return handleResponse(res, "Không thể tải danh sách học sinh");
}

/**
 * 3. Lấy danh sách phân công (CoVan_HocSinh) của 1 cố vấn
 *
 * POST /advisors/{idNv}/assignments/search
 */
export async function apiGetAdvisorAssignments(idNv, filterPayload = {}) {
  const res = await fetch(
    `${BASE_URL}/advisors/${encodeURIComponent(idNv)}/assignments/search`,
    {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(filterPayload || {}),
    }
  );
  return handleResponse(res, "Không thể tải danh sách phân công");
}

/**
 * 4. Tạo mới phân công (insert vào CoVan_HocSinh)
 *
 * POST /assignments
 */
export async function apiCreateAssignment(payload) {
  const res = await fetch(`${BASE_URL}/assignments`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });
  // BE có thể trả 200/201 nhưng body rỗng -> không parse JSON
  return handleResponse(res, "Không thể tạo phân công cố vấn", false);
}

/**
 * 5. Cập nhật thông tin phân công (update CoVan_HocSinh)
 *
 * PUT /assignments
 */
export async function apiUpdateAssignment(payload) {
  const res = await fetch(`${BASE_URL}/assignments`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });
  // Không yêu cầu body JSON
  return handleResponse(res, "Không thể cập nhật phân công cố vấn", false);
}

/**
 * 6. Kết thúc phân công (set NgayKetThuc / TrangThai)
 *
 * PUT /assignments/end
 */
export async function apiEndAssignment(payload) {
  const res = await fetch(`${BASE_URL}/assignments/end`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });
  // Không yêu cầu body JSON
  return handleResponse(res, "Không thể kết thúc phân công cố vấn", false);
}
