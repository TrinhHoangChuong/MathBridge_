// assets/js/utils/http.js
// FE gọi API BE

// 📄 assets/js/utils/http.js

async function http(path, options = {}) {
  // 1 Lấy token (nếu user đã đăng nhập)
  const token = localStorage.getItem("mb_token");

  // 2️ Gọi fetch tới API backend
  const response = await fetch(CONFIG.BASE_URL + path, {
    method: options.method || "GET", // mặc định là GET
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // nếu có token thì thêm
    },
    body: options.body ? JSON.stringify(options.body) : undefined, // nếu có dữ liệu (POST/PUT)
  });

  // 3️ Nếu lỗi (status 4xx hoặc 5xx)
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Lỗi API (${response.status}): ${message}`);
  }

  // 4️ Nếu thành công → trả về JSON
  return response.json();
}
