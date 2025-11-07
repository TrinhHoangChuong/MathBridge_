// assets/js/api/courses.api.js
// Khớp với BE CourseController ở /api/public/course
// BE đang có:
//  GET /api/public/course                       -> tất cả lớp
//  GET /api/public/course/program/{idCT}        -> lớp theo chương trình
//  GET /api/public/course/filter?...            -> lọc theo idCT, hinhThucHoc, loaiNgay...
//
// Map quy ước của bạn:
//  CT001 = Lớp 9
//  CT002 = Lớp 10
//  CT003 = Lớp 11
//  CT004 = Lớp 12
//  CT005 = Thi chứng chỉ / nâng cao

import { CONFIG } from "../config.js";

// map grade (9,10,11,12,adv) -> idCT BE
const PROGRAM_MAP = {
  "9": "CT001",
  "10": "CT002",
  "11": "CT003",
  "12": "CT004",
  "adv": "CT005",
  "all": null, // gọi all
};

function normalizeCourseFromBE(item = {}) {
  return {
    id: item.idLH || "",                            // BE: idLH
    ten: item.tenLop || "Lớp học",                  // BE: tenLop
    moTa: item.moTa || "",                          // BE: moTa
    ngayHoc: item.loaiNgay || "",                   // BE: loaiNgay (2-4-6 / 3-5-7 / 4-6-CN)
    hinhThuc: item.hinhThucHoc
      ? item.hinhThucHoc.toString().toLowerCase()
      : "",                                         // BE: hinhThucHoc = ONLINE/OFFLINE/GIA SƯ
    giaoVien: item.teacherName || "",               // BE: teacherName
    soBuoi: item.soBuoi ?? null,
    mucGiaThang: item.mucGiaThang ?? null,
    trangThai: item.trangThai || "",
    khoi: item.idCT || null,                        // BE: idCT
  };
}

// tiện ích đọc kiểu ApiResponse<T>
async function fetchApiResponse(url) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    console.error("courses.api: request fail", res.status, url);
    return null;
  }
  const json = await res.json();
  // json có dạng {success, message, data}
  return json;
}

// lấy tất cả lớp (không lọc chương trình)
export async function getAllCourses() {
  const url = `${CONFIG.BASE_URL}/api/public/course`;
  const json = await fetchApiResponse(url);
  if (!json || !Array.isArray(json.data)) return [];
  return json.data.map(normalizeCourseFromBE);
}

// lấy lớp theo "grade" của FE (9 -> CT001)
export async function getCoursesByGrade(grade = "9") {
  const programId = PROGRAM_MAP[grade] ?? grade;

  // nếu không có programId thì gọi all
  if (!programId) {
    return getAllCourses();
  }

  const url = `${CONFIG.BASE_URL}/api/public/course/program/${encodeURIComponent(
    programId
  )}`;

  const json = await fetchApiResponse(url);
  if (!json || !Array.isArray(json.data)) return [];
  return json.data.map(normalizeCourseFromBE);
}

// gọi đúng filter của BE khi bạn muốn lọc server-side
export async function getCoursesByFilter({ idCT, hinhThucHoc, loaiNgay, trangThai } = {}) {
  const params = new URLSearchParams();
  if (idCT) params.append("idCT", idCT);
  if (hinhThucHoc) params.append("hinhThucHoc", hinhThucHoc);
  if (loaiNgay) params.append("loaiNgay", loaiNgay);
  if (trangThai) params.append("trangThai", trangThai);

  const url = `${CONFIG.BASE_URL}/api/public/course/filter${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const json = await fetchApiResponse(url);
  if (!json || !Array.isArray(json.data)) return [];
  return json.data.map(normalizeCourseFromBE);
}

// BE endpoint: /api/public/enroll/pending
export async function enrollCourse(payload) {
  const url = `${CONFIG.BASE_URL}/api/public/enroll/pending`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      // endpoint chưa làm bên BE
      return {
        success: false,
        message: "Endpoint /api/public/course/enroll chưa được BE triển khai.",
      };
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || "Đăng ký không thành công.",
      };
    }

    const data = await res.json().catch(() => ({}));
    return {
      success: true,
      ...data,
    };
  } catch (err) {
    console.error("enrollCourse error:", err);
    return {
      success: false,
      message: "Không kết nối được tới máy chủ.",
    };
  }
}
