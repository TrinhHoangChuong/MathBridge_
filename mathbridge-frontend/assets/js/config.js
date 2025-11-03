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
export const CONFIG = ENV.dev;
