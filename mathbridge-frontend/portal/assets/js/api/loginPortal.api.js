// file: portal/assets/js/api/loginPortal.api.js
import { CONFIG } from "../config.js";

const LOGIN_ENDPOINT = "/api/public/auth/login";

export async function loginPortalApi(email, password) {
  try {
    const res = await fetch(CONFIG.BASE_URL + LOGIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    // cố gắng đọc json kể cả 401
    const data = await res.json().catch(() => ({}));

    // tính ok
    if (!res.ok || data.success === false) {
      return {
        ok: false,
        error: res.status === 401 ? "EMAIL_OR_PASSWORD_INVALID" : "UNKNOWN",
        data
      };
    }

    return {
      ok: true,
      error: null,
      data
    };
  } catch (err) {
    console.error("login portal API error:", err);
    return {
      ok: false,
      error: "NETWORK_ERROR",
      data: null
    };
  }
}

