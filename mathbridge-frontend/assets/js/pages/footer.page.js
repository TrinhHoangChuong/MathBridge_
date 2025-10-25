// assets/js/pages/footer.page.js

import { getCentersFromApi } from "../api/centers.api.js";

// Retry logic nhỏ để chờ footer được include vào DOM.
// Vì dự án của bạn dùng partials/footer.html + includePartials.js,
// phần footer có thể được chèn sau khi DOMContentLoaded.
// => Nếu script chạy quá sớm mà chưa có #footer-centers thì ta chờ 1 chút.

const MAX_RETRY = 20; // số lần thử tối đa
const RETRY_DELAY_MS = 150; // mỗi lần thử cách nhau 150ms

async function initFooterContent() {
    const centersListEl = document.getElementById("footer-centers");
    const workingHoursEl = document.getElementById("footer-working-hours");

    if (!centersListEl || !workingHoursEl) {
        // footer chưa được inject -> báo cho hàm waitRetryInitFooter biết để thử lại
        return false;
    }

    try {
        const data = await getCentersFromApi();
        // data = { centers: [ ... ] }

        if (!data || !Array.isArray(data.centers)) {
            throw new Error("Dữ liệu footer không đúng format (thiếu 'centers')");
        }

        // 1. Render toàn bộ danh sách cơ sở vào cột đầu tiên
        // Mỗi cơ sở hiển thị:
        // - Tên cơ sở + địa chỉ
        // - Hotline (click to call)
        // - Giờ làm việc

        const htmlForCenters = data.centers.map((center, idx) => {
            const name = center.name || "";
            const address = center.address || "";
            const hotline = center.hotline || "";
            const workingHours = center.workingHours || "";
            const workingDays = center.workingDays || "";

            // Link call từ hotline
            const hotlineHref = hotline
                ? `tel:${hotline.replace(/\s+/g, "")}`
                : "#";

            return `
                <li class="mb-f-branch-name">
                    <strong>${name}:</strong>
                    <span class="mb-f-branch-address">${address}</span>
                </li>
                <li class="mb-f-branch-hotline">
                    <strong>Hotline:</strong>
                    <a href="${hotlineHref}">${hotline}</a>
                </li>
                <li class="mb-f-branch-hours">
                    <strong>Giờ làm việc:</strong>
                    <span>${workingHours} (${workingDays})</span>
                </li>
                ${
                    idx < data.centers.length - 1
                        ? '<li class="mb-f-split" aria-hidden="true"></li>'
                        : ""
                }
            `;
        }).join("");

        centersListEl.innerHTML = htmlForCenters;

        // 2. Update "Giờ làm việc" trong cột 2 từ cơ sở đầu tiên
        if (data.centers.length > 0) {
            const first = data.centers[0];
            const hoursText = first.workingHours || "";
            const daysText = first.workingDays || "";
            workingHoursEl.textContent = `Giờ làm việc: ${hoursText} (${daysText})`;
        } else {
            workingHoursEl.textContent = "Giờ làm việc: Đang cập nhật";
        }

    } catch (err) {
        console.error("[footer.page] Lỗi khi load footer:", err);

        // fallback nếu backend chết hoặc lỗi format
        centersListEl.innerHTML = `
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
        workingHoursEl.textContent = "Giờ làm việc: Đang cập nhật";
    }

    // trả true để báo đã init xong, không cần retry nữa
    return true;
}

// chờ cho đến khi footer DOM thực sự tồn tại rồi mới init
function waitRetryInitFooter(attempt = 0) {
    initFooterContent().then((done) => {
        if (done) return;

        if (attempt < MAX_RETRY) {
            setTimeout(() => {
                waitRetryInitFooter(attempt + 1);
            }, RETRY_DELAY_MS);
        } else {
            console.warn("[footer.page] Hết retry, footer chưa render được.");
        }
    });
}

// chạy khi document đã ready
document.addEventListener("DOMContentLoaded", function () {
    waitRetryInitFooter();
});
