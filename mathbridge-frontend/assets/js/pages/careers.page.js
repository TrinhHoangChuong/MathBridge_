// Render careers page: list + details.

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function toSlug(str){
  return (str || '')
    .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g,'')
    .trim()
    .replace(/\s+/g,'-');
}

async function renderJobList(activeSlug){
  const wrap = document.getElementById('job-list');
  if (!wrap) return;
  const jobs = await (window.fetchJobs ? window.fetchJobs() : []);
  if (!jobs.length){
    wrap.innerHTML = '<p style="padding:12px">Hiện chưa có vị trí tuyển dụng.</p>';
    return;
  }
  wrap.innerHTML = jobs.map(j => {
    const href = `pages/Careers.html?job=${encodeURIComponent(j.slug)}`;
    const active = j.slug === activeSlug ? ' active' : '';
    return `
      <a class="job-item${active}" href="${href}">
        <div class="title">${j.title}</div>
        <p class="meta">${j.location} • ${j.type}</p>
      </a>
    `;
  }).join('');
}

function renderJobDetails(job){
  const titleEl = document.getElementById('job-title');
  const metaEl = document.getElementById('job-meta');
  const descEl = document.getElementById('job-desc');
  const reqsEl = document.getElementById('job-reqs');
  const benefitsEl = document.getElementById('job-benefits');
  const positionInput = document.getElementById('ap-position');

  if (!job){
    titleEl.textContent = 'Không tìm thấy vị trí';
    metaEl.textContent = '';
    descEl.textContent = '';
    reqsEl.innerHTML = '';
    benefitsEl.innerHTML = '';
    if (positionInput) positionInput.value = '';
    return;
  }

  titleEl.textContent = job.title;
  metaEl.textContent = `${job.location} • ${job.type} • ${job.salary}`;
  descEl.innerHTML = (job.description || '').split('\n').map(p => p.trim()).filter(Boolean).map(p => `<p>${p}</p>`).join('');
  reqsEl.innerHTML = (job.requirements || []).map(r => `<li>${r}</li>`).join('');
  benefitsEl.innerHTML = (job.benefits || []).map(b => `<li>${b}</li>`).join('');
  if (positionInput) positionInput.value = job.title;
}

async function renderCareerPage(){
  const slug = getQueryParam('job');
  const jobs = await (window.fetchJobs ? window.fetchJobs() : []);
  const job = slug ? (await (window.fetchJobBySlug ? window.fetchJobBySlug(slug) : null)) : jobs[0] || null;

  await renderJobList(job ? job.slug : slug);
  renderJobDetails(job);

  setupApplyFormValidation();
}

window.addEventListener('DOMContentLoaded', renderCareerPage);

function setupApplyFormValidation(){
  const form = document.getElementById('apply-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ap-name');
    const phone = document.getElementById('ap-phone');
    const email = document.getElementById('ap-email');
    const file = document.getElementById('ap-file');

    let valid = true;
    const phoneRegex = /^(0|\+?84)[0-9]{9,10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.value.trim()) { markInvalid('name'); valid = false; } else clearInvalid('name');
    if (!phoneRegex.test(phone.value.trim())) { markInvalid('phone'); valid = false; } else clearInvalid('phone');
    if (!emailRegex.test(email.value.trim())) { markInvalid('email'); valid = false; } else clearInvalid('email');

    if (file && file.files && file.files[0]){
      const f = file.files[0];
      const max = 2 * 1024 * 1024; // 2MB
      const okType = /(jpg|jpeg|png|pdf)$/i.test(f.name);
      if (!okType || f.size > max){
        alert('File không hợp lệ. Chỉ nhận JPG, JPEG, PNG, PDF và <= 2MB');
        valid = false;
      }
    }

    if (!valid) return;

    alert('Đã gửi thông tin ứng tuyển!');
    form.reset();
  });
}

function markInvalid(field){
  const el = document.querySelector(`.field[data-field="${field}"] input`);
  if (el){ el.style.borderColor = '#ef4444'; }
}
function clearInvalid(field){
  const el = document.querySelector(`.field[data-field="${field}"] input`);
  if (el){ el.style.borderColor = '#e5e7eb'; }
}

 