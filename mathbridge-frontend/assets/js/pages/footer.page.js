// assets/js/pages/footer.page.js
// Render dữ liệu cơ sở vào footer

import { getCentersFromApi } from "../api/centers.api.js";

const MAX_TRY = 20;
const WAIT_MS = 150;

async function fillFooter() {
  const listEl  = document.getElementById("footer-centers");
  const hoursEl = document.getElementById("footer-working-hours");

  // footer.html có thể chưa được inject kịp -> báo "chưa xong"
  if (!listEl || !hoursEl) {
    return false;
  }

  try {
    const { centers } = await getCentersFromApi();

    // render danh sách cơ sở (cột 1)
    listEl.innerHTML = (centers || []).map((c, i) => {
      const name  = c.name || "";
      const addr  = c.address || "";
      const phone = c.hotline || "";
      const hrs   = c.workingHours || "";
      const days  = c.workingDays || "";

      const telHref = phone
        ? "tel:" + phone.replace(/\s+/g, "")
        : "#";

      return `
        <li class="mb-f-branch-name">
          <strong>${name}:</strong>
          <span class="mb-f-branch-address">${addr}</span>
        </li>
        <li class="mb-f-branch-hotline">
          <strong>Hotline:</strong>
          <a href="${telHref}">${phone}</a>
        </li>
        <li class="mb-f-branch-hours">
          <strong>Giờ làm việc:</strong>
          <span>${hrs} (${days})</span>
        </li>
        ${i < centers.length - 1
            ? '<li class="mb-f-split" aria-hidden="true"></li>'
            : ""
        }
      `;
    }).join("");

    // render dòng "Giờ làm việc:" ở cột Liên hệ (cột 2)
    if (centers && centers.length > 0) {
      const first = centers[0];
      const hrs   = first.workingHours || "";
      const days  = first.workingDays || "";
      hoursEl.textContent = `Giờ làm việc: ${hrs} (${days})`;
    } else {
      hoursEl.textContent = "Giờ làm việc: Đang cập nhật";
    }
  } catch (err) {
    console.error("[footer.page] lỗi:", err);

    // fallback nếu API hỏng
    listEl.innerHTML = `
      <li class="mb-f-branch-name">
        <strong>MathBridge:</strong>
        <span class="mb-f-branch-address">Đang cập nhật địa chỉ</span>
      </li>
      <li class="mb-f-branch-hotline">
        <strong>Hotline:</strong>
        <a href="#">Đang cập nhật</a>
      </li>
      <li class="mb-f-branch-hours">
        <strong>Giờ làm việc:</strong>
        <span>Đang cập nhật</span>
      </li>
    `;
    hoursEl.textContent = "Giờ làm việc: Đang cập nhật";
  }

  // đã fill xong
  return true;
}

// Thử nhiều lần cho đến khi footer DOM đã có
function retryFill(attempt = 0) {
  fillFooter().then((done) => {
    if (done) {
      return;
    }

    if (attempt < MAX_TRY) {
      setTimeout(() => {
        retryFill(attempt + 1);
      }, WAIT_MS);
    } else {
      console.warn("[footer.page] footer chưa render sau nhiều lần thử");
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
  retryFill(0);
});
