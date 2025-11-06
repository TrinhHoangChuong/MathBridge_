// ============================================================
// MathBridge – Courses Page Logic
// Xử lý trang chi tiết khóa học theo lớp
// ============================================================

let allCourses = [];
let filteredCourses = [];
const ENROLL_ENDPOINT = '/api/public/enroll/pending';
const AUTH_LOGIN_ENDPOINT = '/api/public/auth/login';
// Fallback guard to avoid 'CONFIG is not defined' when this file loads as module
const __CFG__ = (typeof window !== 'undefined' && window.CONFIG) ? window.CONFIG : { BASE_URL: 'http://localhost:8080' };
let activeTab = 'register';
let currentCoursePosition = null;

// Dữ liệu khóa học mẫu theo lớp
const courseData = {
  '9': {
    title: 'Lớp 9',
    subtitle: 'Chương trình toán học lớp 9 toàn diện',
    description: 'Chương trình toán học lớp 9 được thiết kế xây dựng cố gắng và phát triển kiến trúc toán học của học sinh, chuẩn bị tốt nhất cho kỳ thi vào lớp 10 và các kỳ thi học sinh giỏi.',
    learningContent: [
      'Đại số: Phương trình, bất phương trình, hệ thống',
      'Hình học: Đường tròn, góc nội tiếp, tứ giác nội tiếp',
      'Hàm số và đồ thị',
      'Các bài toán thực tế và ứng dụng'
        ],
    goals: [
      'Nắm vững kiến thức cơ bản và nâng cao',
      'Phát triển tư duy logic và sáng tạo',
      'Chuẩn bị tốt cho kỳ thi vào lớp 10',
      'Tự tin tham gia các kỳ thi học sinh giỏi'
    ]
  },
  '10': {
    title: 'Lớp 10',
    subtitle: 'Chương trình toán học lớp 10 chuyên sâu',
    description: 'Chương trình toán học lớp 10 được thiết kế để xây dựng nền tảng vững chắc cho học sinh, chuẩn bị cho chương trình THPT và các kỳ thi quan trọng.',
    learningContent: [
      'Đại số: Hàm số bậc nhất, bậc hai',
      'Hình học: Vectơ, tọa độ trong mặt phẳng',
      'Lượng giác: Các công thức cơ bản',
      'Thống kê và xác suất'
    ],
    goals: [
      'Nắm vững kiến thức nền tảng lớp 10',
      'Phát triển tư duy toán học logic',
      'Chuẩn bị cho chương trình THPT',
      'Tự tin với các kỳ thi quan trọng'
    ]
  },
  '11': {
    title: 'Lớp 11',
    subtitle: 'Chương trình toán học lớp 11 chuyên sâu',
    description: 'Chương trình toán học lớp 11 được thiết kế để phát triển tư duy toán học nâng cao, chuẩn bị cho kỳ thi THPT Quốc gia.',
    learningContent: [
      'Đại số: Hàm số mũ, logarit',
      'Hình học: Khối đa diện, mặt cầu',
      'Lượng giác: Công thức nâng cao',
      'Tích phân và đạo hàm'
    ],
    goals: [
      'Nắm vững kiến thức toán 11',
      'Phát triển tư duy phân tích',
      'Chuẩn bị cho kỳ thi THPT',
      'Tự tin với bài toán khó'
    ]
  },
  '12': {
    title: 'Lớp 12',
    subtitle: 'Chương trình toán học lớp 12 luyện thi',
    description: 'Chương trình toán học lớp 12 được thiết kế đặc biệt để luyện thi THPT Quốc gia và các kỳ thi đại học.',
    learningContent: [
      'Đại số: Hàm số, phương trình',
      'Hình học: Không gian, tọa độ',
      'Lượng giác: Công thức tổng hợp',
      'Tích phân và ứng dụng'
    ],
    goals: [
      'Nắm vững toàn bộ kiến thức 12',
      'Luyện thi THPT Quốc gia',
      'Đạt điểm cao trong kỳ thi',
      'Tự tin bước vào đại học'
    ]
  },
  'international': {
    title: 'Chương trình Quốc tế',
    subtitle: 'IGCSE/IB/AP/SAT/Toán nâng cao VN',
    description: 'Chương trình toán học quốc tế được thiết kế theo chuẩn Cambridge, IB, AP và SAT, phù hợp cho học sinh có định hướng du học.',
    learningContent: [
      'IGCSE Mathematics',
      'IB Mathematics HL/SL',
      'AP Calculus AB/BC',
      'SAT Math Level 1 & 2'
    ],
    goals: [
      'Đạt chứng chỉ quốc tế',
      'Chuẩn bị du học',
      'Phát triển tư duy toàn cầu',
      'Tự tin với môi trường quốc tế'
    ]
  }
};

