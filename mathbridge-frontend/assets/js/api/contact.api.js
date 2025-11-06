// assets/js/api/contact.api.js
// CONFIG được load từ config.js và expose qua window.CONFIG

/** GET /api/public/contact -> ContactDTO */
async function getContactInfo() {
  try {
    // Check if CONFIG is available
    if (!window.CONFIG || !window.CONFIG.BASE_URL) {
      console.warn("CONFIG not available, backend may not be configured");
      return {
        hotline: "", address: "", workingHours: "", workingDays: "",
        email: "", socialLinks: null, mapEmbedUrl: "", centers: []
      };
    }

    const res = await fetch(window.CONFIG.BASE_URL + "/api/public/contact", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    if (!res.ok) {
      // Only log if not a connection error (which is expected when backend is down)
      if (res.status !== 0) {
        console.warn("GET /contact failed: " + res.status);
      }
      return {
        hotline: "", address: "", workingHours: "", workingDays: "",
        email: "", socialLinks: null, mapEmbedUrl: "", centers: []
      };
    }
    
    const dto = await res.json();

    // Chuẩn hóa tối thiểu, có gì dùng nấy
    return {
      hotline: dto?.hotline || "",
      address: dto?.address || "",
      workingHours: dto?.workingHours || "",
      workingDays: dto?.workingDays || "",
      email: dto?.email || "",
      socialLinks: dto?.socialLinks || null,       // Map<String,String>
      mapEmbedUrl: dto?.mapEmbedUrl || "",
      centers: Array.isArray(dto?.centers) ? dto.centers : [] // List<FooterCenterDTO>
    };
  } catch (err) {
    // Only log if it's not a network/connection error (expected when backend is down)
    if (err.name !== 'TypeError' || !err.message.includes('fetch')) {
      console.warn("getContactInfo error:", err);
    }
    return {
      hotline: "", address: "", workingHours: "", workingDays: "",
      email: "", socialLinks: null, mapEmbedUrl: "", centers: []
    };
  }
}

/** POST /api/public/contact -> lưu liên hệ vào CSDL (BE trả message dạng text) */
async function submitContact(payload) {
  try {
    // Check if CONFIG is available
    if (!window.CONFIG || !window.CONFIG.BASE_URL) {
      return { success: false, message: "Backend chưa được cấu hình. Vui lòng thử lại sau." };
    }

    const res = await fetch(window.CONFIG.BASE_URL + "/api/public/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(payload)
    });

    const text = await res.text(); // BE trả về chuỗi message
    if (!res.ok) {
      // Only log if not a connection error
      if (res.status !== 0) {
        console.warn("POST /contact ->", res.status, text);
      }
      return { success: false, message: text || "Gửi liên hệ thất bại." };
    }
    return { success: true, message: text || "Gửi liên hệ thành công." };
  } catch (err) {
    // Only log if it's not a network/connection error
    if (err.name !== 'TypeError' || !err.message.includes('fetch')) {
      console.warn("submitContact error:", err);
    }
    return { success: false, message: "Không thể gửi liên hệ. Vui lòng thử lại." };
  }
}

// Expose functions to global scope
window.getContactInfo = getContactInfo;
window.submitContact = submitContact;
