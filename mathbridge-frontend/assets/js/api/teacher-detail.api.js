// assets/js/api/teacher-detail.api.js

import { CONFIG } from "../config.js";

// ====== const endpoint ======
const TEACHER_LIST_ENDPOINT = `${CONFIG.BASE_URL}/api/public/nhanvien/giaovien`;
const TEACHER_BY_ID_ENDPOINT = (id) =>
  `${CONFIG.BASE_URL}/api/public/nhanvien/${encodeURIComponent(id)}`;

// ====== helper fetch JSON có phân biệt 404 ======
async function fetchJson(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Nếu BE chưa có endpoint → thường sẽ trả 404
    if (res.status === 404) {
      return "__404__";
    }

    if (!res.ok) {
      console.error("fetchJson not ok:", res.status, url);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("fetchJson error:", err, url);
    return null;
  }
}

// ====== hàm tìm 1 giáo viên trong danh sách theo nhiều kiểu key khác nhau ======
function findTeacherInList(list, id) {
  if (!Array.isArray(list) || !id) return null;
  const idLower = id.toString().toLowerCase();

  // Ở đây mình đoán DTO của bạn có thể dùng 1 trong các field sau:
  // - id
  // - idNv
  // - maNhanVien
  // - maNv
  // Nếu team bạn đặt tên khác thì chỉ cần bổ sung thêm vào đây.
  return (
    list.find((t) => t.id && t.id.toString().toLowerCase() === idLower) ||
    list.find((t) => t.idNv && t.idNv.toString().toLowerCase() === idLower) ||
    list.find((t) => t.maNhanVien && t.maNhanVien.toString().toLowerCase() === idLower) ||
    list.find((t) => t.maNv && t.maNv.toString().toLowerCase() === idLower) ||
    null
  );
}

// ====== PUBLIC API ======

// LẤY 1 GIÁO VIÊN THEO ID
// Ưu tiên gọi trực tiếp /{id}; nếu không có thì rớt về danh sách để tìm.
export async function getTeacherById(id) {
  if (!id) return null;

  // 1. thử gọi endpoint trực tiếp (phòng trường hợp sau này BE làm xong)
  const directData = await fetchJson(TEACHER_BY_ID_ENDPOINT(id));

  // nếu trả về object hợp lệ (không phải "__404__") thì dùng luôn
  if (directData && directData !== "__404__") {
    return directData;
  }

  // 2. fallback: gọi danh sách
  const listData = await fetchJson(TEACHER_LIST_ENDPOINT);
  if (!Array.isArray(listData)) {
    console.warn(
      "[getTeacherById] fallback từ danh sách nhưng không lấy được list giáo viên."
    );
    return null;
  }

  const found = findTeacherInList(listData, id);
  if (!found) {
    console.warn(
      `[getTeacherById] Không tìm thấy giáo viên có id="${id}" trong danh sách /giaovien`
    );
  }

  return found || null;
}

// LẤY DANH SÁCH LỚP CỦA GIÁO VIÊN
// GET /api/public/nhanvien/{id}/lophoc
export async function getClassesByTeacherId(id) {
  if (!id) return [];

  try {
    const res = await fetch(
      `${CONFIG.BASE_URL}/api/public/nhanvien/${encodeURIComponent(id)}/lophoc`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error("getClassesByTeacherId error, status =", res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("getClassesByTeacherId exception:", err);
    return [];
  }
}
