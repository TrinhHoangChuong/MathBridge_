// assets/js/api/centers.api.js
// Lấy danh sách cơ sở (public, không cần token)
// CONFIG được load từ config.js và expose qua window.CONFIG

async function getCentersFromApi() {
  try {
    // Check if CONFIG is available
    if (!window.CONFIG || !window.CONFIG.BASE_URL) {
      console.warn("CONFIG not available, backend may not be configured");
      return { centers: [] };
    }

    const res = await fetch(window.CONFIG.BASE_URL + "/api/public/centers");

    if (!res.ok) {
      // Only log if not a connection error (which is expected when backend is down)
      if (res.status !== 0) {
        console.warn("centers API lỗi, status =", res.status);
      }
      return { centers: [] };
    }

    const data = await res.json();
    if (data && Array.isArray(data.centers)) {
      return data;
    } else {
      return { centers: [] };
    }
  } catch (err) {
    // Only log if it's not a network/connection error (expected when backend is down)
    if (err.name !== 'TypeError' || !err.message.includes('fetch')) {
      console.warn("centers API exception:", err);
    }
    return { centers: [] };
  }
}

// Expose function to global scope
window.getCentersFromApi = getCentersFromApi;
