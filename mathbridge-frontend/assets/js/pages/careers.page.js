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
  const shortDescEl = document.getElementById("job-short-desc");
  const detailsEl = document.getElementById("job-details");
  const descEl = document.getElementById("job-desc");
  const reqsEl = document.getElementById("job-reqs");
  const positionInput = document.getElementById("ap-position");

  if (!job) {
    titleEl.textContent = "Không tìm thấy vị trí";
    if (shortDescEl) shortDescEl.textContent = "";
    if (detailsEl) detailsEl.innerHTML = "";
    descEl.textContent = "";
    reqsEl.innerHTML = "";
    if (positionInput) positionInput.value = "";
    return;
  }

  titleEl.textContent = job.title;
  
  // Display short description under title
  if (shortDescEl) {
    shortDescEl.textContent = job.shortDescription || job.description || "";
  }
  
  // Render job details
  if (detailsEl) {
    let detailsHtml = '<div class="job-details-grid">';
    
    // Add salary information
    if (job.salary) {
      detailsHtml += `<div class="detail-item">
        <strong>Mức lương:</strong> ${job.salary}
      </div>`;
    }
    
    if (job.capBac) {
      detailsHtml += `<div class="detail-item">
        <strong>Trình độ:</strong> ${job.capBac} Level
      </div>`;
    }
    
    if (job.kinhNghiem) {
      detailsHtml += `<div class="detail-item">
        <strong>Kinh nghiệm:</strong> ${job.kinhNghiem} năm
      </div>`;
    }
    
    if (job.soLuongTuyen) {
      detailsHtml += `<div class="detail-item">
        <strong>Số lượng tuyển:</strong> ${job.soLuongTuyen} người
      </div>`;
    }
    
    if (job.hanNop) {
      detailsHtml += `<div class="detail-item">
        <strong>Hạn nộp hồ sơ:</strong> ${job.hanNop}
      </div>`;
    }
    
    if (job.trangThai) {
      detailsHtml += `<div class="detail-item">
        <strong>Trạng thái:</strong> <span class="status-badge">${job.trangThai}</span>
      </div>`;
    }
    
    detailsHtml += '</div>';
    detailsEl.innerHTML = detailsHtml;
  }
  
  descEl.innerHTML = (job.description || "")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");
  reqsEl.innerHTML = (job.requirements || [])
    .map((r) => `<li>${r}</li>`)
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
  setupModernUpload();
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
    const linkProfile = document.getElementById("ap-link-profile");
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
    
    // Validate LinkProfile if provided
    if (linkProfile.value.trim()) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(linkProfile.value.trim())) {
        markInvalid("linkProfile");
        valid = false;
      } else clearInvalid("linkProfile");
    } else {
      clearInvalid("linkProfile");
    }

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
    if (linkProfile.value.trim()) {
      formData.append("linkProfile", linkProfile.value.trim());
    }
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
             res.message || "Gửi ứng tuyển thành công. Hồ sơ của bạn đang chờ duyệt. Chúng tôi sẽ liên hệ sớm."
           );
           form.reset();
           // Reset file preview
           const filePreview = document.getElementById('file-preview');
           if (filePreview) {
             filePreview.classList.remove('show');
             filePreview.innerHTML = '';
           }
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

// Modern Upload Features
function setupModernUpload() {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('ap-file');
  const filePreview = document.getElementById('file-preview');
  
  if (!uploadZone || !fileInput || !filePreview) return;

  // Drag and drop events
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      handleFileSelect(files[0]);
    }
  });

  // Click to upload
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  });

  function handleFileSelect(file) {
    // Validate file
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ hỗ trợ file JPEG, PNG, PDF');
      return;
    }
    
    if (file.size > maxSize) {
      alert('File quá lớn. Kích thước tối đa 2MB');
      return;
    }

    // Show file preview
    showFilePreview(file);
  }

  function showFilePreview(file) {
    const fileIcon = getFileIcon(file.type);
    const fileSize = formatFileSize(file.size);
    
    filePreview.innerHTML = `
      <div class="file-preview-item">
        <svg class="file-icon" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${fileIcon}
        </svg>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${fileSize}</div>
        </div>
        <button type="button" class="file-remove" onclick="removeFile()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    
    filePreview.classList.add('show');
  }

  function getFileIcon(type) {
    if (type.startsWith('image/')) {
      return '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21,15 16,10 5,21"></polyline>';
    } else if (type === 'application/pdf') {
      return '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10,9 9,9 8,9"></polyline>';
    } else {
      return '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10,9 9,9 8,9"></polyline>';
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Global function to remove file
  window.removeFile = function() {
    fileInput.value = '';
    filePreview.classList.remove('show');
    filePreview.innerHTML = '';
  };
}
