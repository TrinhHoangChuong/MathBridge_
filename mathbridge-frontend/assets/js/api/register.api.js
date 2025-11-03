// file: assets/js/api/register.api.js
import { CONFIG } from "../config.js";

const REGISTER_ENDPOINT = "/api/public/auth/register";
const REQUEST_TIMEOUT_MS = 12000;

function joinUrl(base, path) {
  // ghép URL an toàn, tránh "//api..."
  if (!base) return path;
  if (base.endsWith("/")) base = base.slice(0, -1);
  return base + path;
}

/**
 * payload:
 * { email, password, sdt, ho, ten, tenDem (nullable), gioiTinh (boolean), diaChi }
 */
export async function registerStudentApi(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(joinUrl(CONFIG.BASE_URL, REGISTER_ENDPOINT), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        ho: payload.ho,
        tenDem: payload.tenDem ?? null,
        ten: payload.ten,
        sdt: payload.sdt,
        gioiTinh: payload.gioiTinh,
        diaChi: payload.diaChi
      }),
      signal: controller.signal
    });

    // cố gắng parse JSON kể cả khi 4xx/5xx hoặc 401
    let raw = {};
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      raw = await res.json().catch(() => ({}));
    } else {
      // fallback nếu server không trả JSON (ví dụ 401 html)
      try { raw = await res.json(); } catch { raw = {}; }
    }

    if (!res.ok || raw.success === false) {
      let code = "UNKNOWN";
      if (res.status === 400) code = "VALIDATION_ERROR";
      else if (res.status === 409) code = "DUPLICATE";
      else if (res.status === 401) code = "UNAUTHORIZED";
      return { ok: false, error: code, data: raw };
    }

    // Chuẩn hoá dữ liệu về shape FE dùng
    const account = raw.account || {};
    const user = {
      idTk: account.idTk ?? null,
      email: account.email ?? null,
      roles: account.roles ?? [],
      fullName: account.fullName ?? "",
      idHs: account.idHs ?? null
    };

    const data = {
      token: raw.token ?? null,
      tokenType: raw.tokenType ?? null,
      expiresIn: raw.expiresIn ?? 0,
      user
    };

    return { ok: true, error: null, data };
  } catch (err) {
    console.error("register API error:", err);
    const isAbort = err?.name === "AbortError";
    return { ok: false, error: isAbort ? "NETWORK_ERROR" : "NETWORK_ERROR", data: null };
  } finally {
    clearTimeout(timer);
  }
}
