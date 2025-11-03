// assets/js/api/contact.api.js
import { CONFIG } from "../config.js";

/** GET /api/public/contact -> ContactDTO */
export async function getContactInfo() {
  try {
    const res = await fetch(CONFIG.BASE_URL + "/api/public/contact", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("GET /contact failed: " + res.status);
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
    console.error("getContactInfo error:", err);
    return {
      hotline: "", address: "", workingHours: "", workingDays: "",
      email: "", socialLinks: null, mapEmbedUrl: "", centers: []
    };
  }
}

/** POST /api/public/contact -> lưu liên hệ vào CSDL (BE trả message dạng text) */
export async function submitContact(payload) {
  try {
    const res = await fetch(CONFIG.BASE_URL + "/api/public/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(payload)
    });

    const text = await res.text(); // BE trả về chuỗi message
    if (!res.ok) {
      console.error("POST /contact ->", res.status, text);
      return { success: false, message: text || "Gửi liên hệ thất bại." };
    }
    return { success: true, message: text || "Gửi liên hệ thành công." };
  } catch (err) {
    console.error("submitContact error:", err);
    return { success: false, message: "Không thể gửi liên hệ. Vui lòng thử lại." };
  }
}