// Template cho course card
function courseCardTemplate(course) {
  const methodClasses = {
    'online': 'online',
    'center': 'center', 
    'tutor': 'tutor'
  };
  
  const methodClass = methodClasses[course.method] || 'center';

  return `
    <div class="course-card" data-id="${course.id}">
      <div class="course-type-badge ${methodClass}">${course.methodText}</div>

      <h3 class="course-card__title">${course.title.replace(/\s–\sĐợt/g, '<br/>Đợt')}</h3>

      <ul class="course-card__meta">
        <li>👨‍🏫 ${course.teacher}</li>
        <li>📅 Ngày học: ${course.schedule}</li>
        <li>🕐 ${course.session}</li>
        <li>🏢 ${course.methodText}</li>
      </ul>

      <div class="course-card__desc">
        <div class="details-title">Mẫu đơn học tập</div>
        <ul class="details-list">
          <li>Thời gian: ${course.duration}</li>
          <li>Thời lượng: ${course.sessionLength}</li>
          <li>Số buổi: ${course.sessions}</li>
          <li>Sĩ số: ${course.maxStudents}</li>
        </ul>
      </div>

      <div class="course-description">
        <p>${course.description}</p>
      </div>

      <div class="course-card__actions">
        <button class="btn btn--primary enroll-btn" data-course-id="${course.id}">Đăng ký ngay</button>
      </div>
      <div class="course-price">${course.priceText}</div>
    </div>
  `;
}

// Render danh sách khóa học
function renderCourses(courses = filteredCourses) {
  const list = document.querySelector('[data-course-list]') || document.getElementById('course-list');
  const emptyMsg = document.querySelector('[data-course-empty]');
  const countEl = document.getElementById('course-count');
  if (!list) return;

  if (typeof countEl !== 'undefined' && countEl) {
    countEl.textContent = String(courses.length);
  }

  if (courses.length === 0) {
    list.innerHTML = '';
    if (emptyMsg) emptyMsg.classList.remove('hidden');
    return;
  }

  if (emptyMsg) emptyMsg.classList.add('hidden');
  list.innerHTML = courses.map(courseCardTemplate).join('');
  console.log('[Enroll] renderCourses -> cards rendered:', courses.length);
  bindEnrollButtons();
}

// Filter khóa học
function filterCourses() {
  const sessionFilter = document.getElementById('session-filter').value;
  const dayFilter = document.getElementById('day-filter').value;
  const methodFilter = document.getElementById('method-filter').value;

  filteredCourses = allCourses.filter(course => {
    const sessionMatch = sessionFilter === 'all' || course.session.includes(sessionFilter);
    const dayMatch = dayFilter === 'all' || course.schedule === dayFilter;
    const methodMatch = methodFilter === 'all' || course.method === methodFilter;
    
    return sessionMatch && dayMatch && methodMatch;
  });

  renderCourses();
}

// Đăng ký khóa học
function enrollCourse(courseId) {
  const course = allCourses.find(c => c.id === courseId);
  if (!course) {
    console.warn('[Enroll] enrollCourse: course not found for id:', courseId, 'in', allCourses);
    return;
  }

  const token = localStorage.getItem('mb_token');
  
  // Nếu chưa đăng nhập → mở form thu thập thông tin học sinh
  if (!token) {
    const modal = document.getElementById('enroll-modal');
    const titleEl = document.getElementById('enroll-modal-course');
    const idEl = document.getElementById('ef-courseId');
    if (titleEl) titleEl.textContent = course.title;
    if (idEl) idEl.value = String(courseId);

    console.log('[Enroll] open modal (unauth) for courseId:', courseId);
    openEnrollModal();
    return;
  }

  // Đã đăng nhập → hiện màn hình tóm tắt và xác nhận
  console.log('[Enroll] open summary (logged-in) for courseId:', courseId);
  openEnrollSummaryModal(course);
}

