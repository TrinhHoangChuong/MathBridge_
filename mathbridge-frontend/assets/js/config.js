// assets/js/config.js
// Chọn server BE để gọi

const ENV = {
  dev: {
    BASE_URL: "http://localhost:8080",
  },
  prod: {
    BASE_URL: "https://api.mathbridge.vn",
  },
};

// Không dùng export để tương thích với script tag thông thường
const CONFIG = ENV.dev;

// JWT Configuration - matches backend application.properties
const JWT_CONFIG = {
  SECRET_KEY: "change-this-secret-key-make-it-longer", // Should match mathbridge.security.jwt-secret
  EXPIRATION_MS: 86400000, // 24 hours - matches mathbridge.security.jwt-expiration-ms
};

// Expose CONFIG and JWT_CONFIG to global scope
window.CONFIG = CONFIG;
window.JWT_CONFIG = JWT_CONFIG;
