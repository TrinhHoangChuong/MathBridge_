// portal/admin/js/api/tuyendung.api.js
import { CONFIG } from "../../../../assets/js/config.js";
import { getAuthHeaders } from "../admin-auth-guard.js";

const BASE_URL = `${CONFIG.BASE_URL}/api/portal/admin/tuyendung`;

// ======================= JOBS (Tin tuyển dụng) =======================

/** Lấy danh sách tất cả tin tuyển dụng */
export async function apiGetAllJobs() {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error("Không thể tải danh sách tin tuyển dụng");
  }
  return res.json(); // List<TuyenDungResponse.JobSummary>
}

/** Lấy chi tiết 1 tin tuyển dụng theo ID_TD */
export async function apiGetJobDetail(idTd) {
  const res = await fetch(
    `${BASE_URL}/jobs/${encodeURIComponent(idTd)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) {
    throw new Error("Không thể tải chi tiết tin tuyển dụng");
  }
  return res.json(); // TuyenDungResponse.JobDetail
}

/** Tạo mới tin tuyển dụng */
export async function apiCreateJob(payload) {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}), // TuyenDungRequest.JobCreateOrUpdate
  });
  if (!res.ok) {
    throw new Error("Không thể tạo tin tuyển dụng");
  }
  return res.json();
}

/** Cập nhật tin tuyển dụng */
export async function apiUpdateJob(idTd, payload) {
  const res = await fetch(
    `${BASE_URL}/jobs/${encodeURIComponent(idTd)}`,
    {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload || {}), // TuyenDungRequest.JobCreateOrUpdate
    }
  );
  if (!res.ok) {
    throw new Error("Không thể cập nhật tin tuyển dụng");
  }
  return res.json();
}

/** Xóa tin tuyển dụng */
export async function apiDeleteJob(idTd) {
  const res = await fetch(
    `${BASE_URL}/jobs/${encodeURIComponent(idTd)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) {
    throw new Error("Không thể xóa tin tuyển dụng");
  }
}

// ======================= CANDIDATES (Ứng viên) =======================

/** Lấy danh sách tất cả ứng viên */
export async function apiGetAllCandidates() {
  const res = await fetch(`${BASE_URL}/candidates`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error("Không thể tải danh sách ứng viên");
  }
  return res.json(); // List<TuyenDungResponse.CandidateSummary>
}

/** Lấy chi tiết một ứng viên */
export async function apiGetCandidateDetail(idUv) {
  const res = await fetch(
    `${BASE_URL}/candidates/${encodeURIComponent(idUv)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) {
    throw new Error("Không thể tải chi tiết ứng viên");
  }
  return res.json(); // TuyenDungResponse.CandidateDetail
}

/** Tạo mới ứng viên */
export async function apiCreateCandidate(payload) {
  const res = await fetch(`${BASE_URL}/candidates`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload || {}), // TuyenDungRequest.CandidateCreateOrUpdate
  });
  if (!res.ok) {
    throw new Error("Không thể tạo ứng viên");
  }
  return res.json();
}

/** Cập nhật ứng viên */
export async function apiUpdateCandidate(idUv, payload) {
  const res = await fetch(
    `${BASE_URL}/candidates/${encodeURIComponent(idUv)}`,
    {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload || {}), // TuyenDungRequest.CandidateCreateOrUpdate
    }
  );
  if (!res.ok) {
    throw new Error("Không thể cập nhật ứng viên");
  }
  return res.json();
}

/** Xóa ứng viên */
export async function apiDeleteCandidate(idUv) {
  const res = await fetch(
    `${BASE_URL}/candidates/${encodeURIComponent(idUv)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) {
    throw new Error("Không thể xóa ứng viên");
  }
}

// ======================= MAPPING (Association_25) =======================

/** Lấy danh sách ứng viên của 1 tin tuyển dụng (Association_25 + UngVien) */
export async function apiGetCandidatesOfJob(idTd) {
  const res = await fetch(
    `${BASE_URL}/jobs/${encodeURIComponent(idTd)}/candidates`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) {
    throw new Error("Không thể tải danh sách ứng viên của tin tuyển dụng");
  }
  return res.json(); // List<TuyenDungResponse.CandidateSummary>
}

/**
 * Thêm nhiều ứng viên vào 1 tin
 * body: { candidateIds: ["UV001", "UV002", ...] }
 * (idTd đi trong path)
 */
export async function apiAddCandidatesToJob(idTd, candidateIds) {
  const res = await fetch(
    `${BASE_URL}/jobs/${encodeURIComponent(idTd)}/candidates`,
    {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ candidateIds }),
    }
  );
  if (!res.ok) {
    throw new Error("Không thể gán ứng viên vào tin tuyển dụng");
  }
}

/** Bỏ gán 1 ứng viên khỏi 1 tin */
export async function apiRemoveCandidateFromJob(idTd, idUv) {
  const res = await fetch(
    `${BASE_URL}/jobs/${encodeURIComponent(
      idTd
    )}/candidates/${encodeURIComponent(idUv)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) {
    throw new Error("Không thể bỏ gán ứng viên khỏi tin tuyển dụng");
  }
}
