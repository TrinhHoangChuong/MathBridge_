// assets/js/utils/http.js
// Hàm gọi API BE chuẩn

import { CONFIG } from "../config.js";

export async function http(path, opts = {}) {
  // token lưu sau đăng nhập
  const token = localStorage.getItem("mb_token");

  // chuẩn bị request
  const req = {
    method: opts.method || "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    req.headers.Authorization = "Bearer " + token;
  }

  if (opts.body) {
    req.body = JSON.stringify(opts.body);
  }

  // gọi BE
  const res = await fetch(CONFIG.BASE_URL + path, req);

  // nếu BE báo lỗi HTTP
  if (!res.ok) {
    throw new Error("API error " + res.status);
  }

  // trả JSON
  return res.json();
}