function openEnrollModal() {
  const modal = document.getElementById('enroll-modal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('is-open');
  // Bảo đảm hiển thị ngay cả khi CSS chưa kịp áp dụng
  try { modal.style.display = 'flex'; } catch (_) {}
  console.log('[Enroll] modal opened');
  try { document.body.style.overflow = 'hidden'; } catch (_) {}

  // reset tab to register mỗi lần mở
  setActiveTab('register');

  // Không còn khóa mục tiêu/lớp; chuyển sang giới tính
}

function closeEnrollModal() {
  const modal = document.getElementById('enroll-modal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('is-open');
  modal.style.display = 'none';
  try { document.body.style.overflow = ''; } catch (_) {}
}

// ========== SUMMARY + PAYMENT (for logged-in) ==========
function openEnrollSummaryModal(course) {
  const modal = document.getElementById('enroll-summary-modal');
  if (!modal) return;

  try { document.body.style.overflow = 'hidden'; } catch(_) {}
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('is-open');
  try { modal.style.display = 'flex'; } catch(_) {}

  const studentName = localStorage.getItem('mb_user_name') || '';
  const studentEmail = localStorage.getItem('mb_user_email') || '';

  const courseTitleEl = document.getElementById('summary-course-title');
  const studentEl = document.getElementById('summary-student');
  const infoEl = document.getElementById('summary-course-info');
  const contentEl = document.getElementById('summary-content');
  const priceEl = document.getElementById('summary-price');

  if (courseTitleEl) courseTitleEl.textContent = course.title || 'Khóa học';
  if (studentEl) studentEl.textContent = `${studentName}${studentEmail ? ' — ' + studentEmail : ''}`;

  const infoLines = [];
  if (course.grade) infoLines.push(`Khối: ${course.grade}`);
  if (course.method) infoLines.push(`Hình thức: ${course.method === 'online' ? 'Trực tuyến' : (course.method === 'center' ? 'Tại trung tâm' : course.method)}`);
  if (course.schedule) infoLines.push(`Lịch học: ${course.schedule}`);
  if (course.session) infoLines.push(`Ca học: ${course.session}`);
  if (course.teacherName) infoLines.push(`Giáo viên: ${course.teacherName}`);
  if (infoEl) infoEl.textContent = infoLines.join(' | ');
  if (contentEl) contentEl.textContent = (course.content && Array.isArray(course.content) ? course.content.join(', ') : (course.description || ''));

  const priceText = course.priceText || (course.price ? `${course.price.toLocaleString('vi-VN')}đ` : 'Liên hệ');
  if (priceEl) priceEl.textContent = priceText;

  const confirmBtn = document.getElementById('summary-confirm-btn');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      closeEnrollSummaryModal();
      openPaymentModal(course);
    };
  }

  // close handlers
  modal.querySelectorAll('[data-close-summary]')
    .forEach(el => el.addEventListener('click', closeEnrollSummaryModal, { once: true }));
}

