// portal/admin/js/api/classApi.js
import { CONFIG } from "../../../../assets/js/config.js";
import { getAuthHeaders } from "../admin-auth-guard.js";

const BASE_URL = `${CONFIG.BASE_URL}/api/portal/admin/ClassManager`;

/** Lấy danh sách lớp học */
export async function apiGetAllClasses() {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách lớp học");
  }
  return res.json();
}

/** Lấy chi tiết 1 lớp */
export async function apiGetClassById(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể tải lớp học");
  }
  return res.json();
}

/**
 * Tạo lớp mới
 * NOTE: payload lấy từ FormData(form) bên chuongtrinhPage.js
 * -> name input phải trùng với field trong ClassRequest (idLh, idNv, idCt, ...)
 */
export async function apiCreateClass(payload) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo lớp học");
  }
  return res.json();
}

/** Cập nhật lớp học */
export async function apiUpdateClass(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Không thể cập nhật lớp học");
  }
  return res.json();
}

/** Xoá lớp */
export async function apiDeleteClass(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không thể xóa lớp học");
  }
  return true;
}
