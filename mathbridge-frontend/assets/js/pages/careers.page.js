// Render careers page: list + details.

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function toSlug(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function renderJobList(activeSlug) {
  const wrap = document.getElementById("job-list");
  if (!wrap) return;
  const jobs = await (window.fetchJobs ? window.fetchJobs() : []);
  if (!jobs.length) {
    wrap.innerHTML =
      '<p style="padding:12px">Hiện chưa có vị trí tuyển dụng.</p>';
    return;
  }
  wrap.innerHTML = jobs
    .map((j) => {
      const href = `pages/Careers.html?job=${encodeURIComponent(j.slug)}`;
      const active = j.slug === activeSlug ? " active" : "";
      return `
      <a class="job-item${active}" href="${href}">
        <div class="title">${j.title}</div>
        <p class="meta">${j.location} • ${j.type}</p>
      </a>
    `;
    })
    .join("");
}

function renderJobDetails(job) {
  const titleEl = document.getElementById("job-title");
  const metaEl = document.getElementById("job-meta");
  const descEl = document.getElementById("job-desc");
  const reqsEl = document.getElementById("job-reqs");
  const benefitsEl = document.getElementById("job-benefits");
  const positionInput = document.getElementById("ap-position");

  if (!job) {
    titleEl.textContent = "Không tìm thấy vị trí";
    metaEl.textContent = "";
    descEl.textContent = "";
    reqsEl.innerHTML = "";
    benefitsEl.innerHTML = "";
    if (positionInput) positionInput.value = "";
    return;
  }

  titleEl.textContent = job.title;
  metaEl.textContent = `${job.location} • ${job.type} • ${job.salary}`;
  descEl.innerHTML = (job.description || "")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");
  reqsEl.innerHTML = (job.requirements || [])
    .map((r) => `<li>${r}</li>`)
    .join("");
  benefitsEl.innerHTML = (job.benefits || [])
    .map((b) => `<li>${b}</li>`)
    .join("");
  if (positionInput) positionInput.value = job.title;
}

async function renderCareerPage() {
  const slug = getQueryParam("job");
  const jobs = await (window.fetchJobs ? window.fetchJobs() : []);
  const job = slug
    ? await (window.fetchJobBySlug ? window.fetchJobBySlug(slug) : null)
    : jobs[0] || null;

  await renderJobList(job ? job.slug : slug);
  renderJobDetails(job);

  setupApplyFormValidation();
}

window.addEventListener("DOMContentLoaded", renderCareerPage);

function setupApplyFormValidation() {
  const form = document.getElementById("apply-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("ap-name");
    const phone = document.getElementById("ap-phone");
    const email = document.getElementById("ap-email");
    const file = document.getElementById("ap-file");

    let valid = true;
    const phoneRegex = /^(0|\+?84)[0-9]{9,10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.value.trim()) {
      markInvalid("name");
      valid = false;
    } else clearInvalid("name");
    if (!phoneRegex.test(phone.value.trim())) {
      markInvalid("phone");
      valid = false;
    } else clearInvalid("phone");
    if (!emailRegex.test(email.value.trim())) {
      markInvalid("email");
      valid = false;
    } else clearInvalid("email");

    if (file && file.files && file.files[0]) {
      const f = file.files[0];
      const max = 2 * 1024 * 1024; // 2MB
      const okType = /(jpg|jpeg|png|pdf)$/i.test(f.name);
      if (!okType || f.size > max) {
        alert("File không hợp lệ. Chỉ nhận JPG, JPEG, PNG, PDF và <= 2MB");
        valid = false;
      }
    }

    if (!valid) return;

    // Build FormData and submit to backend
    const submitBtn = form.querySelector('button[type="submit"]');
    const pos = document.getElementById("ap-position");
    const formData = new FormData();
    formData.append("name", name.value.trim());
    formData.append("phone", phone.value.trim());
    formData.append("email", email.value.trim());
    formData.append("position", pos ? pos.value : "");
    if (file && file.files && file.files[0])
      formData.append("file", file.files[0]);

    // preserve button text and use inner .btn-text if present
    let originalBtnText = null;
    const btnTextEl = submitBtn ? submitBtn.querySelector(".btn-text") : null;
    if (btnTextEl) {
      originalBtnText = btnTextEl.textContent;
      btnTextEl.textContent = "Đang gửi...";
    } else if (submitBtn) {
      originalBtnText = submitBtn.textContent;
      submitBtn.textContent = "Đang gửi...";
    }
    if (submitBtn) submitBtn.disabled = true;
    try {
      if (window.submitApplication) {
        const res = await window.submitApplication(formData);
        // Expecting { success: true, message: '...' } or similar
        if (res && (res.success === true || res.status === "ok")) {
          alert(
            res.message || "Gửi ứng tuyển thành công. Chúng tôi sẽ liên hệ sớm."
          );
          form.reset();
        } else {
          throw new Error(
            res && res.message ? res.message : "Lỗi khi gửi ứng tuyển"
          );
        }
      } else {
        // Fallback: no backend available
        alert("Chức năng gửi ứng tuyển tạm thời chưa khả dụng.");
      }
    } catch (err) {
      console.error("Submit application error", err);
      alert("Không thể gửi ứng tuyển: " + (err.message || err));
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnTextEl && originalBtnText !== null)
        btnTextEl.textContent = originalBtnText;
      else if (submitBtn && originalBtnText !== null)
        submitBtn.textContent = originalBtnText;
    }
  });
}

function markInvalid(field) {
  const el = document.querySelector(`.field[data-field="${field}"] input`);
  if (el) {
    el.style.borderColor = "#ef4444";
  }
}
function clearInvalid(field) {
  const el = document.querySelector(`.field[data-field="${field}"] input`);
  if (el) {
    el.style.borderColor = "#e5e7eb";
  }
}
