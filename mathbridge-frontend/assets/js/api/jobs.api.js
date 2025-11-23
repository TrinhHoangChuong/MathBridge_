// Jobs API
import { CONFIG } from "../config.js";


async function http(path) {
  const r = await fetch(CONFIG.BASE_URL + path);
  if (!r.ok) throw new Error(`HTTP error! Status: ${r.status}`);
  return r.json();
}

async function httpPost(path, data, isFormData = false) {
  const opts = {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  };
  const r = await fetch(CONFIG.BASE_URL + path, opts);
  if (!r.ok) {
    // Try to parse error response body for better error messages
    let errorMessage = `HTTP error! Status: ${r.status}`;
    try {
      const errorBody = await r.json();
      if (errorBody && errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch (e) {
      // If response is not JSON, use default message
    }
    throw new Error(errorMessage);
  }
  return r.json();
}

// Fallback sample jobs shown when backend is not running or DB empty
const SAMPLE_JOBS = [
  {
    id: 1,
    slug: "giang-vien-toan-quoc-te",
    title: "Giảng viên Toán quốc tế",
    location: "TP. Hồ Chí Minh",
    type: "Full-time",
    salary: "Thoả thuận",
    description: `Giảng dạy chương trình Toán quốc tế và chăm sóc chất lượng học viên.`,
    requirements: [
      "Tốt nghiệp chuyên ngành Toán hoặc Sư phạm",
      "Ưu tiên có kinh nghiệm giảng dạy Quốc tế",
    ],
    benefits: ["Lương + thưởng", "Đào tạo chuyên môn"],
  },
  {
    id: 2,
    slug: "tro-giang-toan",
    title: "Trợ giảng Toán",
    location: "Hà Nội",
    type: "Part-time",
    salary: "Từ 6–10 triệu/tháng",
    description: `Hỗ trợ giảng viên, chấm bài và hướng dẫn học sinh.`,
    requirements: ["Sinh viên năm 3 trở lên", "Kiến thức Toán tốt"],
    benefits: ["Giờ giấc linh hoạt"],
  },
];

function toSlug(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function mapBeJobToFe(j) {
  // BE fields:
  //  - idTd, tieuDe, viTri, moTaNgan, moTa, yeuCau, capBac, hinhThucLamViec, 
  //    mucLuongTu, mucLuongDen, kinhNghiem, soLuongTuyen, hanNop, trangThai, yeuCauList, benefits
  const title = j.tieuDe || j.title || "";
  const location = j.viTri || j.location || "";
  const type = j.hinhThucLamViec || j.type || "";
  const salary = (j.mucLuongTu && j.mucLuongDen)
    ? `${j.mucLuongTu} - ${j.mucLuongDen}`
    : (j.mucLuongTu || j.mucLuongDen || j.salary || "");
  
  // Format deadline
  let deadline = "";
  if (j.hanNop) {
    const date = new Date(j.hanNop);
    deadline = date.toLocaleDateString('vi-VN');
  }
  
  return {
    id: j.idTd || j.id,
    slug: toSlug(title),
    title,
    location,
    type,
    salary,
    shortDescription: j.moTaNgan || "",
    description: j.moTa || j.description || "",
    requirements: j.yeuCauList || j.yeuCau || j.requirements || [],
    // Additional fields from entity
    kinhNghiem: j.kinhNghiem,
    soLuongTuyen: j.soLuongTuyen,
    hanNop: deadline,
    trangThai: j.trangThai,
    capBac: j.capBac
  };
}

/**
 * Lấy danh sách tin tuyển dụng
 * @returns {Promise<Array>} Danh sách jobs với thông tin cơ bản
 */
async function fetchJobs() {
  try {
    const data = await http("/api/public/jobs");
    if (Array.isArray(data) && data.length > 0) return data.map(mapBeJobToFe);
    // empty from backend -> return sample so UI isn't blank during dev
    return SAMPLE_JOBS;
  } catch (err) {
    console.warn("fetchJobs failed, using SAMPLE_JOBS", err);
    return SAMPLE_JOBS;
  }
}

/**
 * Lấy chi tiết tin tuyển dụng theo slug
 * @param {string} slug - Slug của tin (sinh từ TieuDe bên BE)
 * @returns {Promise<Object>} Chi tiết job hoặc null nếu không tìm thấy
 */
async function fetchJobBySlug(slug) {
  try {
    const res = await http(`/api/public/jobs/${encodeURIComponent(slug)}`);
    if (res) return mapBeJobToFe(res);
    // fallback to sample
    return SAMPLE_JOBS.find((j) => j.slug === slug) || null;
  } catch (e) {
    console.warn("Job not found:", slug);
    return SAMPLE_JOBS.find((j) => j.slug === slug) || null;
  }
}

/**
 * Gửi đơn ứng tuyển
 * @param {FormData} formData - Form data với các trường: name, phone, email, position, và file (optional)
 * @returns {Promise<Object>} Response với success và message
 */
async function submitApplication(formData) {
  try {
    return await httpPost("/api/public/jobs/apply", formData, true);
  } catch (err) {
    console.warn("submitApplication failed", err);
    return {
      success: false,
      message: "Không thể kết nối tới backend. Thử lại sau.",
    };
  }
}

// Export functions for use in careers.page.js
window.fetchJobs = fetchJobs;
window.fetchJobBySlug = fetchJobBySlug;
window.submitApplication = submitApplication;