function closeEnrollSummaryModal() {
  const modal = document.getElementById('enroll-summary-modal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('is-open');
  modal.style.display = 'none';
  try { document.body.style.overflow = ''; } catch(_) {}
}

function openPaymentModal(course) {
  const modal = document.getElementById('payment-modal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('is-open');
  try { modal.style.display = 'flex'; } catch(_) {}

  const close = () => {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    modal.style.display = 'none';
    try { document.body.style.overflow = ''; } catch(_) {}
  };

  modal.querySelectorAll('[data-close-payment]').forEach(el => {
    el.addEventListener('click', close);
  });

  modal.querySelectorAll('[data-pay-method]')
    .forEach(btn => btn.addEventListener('click', (e) => {
      const method = e.currentTarget.getAttribute('data-pay-method');
      // Tạm thời chỉ hiện thông báo; tích hợp cổng thanh toán sau
      alert(`Bạn đã chọn phương thức: ${method}.\nNhân viên sẽ liên hệ để hướng dẫn thanh toán.`);
      close();
    }));
}

function showCredentialsModal(email, password) {
  console.log('[Enroll] ===== showCredentialsModal called =====');
  console.log('[Enroll] Email:', email, 'Password:', password ? '***' : 'null');
  
  const modal = document.getElementById('credentials-modal');
  if (!modal) {
    console.error('[Enroll] ❌ credentials-modal not found in DOM');
    alert('Lỗi: Không tìm thấy modal credentials. Vui lòng kiểm tra HTML.');
    return;
  }
  console.log('[Enroll] ✅ Modal element found');
  
  const emailInput = document.getElementById('cred-email');
  const passwordInput = document.getElementById('cred-password');
  
  if (!emailInput || !passwordInput) {
    console.error('[Enroll] ❌ Email or password input not found');
    console.error('[Enroll] emailInput:', emailInput, 'passwordInput:', passwordInput);
    alert('Lỗi: Không tìm thấy input fields. Vui lòng kiểm tra HTML.');
    return;
  }
  console.log('[Enroll] ✅ Input fields found');
  
  emailInput.value = email || '';
  passwordInput.value = password || '';
  
  console.log('[Enroll] Set emailInput.value:', emailInput.value);
  console.log('[Enroll] Set passwordInput.value:', passwordInput.value ? '***' : 'empty');
  
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('is-open');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  console.log('[Enroll] Modal attributes set:');
  console.log('[Enroll] - aria-hidden:', modal.getAttribute('aria-hidden'));
  console.log('[Enroll] - has is-open class:', modal.classList.contains('is-open'));
  console.log('[Enroll] - display style:', modal.style.display);
  console.log('[Enroll] - computed display:', window.getComputedStyle(modal).display);
  
  setTimeout(() => {
    setupCopyButtons();
    console.log('[Enroll] ✅ Credentials modal should be visible now');
  }, 100);
}

function closeCredentialsModal() {
  const modal = document.getElementById('credentials-modal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('is-open');
  modal.style.display = 'none';
  try { document.body.style.overflow = ''; } catch (_) {}
}

function setupCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const type = this.getAttribute('data-copy');
      const input = document.getElementById(type === 'email' ? 'cred-email' : 'cred-password');
      if (input && input.value) {
        input.select();
        input.setSelectionRange(0, 99999);
        try {
          document.execCommand('copy');
          const originalText = this.textContent;
          this.textContent = 'Đã copy!';
          this.style.background = '#28a745';
          setTimeout(() => {
            this.textContent = originalText;
            this.style.background = '#007bff';
          }, 2000);
        } catch (err) {
          console.error('[Enroll] Copy failed:', err);
        }
      }
    });
  });
}

function bindEnrollButtons() {
  const buttons = document.querySelectorAll('.enroll-btn[data-course-id]');
  buttons.forEach(btn => {
    try {
      if (btn.hasAttribute('onclick')) {
        btn.removeAttribute('onclick');
      }
    } catch (_) {}
    btn.onclick = null;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = String(btn.getAttribute('data-course-id'));
      const position = btn.getAttribute('data-course-position');
      const coursePosition = position ? parseInt(position, 10) : null;
      enrollCourse(id, coursePosition);
    });
  });
}

function installEnrollAutoBinder() {
  const list = document.querySelector('[data-course-list]') || document.getElementById('course-list');
  if (!list) return;
  const obs = new MutationObserver(() => {
    bindEnrollButtons();
  });
  obs.observe(list, { childList: true, subtree: true });
}

function bindSeeMoreToggles() {
  // No-op: nút "Xem thêm" đã được loại bỏ
}

function initGradeSwitcher() {
  const params = new URLSearchParams(window.location.search);
  const current = (params.get('grade') || '9').toLowerCase();
  const chips = document.querySelectorAll('#grade-switcher .grade-chip');
  chips.forEach((chip) => {
    const g = (chip.getAttribute('data-grade') || '').toLowerCase();
    chip.classList.toggle('is-active', g === current);
    chip.addEventListener('click', () => {
      if (!g) return;
      const url = new URL(window.location.href);
      url.searchParams.set('grade', g);
      window.location.href = url.toString();
    });
  });
}

