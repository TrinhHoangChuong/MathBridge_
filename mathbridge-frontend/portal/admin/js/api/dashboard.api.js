// portal/admin/js/api/dashboard.api.js
import { CONFIG } from "../../../../assets/js/config.js";

const DASHBOARD_URL = `${CONFIG.BASE_URL}/api/portal/admin/dashboard`;

export async function fetchDashboardOverview() {
  try {
    console.log("[Dashboard] Fetch:", DASHBOARD_URL);

    const res = await fetch(DASHBOARD_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("[Dashboard] API error status:", res.status);
      throw new Error("Không thể tải dữ liệu dashboard");
    }

    const data = await res.json();
    console.log("[Dashboard] API response:", data);
    return data;
  } catch (err) {
    console.error("[Dashboard] API call exception:", err);
    throw err;
  }
}
