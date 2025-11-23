// portal/admin/js/api/programApi.js
import { CONFIG } from "../../../../assets/js/config.js";
import { getAuthHeaders } from "../admin-auth-guard.js";

const BASE_URL = `${CONFIG.BASE_URL}/api/portal/admin/program`;

/**
 * Lấy danh sách chương trình
 */
export async function apiGetAllPrograms() {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách chương trình");
  }

  return res.json(); // → array ProgramAdminResponse
}

/**
 * Lấy 1 chương trình theo ID
 */
export async function apiGetProgramById(id) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải chi tiết chương trình");
  }

  return res.json();
}

/**
 * Tạo chương trình mới
 */
export async function apiCreateProgram(payload) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo chương trình");
  }

  return res.json();
}

/**
 * Cập nhật chương trình
 */
export async function apiUpdateProgram(id, payload) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("Không thể cập nhật chương trình");
  }

  return res.json();
}

/**
 * Xoá chương trình
 */
export async function apiDeleteProgram(id) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể xoá chương trình");
  }

  return true;
}