function attachEnrollModalEvents() {
  const modal = document.getElementById('enroll-modal');
  if (!modal) return;

  // Close buttons / backdrop
  modal.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeEnrollModal);
  });

  // Submit form
  const form = document.getElementById('enroll-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const messageEl = document.getElementById('enroll-form-message');
      if (messageEl) messageEl.textContent = '';

      const submitBtn = form.querySelector('button[type="submit"]');
      const disable = (v) => { if (submitBtn) { submitBtn.disabled = v; submitBtn.textContent = v ? 'Đang gửi…' : 'Gửi đăng ký'; }};

      const hoTen = document.getElementById('ef-hoTen').value.trim();
      const soDienThoai = document.getElementById('ef-sdt').value.trim();
      const ngaySinh = document.getElementById('ef-ngaySinh').value || null;
      const diaChi = document.getElementById('ef-diaChi').value.trim() || null;
      const gioiTinhKey = (document.getElementById('ef-gender')?.value || 'male');
      const gioiTinh = gioiTinhKey === 'female' ? 0 : 1;
      const data = {
        hoTen,
        soDienThoai,
        ngaySinh,
        diaChi,
        gioiTinh,
        courseId: document.getElementById('ef-courseId').value,
        coursePosition: currentCoursePosition,
      };

      const phoneOk = /^0\d{9}$/.test(soDienThoai);
      if (!hoTen || !phoneOk || !diaChi) {
        if (messageEl) messageEl.textContent = 'Vui lòng nhập đầy đủ Họ tên, SĐT hợp lệ và Địa chỉ.';
        return;
      }

      try {
        disable(true);
        const resFetch = await fetch((window.CONFIG && window.CONFIG.BASE_URL ? window.CONFIG.BASE_URL : '') + ENROLL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const res = await resFetch.json().catch(()=>({ success:false }));

        if (res && res.success) {
          console.log('[Enroll] Full Response:', JSON.stringify(res, null, 2));
          console.log('[Enroll] Response data:', res.data);
          console.log('[Enroll] Response data type:', typeof res.data);
          console.log('[Enroll] Response data keys:', res.data ? Object.keys(res.data) : 'null');
          
          const email = res.data && res.data.email;
          const password = res.data && res.data.password;
          
          console.log('[Enroll] Extracted Email:', email, 'Type:', typeof email, 'IsTruthy:', !!email);
          console.log('[Enroll] Extracted Password:', password ? '***' : 'null', 'Type:', typeof password, 'IsTruthy:', !!password);
          
          if (messageEl) {
            messageEl.style.display = 'none';
            messageEl.textContent = '';
          }
          
          closeEnrollModal();
          
          if (email && password) {
            console.log('[Enroll] ✅ Both email and password exist, showing credentials modal');
            showCredentialsModal(email, password);
          } else {
            console.error('[Enroll] ❌ Missing email or password!');
            console.error('[Enroll] Email:', email, 'Password:', password);
            console.error('[Enroll] Email truthy:', !!email, 'Password truthy:', !!password);
            
            const errorMsg = `Đăng ký thành công. Trạng thái: pending\n\n` +
              `Email: ${email || 'N/A'}\n` +
              `Password: ${password || 'N/A'}\n\n` +
              `(Kiểm tra console để xem chi tiết response)`;
            alert(errorMsg);
          }
        } else {
          throw new Error(res && res.message ? res.message : 'Không thể đăng ký.');
        }
      } catch (err) {
        if (messageEl) messageEl.textContent = 'Có lỗi xảy ra: ' + err.message;
      }
      finally { disable(false); }
    });
  }

  // Tabs switching
  const tabButtons = modal.querySelectorAll('.mb-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      setActiveTab(tab);
    });
  });

  const credentialsModal = document.getElementById('credentials-modal');
  if (credentialsModal) {
    credentialsModal.querySelectorAll('[data-close-credentials-modal]').forEach(el => {
      el.addEventListener('click', closeCredentialsModal);
    });
    setTimeout(() => setupCopyButtons(), 100);
  }
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('login-form-message');
      if (msg) msg.textContent = '';
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const disable = (v) => { if (submitBtn) { submitBtn.disabled = v; submitBtn.textContent = v ? 'Đang đăng nhập…' : 'Đăng nhập'; }};
      
      const username = document.getElementById('lf-username').value.trim();
      const password = document.getElementById('lf-password').value;
      
      if (!username || !password) {
        if (msg) msg.textContent = 'Vui lòng nhập đầy đủ thông tin.';
        return;
      }

      try {
        disable(true);
        
        // Sử dụng API giống login.page.js - có thể dùng email hoặc username
        const requestPayload = {
          email: username, // Backend có thể chấp nhận email hoặc username
          password: password
        };
        
        const resFetch = await fetch((window.CONFIG?.BASE_URL||'') + AUTH_LOGIN_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });
        
        const res = await resFetch.json().catch(()=>({ success:false }));
        
        if (res && res.success) {
          // Lấy payload từ response (giống login.page.js)
          const responsePayload = res.data || res || {};
          const user = responsePayload.user || responsePayload.account || responsePayload || {};
          const roles = user.roles || responsePayload.roles || [];
          
          // LƯU kiểu mới - đảm bảo có đầy đủ thông tin (đồng bộ với login.page.js)
          localStorage.setItem('mb_auth', JSON.stringify(responsePayload));
          
          // LƯU thêm kiểu cũ cho mấy trang cũ
          if (responsePayload.token) {
            localStorage.setItem('mb_token', responsePayload.token);
          }
          if (responsePayload.tokenType) {
            localStorage.setItem('mb_token_type', responsePayload.tokenType);
          }
          if (user.idTk || user.id) {
            localStorage.setItem('mb_user_id', user.idTk || user.id);
          }
          if (user.email) {
            localStorage.setItem('mb_user_email', user.email);
          }
          if (roles.length) {
            localStorage.setItem('mb_user_roles', JSON.stringify(roles));
          }
          
          // Lấy tên - ưu tiên fullName từ backend
          const name =
            user.fullName ||        
            user.hoTen ||            
            (user.ho && user.ten ? `${user.ho} ${user.tenDem || ""} ${user.ten}`.trim() : null) ||
            user.ten ||              
            user.email ||            
            "Người dùng";
          
          localStorage.setItem('mb_user_name', name);
          
          console.log('[Courses] Login successful. User info saved:', {
            fullName: user.fullName,
            hoTen: user.hoTen,
            name: name,
            roles: roles
          });
          
          // Gọi hàm render header để cập nhật UI ngay lập tức
          if (window.mbRenderHeader) {
            window.mbRenderHeader();
          }
          
          if (msg) msg.textContent = 'Đăng nhập thành công.';
          
          setTimeout(() => {
            msg && (msg.textContent = '');
            closeEnrollModal();
            // Reload trang để cập nhật UI (hiển thị user box thay vì login button)
            window.location.reload();
          }, 1200);
        } else {
          throw new Error(res && res.message ? res.message : 'Đăng nhập thất bại');
        }
      } catch (err) {
        if (msg) msg.textContent = 'Lỗi đăng nhập: ' + err.message;
        console.error('[Courses] Login error:', err);
      } finally { 
        disable(false); 
      }
    });
  }

  // Password toggle functionality for Courses modal
  const lfPasswordInput = document.getElementById('lf-password');
  const lfPasswordToggle = document.getElementById('lf-password-toggle');
  const lfPasswordEyeIcon = document.getElementById('lf-password-eye-icon');
  
  if (lfPasswordInput && lfPasswordToggle && lfPasswordEyeIcon) {
    lfPasswordToggle.addEventListener('click', function() {
      const isPassword = lfPasswordInput.type === 'password';
      lfPasswordInput.type = isPassword ? 'text' : 'password';
      lfPasswordEyeIcon.className = isPassword ? 'ph ph-eye-slash' : 'ph ph-eye';
      lfPasswordToggle.setAttribute('aria-label', isPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu');
    });
  }
}

