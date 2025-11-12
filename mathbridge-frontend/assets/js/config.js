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

// Expose CONFIG to global scope
window.CONFIG = CONFIG;
