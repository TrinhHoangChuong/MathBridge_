// portal/admin/js/api/hocsinh.api.js
import { CONFIG } from "../../../../assets/js/config.js";

const BASE_URL = `${CONFIG.BASE_URL}/api/portal/admin/hocsinh-baitap`;

/**
 * Tìm kiếm / lọc danh sách học sinh
 * POST /students/search
 * body: {
 *   searchKeyword, programId, classId, status, page, size
 * }
 */
export async function apiSearchStudents(filterPayload = {}) {
  const res = await fetch(`${BASE_URL}/students/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filterPayload),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách học sinh");
  }
  return res.json();
}

/**
 * Lấy chi tiết 1 học sinh
 * GET /students/{idHs}
 */
export async function apiGetStudentDetail(idHs) {
  const res = await fetch(`${BASE_URL}/students/${encodeURIComponent(idHs)}`);

  if (!res.ok) {
    throw new Error("Không thể tải chi tiết học sinh");
  }
  return res.json();
}

/**
 * Tạo mới 1 học sinh
 * POST /students
 * body: HocSinhBaiTapRequest (phần thông tin HS)
 */
export async function apiCreateStudent(payload) {
  const res = await fetch(`${BASE_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo học sinh");
  }
  return res.json();
}

/**
 * Cập nhật 1 học sinh
 * PUT /students/{idHs}
 */
export async function apiUpdateStudent(idHs, payload) {
  const res = await fetch(`${BASE_URL}/students/${encodeURIComponent(idHs)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể cập nhật học sinh");
  }
  return res.json();
}

/**
 * Thêm 1 học sinh vào lớp
 * POST /students/{idHs}/classes
 * body: { classIdToAdd: "LH001" }
 */
export async function apiAddStudentToClass(idHs, classId) {
  const res = await fetch(
    `${BASE_URL}/students/${encodeURIComponent(idHs)}/classes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classIdToAdd: classId }),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể thêm học sinh vào lớp");
  }
  return res.json();
}

/**
 * Xóa 1 học sinh khỏi lớp
 * DELETE /students/{idHs}/classes/{idLh}
 * BE trả 204 No Content → không có body
 */
export async function apiRemoveStudentFromClass(idHs, idLh) {
  const res = await fetch(
    `${BASE_URL}/students/${encodeURIComponent(
      idHs
    )}/classes/${encodeURIComponent(idLh)}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error("Không thể xoá học sinh khỏi lớp");
  }
  // không return gì thêm (204)
}

// ================= TAB BÀI TẬP =================
/**
 * Tìm kiếm danh sách bài tập theo CT / Lớp / khoảng ngày
 * POST /assignments/search
 * body: { programId, classId, fromDate, toDate, ... }
 */
export async function apiSearchAssignments(payload = {}) {
  const res = await fetch(`${BASE_URL}/assignments/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách bài tập");
  }
  return res.json();
}

// ================= TAB BÀI NỘP & CHẤM ĐIỂM =================
/**
 * Tìm kiếm danh sách bài nộp
 * POST /submissions/search
 * body: { programId, classId, assignmentId, status, ... }
 */
export async function apiSearchSubmissions(payload = {}) {
  const res = await fetch(`${BASE_URL}/submissions/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách bài nộp");
  }
  return res.json();
}

// ================= TAB ĐÁNH GIÁ & KẾT QUẢ =================
/**
 * Lấy đánh giá & kết quả của 1 lớp
 * POST /evaluations/class
 * body: { classId }
 * response mong đợi:
 * {
 *   classEvaluations: [...],
 *   classResults: [...]
 * }
 */
export async function apiGetClassEvaluation(payload = {}) {
  const res = await fetch(`${BASE_URL}/evaluations/class`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Không thể tải đánh giá & kết quả lớp");
  }
  return res.json();
}

/**
 * Alias cho FE cũ (nếu chỗ nào còn dùng)
 * Dùng chung với apiGetClassEvaluation
 */
export async function apiGetClassEvaluationAndResult(payload = {}) {
  return apiGetClassEvaluation(payload);
}