function setActiveTab(tab) {
  activeTab = tab === 'login' ? 'login' : 'register';
  const modal = document.getElementById('enroll-modal');
  if (!modal) return;
  modal.querySelectorAll('.mb-tab-btn').forEach(b => {
    const isActive = b.getAttribute('data-tab') === activeTab;
    b.classList.toggle('is-active', isActive);
  });
  modal.querySelectorAll('.mb-tab-panel').forEach(panel => {
    const isActive = panel.id === `tab-${activeTab}`;
    panel.classList.toggle('is-active', isActive);
  });
}

// Map grade param -> ID chương trình (ID_CT)
function mapGradeToProgramId(grade) {
  const map = {
    '9': 'CT001',
    '10': 'CT002',
    '11': 'CT003',
    '12': 'CT004',
    'international': 'CT005',
    'cert': 'CT005',
  };
  return map[grade] || 'CT001';
}

function formatCurrencyVnd(value) {
  if (value == null) return '';
  try {
    const num = typeof value === 'number' ? value : Number(value);
    return num.toLocaleString('vi-VN') + 'đ/tháng';
  } catch (e) {
    return value + 'đ/tháng';
  }
}

function mapMethod(hinhThucHoc) {
  const key = (hinhThucHoc || '').toUpperCase();
  if (key.includes('ONLINE')) return { method: 'online', text: 'Trực tuyến' };
  if (key.includes('GIA')) return { method: 'tutor', text: 'Gia sư 1-1' };
  return { method: 'center', text: 'Tại trung tâm' };
}

