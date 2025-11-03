// assets/js/pages/contact.page.js
import { getContactInfo, submitContact } from "../api/contact.api.js";

/* helpers ------------------------------------------------ */
function $(sel) { return document.querySelector(sel); }
function escapeHTML(str = "") {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function joinHours(days, hours) {
  if (days && hours) return `${days} • ${hours}`;
  return days || hours || "";
}
function renderSocialLinks(ulEl, socialMap) {
  if (!ulEl) return;
  if (!socialMap || typeof socialMap !== "object") return;

  const knownOrder = ["facebook", "instagram", "linkedin", "youtube", "tiktok", "zalo", "website"];
  const items = [];

  for (const key of knownOrder) {
    const url = socialMap[key] || socialMap[key?.toUpperCase?.()] || socialMap[key?.toLowerCase?.()];
    if (url) {
      const label = key[0].toUpperCase() + key.slice(1);
      items.push(`<li><a href="${escapeHTML(url)}" class="contact-link" target="_blank" rel="noopener">${escapeHTML(label)}</a></li>`);
    }
  }
  // Các key khác không nằm trong knownOrder
  for (const k in socialMap) {
    if (!knownOrder.includes(k.toLowerCase())) {
      const url = socialMap[k];
      if (url) items.push(`<li><a href="${escapeHTML(url)}" class="contact-link" target="_blank" rel="noopener">${escapeHTML(k)}</a></li>`);
    }
  }

  if (items.length) ulEl.innerHTML = items.join("");
}

function renderCenters(listEl, centers) {
  if (!listEl) return;
  if (!centers || !centers.length) {
    listEl.textContent = "Chưa có thông tin cơ sở.";
    return;
  }

  const html = centers.map((c) => {
    const name  = c?.name || c?.ten || c?.title || "Cơ sở";
    const addr  = c?.address || c?.diaChi || "";
    const phone = c?.hotline || c?.phone || "";
    const hrs   = c?.hours || c?.workingHours || "";
    return `
      <div class="center-item">
        <div class="center-item__name">${escapeHTML(name)}</div>
        ${addr ? `<div class="center-item__addr">${escapeHTML(addr)}</div>` : ""}
        ${phone ? `<div class="center-item__phone">☎ ${escapeHTML(phone)}</div>` : ""}
        ${hrs ? `<div class="center-item__hours">🕒 ${escapeHTML(hrs)}</div>` : ""}
      </div>
    `;
  }).join("");
  listEl.innerHTML = html;
}

function setStatus(msg, ok = true) {
  const el = $("#form-status");
  if (!el) return;
  el.textContent = msg || "";
  // hỗ trợ cả 2 naming: is-success/is-error và success/error
  el.classList.toggle("is-success", !!ok);
  el.classList.toggle("is-error", !ok);
  el.classList.toggle("success", !!ok);
  el.classList.toggle("error", !ok);
}

/* init info ---------------------------------------------- */
async function initContactInfo() {
  const info = await getContactInfo();

  const hotlineEl = $("#contact-hotline");
  const addrEl    = $("#contact-address");
  const hoursEl   = $("#contact-hours");
  const socialUl  = document.querySelector(".contact-social");
  const centersEl = $("#centers-list");
  const mapIframe = document.querySelector(".contact-map iframe");

  if (hotlineEl) hotlineEl.textContent = info.hotline || "Đang cập nhật";
  if (addrEl)    addrEl.textContent    = info.address || "Đang cập nhật";
  if (hoursEl)   hoursEl.textContent   = joinHours(info.workingDays, info.workingHours) || "Đang cập nhật";

  renderSocialLinks(socialUl, info.socialLinks);
  renderCenters(centersEl, info.centers);

  if (mapIframe && info.mapEmbedUrl) {
    mapIframe.setAttribute("src", info.mapEmbedUrl);
  }
}

/* submit form -------------------------------------------- */
function getFormPayload(form) {
  const fd = new FormData(form);
  const firstName = (fd.get("first_name") || "").toString().trim();
  const lastName  = (fd.get("last_name")  || "").toString().trim();
  const email     = (fd.get("email")      || "").toString().trim();
  const phone     = (fd.get("phone")      || "").toString().trim();
  const tuVanLbl  = (fd.get("hinhThucTuVan") || "").toString().trim();
  const message   = (fd.get("message")    || "").toString().trim();

  // Ghép đúng theo DTO BE: hoTen
  const hoTen = `${lastName} ${firstName}`.trim().replace(/\s+/g, " ");
  // Tạo tiêu đề nếu không có input riêng
  const tieuDe = tuVanLbl || "Liên hệ tư vấn MathBridge";

  // Map ĐÚNG với LienHeTuVanDTO (BE đã cung cấp)
  return {
    hoTen: hoTen,
    email: email,
    sdt: phone,
    tieuDe: tieuDe,
    noiDung: message,
    hinhThucTuVan: tuVanLbl
  };
}

function lockForm(form, locked) {
  form.querySelectorAll("input, select, textarea, button").forEach(el => {
    el.disabled = !!locked;
  });
}

function initForm() {
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = getFormPayload(form);
    console.debug("[Contact] submitting payload:", payload);

    lockForm(form, true);
    setStatus("Đang gửi liên hệ...", true);

    const { success, message } = await submitContact(payload);

    if (success) {
      setStatus(message || "Liên hệ của bạn đã được gửi thành công!", true);
      form.reset();
    } else {
      setStatus(message || "Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại.", false);
    }

    lockForm(form, false);
  });
}

/* boot --------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initContactInfo();
  initForm();
});
