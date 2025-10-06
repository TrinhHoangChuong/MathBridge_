function jobCardTemplate(job) {
  const meta = [job.department, job.location, job.type, job.level].filter(Boolean).join(' • ');
  return `
    <article class="job-card" data-id="${job.id}">
      <div class="job-top">
        <div>
          <h3 class="job-title">${job.title}</h3>
          <div class="job-meta">${meta}</div>
        </div>
        <div class="job-actions">
          <button class="job-btn secondary" data-action="toggle">Chi tiết</button>
          <a class="job-btn" href="mailto:hr@mathbridge.edu?subject=Ứng tuyển: ${encodeURIComponent(job.title)}">Ứng tuyển</a>
        </div>
      </div>
      <div class="job-details">
        <h4>Mô tả</h4>
        <p>${job.description || ''}</p>
        ${Array.isArray(job.requirements) && job.requirements.length ? `
          <h4>Yêu cầu</h4>
          <ul>${job.requirements.map(r => `<li>${r}</li>`).join('')}</ul>
        ` : ''}
        <div style="margin-top:10px; font-size:12px; color:#666">Ngày đăng: ${job.postedAt || ''}</div>
      </div>
    </article>
  `;
}

async function renderJobs() {
  const list = document.getElementById('jobs-list');
  if (!list) return;

  try {
    const jobs = await (window.fetchJobs ? window.fetchJobs() : []);
    if (!jobs.length) {
      list.innerHTML = '<p>Hiện chưa có vị trí tuyển dụng.</p>';
      return;
    }
    list.innerHTML = jobs.map(jobCardTemplate).join('');

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="toggle"]');
      if (!btn) return;
      const card = btn.closest('.job-card');
      const details = card.querySelector('.job-details');
      details.classList.toggle('open');
      btn.textContent = details.classList.contains('open') ? 'Thu gọn' : 'Chi tiết';
    });
  } catch (err) {
    list.innerHTML = '<p style="color:red">Không tải được danh sách tuyển dụng.</p>';
    console.error(err);
  }
}

window.addEventListener('DOMContentLoaded', renderJobs);