function mapCourseResponseToView(c) {
  const m = mapMethod(c.hinhThucHoc);
  return {
    id: c.idLH,
    title: c.tenLop,
    teacher: c.teacherName ? c.teacherName : (c.idNV ? `GV phụ trách: ${c.idNV}` : 'MathBridge'),
    schedule: c.loaiNgay || '—',
    session: '60 phút/buổi',
    method: m.method,
    methodText: m.text,
    duration: 'Theo lịch trung tâm',
    sessionLength: '60 phút/buổi',
    sessions: c.soBuoi ? `${c.soBuoi} buổi` : '—',
    maxStudents: 'Tối đa 15 học sinh',
    description: c.moTa || '—',
    price: c.mucGiaThang || 0,
    priceText: formatCurrencyVnd(c.mucGiaThang || 0),
  };
}

async function fetchCoursesByGrade(grade) {
  const idCT = mapGradeToProgramId(grade);
  const url = `${__CFG__.BASE_URL}/api/public/course/program/${idCT}`;
  try {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    // Chấp nhận cả 2 dạng: ApiResponse{success,data} hoặc trả thẳng mảng
    const rawList = Array.isArray(json) ? json : (json && json.data) ? json.data : [];
    const mapped = rawList.map(mapCourseResponseToView);
    console.log('[Courses] fetched', rawList.length, 'items from BE; mapped:', mapped.length);
    return mapped;
  } catch (err) {
    console.error('[Courses] Không thể kết nối backend:', err.message);
    console.warn('[Courses] Backend có thể chưa chạy. Vui lòng kiểm tra: http://localhost:8080');
    return [];
  }
}

// Load dữ liệu khóa học theo lớp (mix metadata FE + data từ BE)
async function loadCourseData() {
  const urlParams = new URLSearchParams(window.location.search);
  const grade = urlParams.get('grade') || '9';

  const courseInfo = courseData[grade] || courseData['9'];

  document.getElementById('course-title').textContent = courseInfo.title;
  document.getElementById('course-subtitle').textContent = courseInfo.subtitle;
  document.getElementById('course-description').textContent = courseInfo.description;
  document.getElementById('current-course').textContent = courseInfo.title;

  const learningContentList = document.getElementById('learning-content');
  learningContentList.innerHTML = courseInfo.learningContent.map(item => `<li>${item}</li>`).join('');

  const goalsList = document.getElementById('learning-goals');
  goalsList.innerHTML = courseInfo.goals.map(item => `<li>${item}</li>`).join('');

  try {
    const beCourses = await fetchCoursesByGrade(grade);
    allCourses = beCourses;
    
    if (beCourses.length === 0) {
      console.warn('[Courses] Không có dữ liệu từ backend. Kiểm tra:');
      console.warn('  1. Backend có đang chạy không? (http://localhost:8080)');
      console.warn('  2. API endpoint có đúng không? (/api/public/course/program/CT001)');
      console.warn('  3. CORS có được cấu hình không?');
    }
  } catch (e) {
    console.error('Không load được khóa học từ BE', e);
    allCourses = [];
  }

  filteredCourses = [...allCourses];
  renderCourses();
}

// Khởi tạo trang
function initCoursesPage() {
  // Load dữ liệu khóa học
  loadCourseData();

  // Thêm event listeners cho filter
  const filterSelects = document.querySelectorAll('.filter-select');
  filterSelects.forEach(select => {
    select.addEventListener('change', filterCourses);
  });

  // Grade switcher
  initGradeSwitcher();

  // Modal events
  attachEnrollModalEvents();

  // Cài watcher để đảm bảo mọi nút đều được bind
  installEnrollAutoBinder();
}

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', initCoursesPage);
