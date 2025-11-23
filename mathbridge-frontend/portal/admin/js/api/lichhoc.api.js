// portal/admin/js/api/lichhoc.api.js
import { CONFIG } from "../../../../assets/js/config.js";
import { getAuthHeaders } from "../admin-auth-guard.js";

const BASE_URL = `${CONFIG.BASE_URL}/api/portal/admin/lichhoc`;

/* ================== CLASS VIEW ================== */

export async function apiGetClassOptions() {
  const res = await fetch(`${BASE_URL}/classes/options`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách lớp");
  }
  return res.json();
}

export async function apiGetClassDetail(idLh) {
  const res = await fetch(
    `${BASE_URL}/classes/${encodeURIComponent(idLh)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể tải chi tiết lớp học");
  }
  return res.json();
}

export async function apiSearchClassSchedule(payload = {}) {
  const res = await fetch(`${BASE_URL}/class-schedule/search`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tải lịch học của lớp");
  }
  return res.json();
}

export async function apiAutoGenerateSchedule(payload = {}) {
  const res = await fetch(`${BASE_URL}/class-schedule/auto-generate`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo lịch tự động cho lớp");
  }
  return res.json();
}

/* ==== UPDATE 1 BUỔI HỌC ==== */
/**
 * Cập nhật 1 buổi học (BuoiHocChiTiet)
 * PUT /class-schedule/{idBh}
 */
export async function apiUpdateSession(idBh, payload = {}) {
  const res = await fetch(
    `${BASE_URL}/class-schedule/${encodeURIComponent(idBh)}`,
    {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload || {}),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể cập nhật buổi học");
  }
  return res.json();
}

/* ================== CAMPUS & ROOMS ================== */

export async function apiGetCampuses() {
  const res = await fetch(`${BASE_URL}/campuses`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách cơ sở");
  }
  return res.json();
}

export async function apiGetRoomsByCampus(idCs) {
  const res = await fetch(
    `${BASE_URL}/campuses/${encodeURIComponent(idCs)}/rooms`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Không thể tải danh sách phòng");
  }
  return res.json();
}

/* ================== TEACHER VIEW ================== */

export async function apiGetTeacherOptions() {
  const res = await fetch(`${BASE_URL}/teachers/options`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách giáo viên");
  }
  return res.json();
}

export async function apiSearchTeacherSchedule(payload = {}) {
  const res = await fetch(`${BASE_URL}/teacher-schedule/search`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tải lịch làm của giáo viên");
  }
  return res.json();
}

/* ================== STUDENT VIEW ================== */

export async function apiGetStudentOptions() {
  const res = await fetch(`${BASE_URL}/students/options`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách học sinh");
  }
  return res.json();
}

export async function apiSearchStudentSchedule(payload = {}) {
  const res = await fetch(`${BASE_URL}/student-schedule/search`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tải lịch học của học sinh");
  }
  return res.json();
}
