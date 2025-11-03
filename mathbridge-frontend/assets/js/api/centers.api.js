// assets/js/api/centers.api.js
// Lấy danh sách cơ sở (public, không cần token)

import { CONFIG } from "../config.js";

export async function getCentersFromApi() {
  try {
    const res = await fetch(CONFIG.BASE_URL + "/api/public/centers");

    if (!res.ok) {
      console.error("centers API lỗi, status =", res.status);
      return { centers: [] };
    }

    const data = await res.json();
    if (data && Array.isArray(data.centers)) {
      return data;
    } else {
      return { centers: [] };
    }
  } catch (err) {
    console.error("centers API exception:", err);
    return { centers: [] };
  }
}
