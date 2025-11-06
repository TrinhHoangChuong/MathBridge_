// file: assets/js/api/login.api.js
// CONFIG được load từ config.js và expose qua window.CONFIG

const LOGIN_ENDPOINT = "/api/public/auth/login";

async function loginStudentApi(email, password) {
  try {
    const res = await fetch(window.CONFIG.BASE_URL + LOGIN_ENDPOINT, {
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
    console.error("login API error:", err);
    return {
      ok: false,
      error: "NETWORK_ERROR",
      data: null
    };
  }
}

// Expose function to global scope
window.loginStudentApi = loginStudentApi;
