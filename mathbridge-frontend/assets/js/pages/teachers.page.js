// Render danh sách giáo viên vào grid
async function renderTeachers() {
  const grid = document.getElementById('teachers-grid');
  if (!grid) return;

  try {
    const tutors = await (window.fetchTutors ? window.fetchTutors() : []);
    if (!tutors.length) {
      grid.innerHTML = '<p>Hiện chưa có dữ liệu giáo viên.</p>';
      return;
    }

    grid.innerHTML = tutors.map(t => `
      <article class="teacher-card">
        <img class="teacher-photo" src="${t.photo}" alt="${t.name}">
        <div class="teacher-body">
          <h3 class="teacher-name">${t.name}</h3>
          <p class="teacher-title">${t.title}</p>
          <p class="teacher-meta">Kinh nghiệm: ${t.experience}</p>
          ${Array.isArray(t.specialties) && t.specialties.length ? `
            <div class="teacher-tags">
              ${t.specialties.map(s => `<span class="teacher-tag">${s}</span>`).join('')}
            </div>` : ''}
        </div>
      </article>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<p style="color:red">Không tải được danh sách giáo viên.</p>';
    console.error(e);
  }
}

window.addEventListener('DOMContentLoaded', renderTeachers);


