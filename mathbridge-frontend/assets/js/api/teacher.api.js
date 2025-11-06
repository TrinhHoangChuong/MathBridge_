// assets/js/api/teacher.api.js
// Lấy danh sách giáo viên để hiển thị ở trang /pages/Teacher.html
// backend: GET /api/public/nhanvien/giaovien
// backend trả: [ { idNv, ho, tenDem, ten, chuyenMon, kinhNghiem }, ... ]
// FE cần: { teachers: [ { idNv, hoTen, chuyenMon, kinhNghiem }, ... ] }
// CONFIG được load từ config.js và expose qua window.CONFIG

function buildFullName(ho, tenDem, ten) {
  const parts = [];
  if (ho) parts.push(ho);
  if (tenDem) parts.push(tenDem);
  if (ten) parts.push(ten);
  return parts.join(" ").trim();
}

async function getTeachersFromApi() {
  try {
    // Check if CONFIG is available
    if (!window.CONFIG || !window.CONFIG.BASE_URL) {
      console.warn("CONFIG not available, backend may not be configured");
      return { teachers: [] };
    }

    const res = await fetch(window.CONFIG.BASE_URL + "/api/public/nhanvien/giaovien", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      // Only log if not a connection error (which is expected when backend is down)
      if (res.status !== 0) {
        console.warn("teachers API lỗi, status =", res.status);
      }
      return { teachers: [] };
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      const teachers = data.map(item => ({
        idNv: item.idNv || "",
        hoTen: buildFullName(item.ho, item.tenDem, item.ten),
        chuyenMon: item.chuyenMon || "",
        kinhNghiem: item.kinhNghiem ?? null
      }));
      return { teachers };
    }

    return { teachers: [] };

  } catch (err) {
    // Only log if it's not a network/connection error (expected when backend is down)
    if (err.name !== 'TypeError' || !err.message.includes('fetch')) {
      console.warn("teachers API exception:", err);
    }
    return { teachers: [] };
  }
}

// Expose function to global scope
window.getTeachersFromApi = getTeachersFromApi;
