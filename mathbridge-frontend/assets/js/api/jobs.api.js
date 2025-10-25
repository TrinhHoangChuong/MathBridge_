// Jobs API (mock). Replace with real http('/api/jobs') when BE ready.

const JOBS = [
  {
    id: 1,
    slug: 'giang-vien-toan-quoc-te',
    title: 'Giảng viên Toán quốc tế',
    location: 'TP. Hồ Chí Minh',
    type: 'Full-time',
    salary: 'Thoả thuận',
    description: `
      Giảng dạy các chương trình Toán quốc tế (IGCSE/IB/AP/SAT) hoặc Toán nâng cao Việt Nam.
      Xây dựng kế hoạch giảng dạy theo lộ trình cá nhân hoá mục tiêu của học viên.
      Theo dõi, đánh giá tiến độ và phối hợp với phụ huynh trong quá trình học.
    `,
    requirements: [
      'Tốt nghiệp chuyên ngành Toán học/Sư phạm Toán hoặc liên quan',
      'Ưu tiên có kinh nghiệm luyện thi IGCSE/IB/AP/SAT',
      'Kỹ năng sư phạm tốt, giao tiếp rõ ràng',
      'Tận tâm, trách nhiệm, làm việc nhóm tốt'
    ],
    benefits: [
      'Mức lương cạnh tranh + thưởng hiệu suất',
      'Đào tạo nâng cao chuyên môn định kỳ',
      'Môi trường chuyên nghiệp, đồng nghiệp supportive',
      'Lộ trình phát triển nghề nghiệp rõ ràng'
    ],
  },
  {
    id: 2,
    slug: 'tro-giang-toan',
    title: 'Trợ giảng Toán',
    location: 'Hà Nội',
    type: 'Part-time',
    salary: 'Từ 6–10 triệu/tháng',
    description: `
      Hỗ trợ giảng viên trong các lớp Toán, kèm học viên làm bài tập, giải đáp thắc mắc.
      Chuẩn bị tài liệu, chấm bài, tổng hợp báo cáo tiến độ học tập.
    `,
    requirements: [
      'Sinh viên năm 3 trở lên ngành Toán/Sư phạm Toán hoặc liên quan',
      'Kiến thức Toán tốt, ưu tiên giao tiếp tiếng Anh cơ bản',
      'Chăm chỉ, nhiệt tình, cẩn thận',
    ],
    benefits: [
      'Giờ giấc linh hoạt',
      'Cơ hội học hỏi và phát triển nghề nghiệp',
      'Phụ cấp theo ca + thưởng',
    ],
  }
];

async function fetchJobs() {
  // Replace with: return http('/api/jobs');
  return JOBS;
}

async function fetchJobBySlug(slug) {
  // Replace with: return http(`/api/jobs/${slug}`);
  return JOBS.find(j => j.slug === slug) || null;
}

window.fetchJobs = fetchJobs;
window.fetchJobBySlug = fetchJobBySlug;

 