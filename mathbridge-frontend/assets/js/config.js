// assets/js/config.js
// FILE NÀY LƯU ĐỊA CHỈ SERVER BE NHA AE
const ENV = {
  dev: {
    BASE_URL: "http://localhost:8080", // URL của BE (Spring Boot)
  },
  prod: {
    BASE_URL: "https://api.mathbridge.vn",
  },
};
const CONFIG = ENV.dev;
