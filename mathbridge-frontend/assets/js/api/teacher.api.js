// assets/js/api/teacher.api.js
// API lớp public để lấy danh sách giáo viên
// backend: GET /api/public/nhanvien
// response kỳ vọng: { teachers: [ { hoTen, chuyenMon, kinhNghiem }, ... ] }

import { CONFIG } from "../config.js";

export async function getTeachersFromApi() {
  try {
    const res = await fetch(CONFIG.BASE_URL + "/api/public/nhanvien", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      console.error("teachers API lỗi, status =", res.status);
      return { teachers: [] };
    }

    const data = await res.json();

    if (data && Array.isArray(data.teachers)) {
      return data; // { teachers: [...] }
    } else {
      return { teachers: [] };
    }

  } catch (err) {
    console.error("teachers API exception:", err);
    return { teachers: [] };
  }
}
