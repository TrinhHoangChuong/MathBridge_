// ============================================================
// MathBridge – Courses Page Logic
// Xử lý trang chi tiết khóa học theo lớp
// ============================================================

let allCourses = [];
let filteredCourses = [];

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
    ],
    courses: [
      {
        id: 1,
        title: 'Toán 9 - Nâng cao số lượng',
        teacher: 'Thầy Nguyễn Văn An',
        schedule: '2-4-6',
        session: 'Ca 1',
        method: 'center',
        methodText: 'Tại trung tâm',
        duration: '3 tháng/khóa',
        sessionLength: '3 tiếng/buổi',
        sessions: '36 buổi',
        maxStudents: 'Tối đa 15 học sinh',
        description: 'Khóa học tập trung vào các chủ đề đại số nâng cao cho học sinh lớp 9, bao gồm phương trình bậc hai, hệ phương trình, bất phương trình và các bài toán thực tế.',
        price: 1200000,
        priceText: '1.200.000đ/tháng'
      },
      {
        id: 2,
        title: 'Toán 9 - Hình học cơ bản',
        teacher: 'Cô Trần Thị Bình',
        schedule: '3-5-7',
        session: 'Ca 2',
        method: 'online',
        methodText: 'Trực tuyến',
        duration: '3 tháng/khóa',
        sessionLength: '3 tiếng/buổi',
        sessions: '36 buổi',
        maxStudents: 'Tối đa 15 học sinh',
        description: 'Chương trình học hình học lớp 9 với các chủ đề về đường tròn, góc nội tiếp, tứ giác nội tiếp, các định lý về góc và cung.',
        price: 900000,
        priceText: '900.000đ/tháng'
      },
      {
        id: 3,
        title: 'Toán 9 - Ôn thi vào 10',
        teacher: 'Thầy Lê Minh Cường',
        schedule: '4-6-CN',
        session: 'Ca 3',
        method: 'tutor',
        methodText: 'Gia sư 1-1',
        duration: '3 tháng/khóa',
        sessionLength: '3 tiếng/buổi',
        sessions: '36 buổi',
        maxStudents: 'Tối đa 15 học sinh',
        description: 'Khóa học chuyên sâu được chuẩn bị cho kỳ thi vào lớp 10, bao gồm ôn tập toàn bộ chương trình toán 9, luyện đề thi thử, phân tích và giải quyết các dạng bài khó.',
        price: 2500000,
        priceText: '2.500.000đ/tháng'
      },
      {
        id: 4,
        title: 'Toán 9 - Luyện thi HSG',
        teacher: 'Thầy Phạm Đức Duy',
        schedule: '2-4-6',
        session: 'Ca 4',
        method: 'center',
        methodText: 'Tại trung tâm',
        duration: '3 tháng/khóa',
        sessionLength: '3 tiếng/buổi',
        sessions: '36 buổi',
        maxStudents: 'Tối đa 15 học sinh',
        description: 'Chương trình đào tạo học sinh giỏi toán lớp 9, tập trung vào các bài toán nâng cao, olympic toán, phát triển tư duy sáng tạo và kỹ năng giải quyết vấn đề.',
        price: 1800000,
        priceText: '1.800.000đ/tháng'
      },
      {
        id: 5,
        title: 'Toán 9 - Cơ sở nâng cao',
        teacher: 'Cô Hoàng Thị Lan',
        schedule: '3-5-7',
        session: 'Ca 5',
        method: 'online',
        methodText: 'Trực tuyến',
        duration: '3 tháng/khóa',
        sessionLength: '3 tiếng/buổi',
        sessions: '36 buổi',
        maxStudents: 'Tối đa 15 học sinh',
        description: 'Khóa học toàn diện từ cơ bản đến nâng cao, phù hợp cho mọi trình độ học sinh. Bao gồm đầy đủ các chủ đề trong chương trình toán 9.',
        price: 1000000,
        priceText: '1.000.000đ/tháng'
      },
      {
        id: 6,
        title: 'Toán 9 - Buổi tối cuối tuần',
        teacher: 'Thầy Vũ Thanh Tùng',
        schedule: '4-6-CN',
        session: 'Ca 6',
        method: 'center',
        methodText: 'Tại trung tâm',
        duration: '3 tháng/khóa',
        sessionLength: '3 tiếng/buổi',
        sessions: '36 buổi',
        maxStudents: 'Tối đa 15 học sinh',
        description: 'Lớp học tối dành cho học sinh bận rộn trên trường vào ban ngày. Chương trình học linh hoạt, tập trung vào các kiến thức cốt lõi.',
        price: 1100000,
        priceText: '1.100.000đ/tháng'
      }
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
    ],
    courses: [
      {
        id: 7,
        title: 'Toán 10 - Cơ bản',
        teacher: 'Thầy Nguyễn Văn Bình',
        schedule: '2-4-6',
        session: 'Ca 1',
        method: 'center',
        methodText: 'Tại trung tâm',
        duration: '4 tháng/khóa',
        sessionLength: '3 tiếng/buổi',
        sessions: '48 buổi',
        maxStudents: 'Tối đa 15 học sinh',
        description: 'Khóa học cơ bản cho học sinh lớp 10, tập trung vào các kiến thức nền tảng và kỹ năng giải bài tập.',
        price: 1300000,
        priceText: '1.300.000đ/tháng'
      },
      {
        id: 8,
        title: 'Toán 10 - Nâng cao',
        teacher: 'Cô Lê Thị Hoa',
        schedule: '3-5-7',
        session: 'Ca 2',
        method: 'online',
        methodText: 'Trực tuyến',
        duration: '4 tháng/khóa',
        sessionLength: '3 tiếng/buổi',
        sessions: '48 buổi',
        maxStudents: 'Tối đa 12 học sinh',
        description: 'Khóa học nâng cao cho học sinh lớp 10, tập trung vào các bài toán khó và chuẩn bị cho kỳ thi học sinh giỏi.',
        price: 1500000,
        priceText: '1.500.000đ/tháng'
      }
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
    ],
    courses: [
      {
        id: 9,
        title: 'Toán 11 - Cơ bản',
        teacher: 'Thầy Trần Văn Minh',
        schedule: '2-4-6',
        session: 'Ca 3',
        method: 'center',
        methodText: 'Tại trung tâm',
        duration: '5 tháng/khóa',
        sessionLength: '3 tiếng/buổi',
        sessions: '60 buổi',
        maxStudents: 'Tối đa 15 học sinh',
        description: 'Khóa học cơ bản cho học sinh lớp 11, tập trung vào các kiến thức nền tảng.',
        price: 1400000,
        priceText: '1.400.000đ/tháng'
      }
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
    ],
    courses: [
      {
        id: 10,
        title: 'Toán 12 - Luyện thi THPT',
        teacher: 'Thầy Phạm Văn Đức',
        schedule: '2-4-6',
        session: 'Ca 4',
        method: 'center',
        methodText: 'Tại trung tâm',
        duration: '6 tháng/khóa',
        sessionLength: '3 tiếng/buổi',
        sessions: '72 buổi',
        maxStudents: 'Tối đa 15 học sinh',
        description: 'Khóa học luyện thi THPT Quốc gia cho học sinh lớp 12, tập trung vào các dạng bài thi.',
        price: 2000000,
        priceText: '2.000.000đ/tháng'
      }
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
    ],
    courses: [
      {
        id: 11,
        title: 'IGCSE Mathematics',
        teacher: 'Thầy John Smith',
        schedule: '3-5-7',
        session: 'Ca 5',
        method: 'online',
        methodText: 'Trực tuyến',
        duration: '8 tháng/khóa',
        sessionLength: '3 tiếng/buổi',
        sessions: '96 buổi',
        maxStudents: 'Tối đa 10 học sinh',
        description: 'Khóa học IGCSE Mathematics theo chuẩn Cambridge, chuẩn bị cho kỳ thi IGCSE.',
        price: 3000000,
        priceText: '3.000.000đ/tháng'
      },
      {
        id: 12,
        title: 'IB Mathematics HL',
        teacher: 'Cô Sarah Johnson',
        schedule: '2-4-6',
        session: 'Ca 6',
        method: 'tutor',
        methodText: 'Gia sư 1-1',
        duration: '12 tháng/khóa',
        sessionLength: '2 tiếng/buổi',
        sessions: '144 buổi',
        maxStudents: 'Tối đa 1 học sinh',
        description: 'Khóa học IB Mathematics Higher Level, chuẩn bị cho kỳ thi IB Diploma.',
        price: 5000000,
        priceText: '5.000.000đ/tháng'
      }
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
      
      <h3 class="course-title">${course.title}</h3>
      
      <div class="course-meta">
        <div class="meta-item">
          <span class="meta-icon">👨‍🏫</span>
          <span>${course.teacher}</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">📅</span>
          <span>Ngày học: ${course.schedule}</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">🕐</span>
          <span>${course.session}</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">🏢</span>
          <span>${course.methodText}</span>
        </div>
      </div>
      
      <div class="course-details">
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
        <a href="#" class="see-more">Xem thêm</a>
      </div>
      
      <div class="course-footer">
        <div>
          <div class="course-price">${course.priceText}</div>
        </div>
        <button class="enroll-btn" onclick="enrollCourse(${course.id})">
          Đăng ký ngay
        </button>
      </div>
    </div>
  `;
}

// Render danh sách khóa học
function renderCourses(courses = filteredCourses) {
  const list = document.getElementById('course-list');
  if (!list) return;

  if (courses.length === 0) {
    list.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--mb-gray-1);">
        <h3>Không tìm thấy khóa học</h3>
        <p>Hãy thử thay đổi bộ lọc để tìm khóa học phù hợp</p>
      </div>
    `;
    return;
  }

  list.innerHTML = courses.map(courseCardTemplate).join('');
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
  if (!course) return;
  
  // Hiển thị thông báo hoặc redirect đến trang đăng ký
  alert(`Đăng ký khóa học: ${course.title}\nGiáo viên: ${course.teacher}\nGiá: ${course.priceText}\n\nChức năng đăng ký sẽ được triển khai sớm.`);
}

// Load dữ liệu khóa học theo lớp
function loadCourseData() {
  // Lấy lớp từ URL parameter hoặc mặc định là lớp 9
  const urlParams = new URLSearchParams(window.location.search);
  const grade = urlParams.get('grade') || '9';
  
  const courseInfo = courseData[grade];
  if (!courseInfo) {
    console.error('Không tìm thấy dữ liệu cho lớp', grade);
    return;
  }

  // Cập nhật thông tin trang
  document.getElementById('course-title').textContent = courseInfo.title;
  document.getElementById('course-subtitle').textContent = courseInfo.subtitle;
  document.getElementById('course-description').textContent = courseInfo.description;
  document.getElementById('current-course').textContent = courseInfo.title;

  // Cập nhật nội dung học tập
  const learningContentList = document.getElementById('learning-content');
  learningContentList.innerHTML = courseInfo.learningContent.map(item => `<li>${item}</li>`).join('');

  // Cập nhật mục tiêu
  const goalsList = document.getElementById('learning-goals');
  goalsList.innerHTML = courseInfo.goals.map(item => `<li>${item}</li>`).join('');

  // Load danh sách khóa học
  allCourses = courseInfo.courses;
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
}

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', initCoursesPage);
