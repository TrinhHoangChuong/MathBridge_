// assets/js/api/centers.api.js

const API_BASE_URL = "http://localhost:8080";

export async function getCentersFromApi() {
    const url = `${API_BASE_URL}/api/public/centers`;

    const res = await fetch(url, {
        method: "GET"
    });

    if (!res.ok) {
        throw new Error(
            "[centers.api] Lỗi lấy dữ liệu cơ sở. HTTP status = " + res.status
        );
    }
    // Dạng BE trả về:
    // {
    //   "centers": [
    //     {
    //       "id": "CS001",
    //       "name": "MathBridge – Cơ sở Quận 1",
    //       "address": "12 Nguyễn Huệ...",
    //       "hotline": "02871001234",
    //       "workingHours": "08:00 - 22:00",
    //       "workingDays": "Thứ 2 - CN"
    //     },
    //     ...
    //   ]
    // }
    return res.json();
}
