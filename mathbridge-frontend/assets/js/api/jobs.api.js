// API tuyển dụng (mock tạm thời)
async function fetchJobs() {
  // TODO: Khi BE sẵn sàng, thay bằng http('/api/jobs')
  return [
    {
      id: 101,
      title: 'Giáo viên Toán quốc tế (IGCSE/IB/AP)',
      department: 'Học thuật',
      type: 'Full-time',
      location: 'Hà Nội / TP.HCM / Remote',
      level: 'Mid–Senior',
      postedAt: '2025-10-01',
      description: 'Giảng dạy và xây dựng nội dung Toán theo chuẩn IGCSE/IB/AP.',
      requirements: [
        'Tốt nghiệp các ngành Toán/Sư phạm Toán hoặc liên quan',
        'Kinh nghiệm luyện thi IGCSE/IB/AP/SAT là lợi thế',
        'Giao tiếp tốt, tư duy sư phạm, tận tâm',
      ],
    },
    {
      id: 102,
      title: 'Chuyên viên tuyển sinh',
      department: 'Vận hành',
      type: 'Full-time',
      location: 'TP.HCM',
      level: 'Junior–Mid',
      postedAt: '2025-09-24',
      description: 'Tư vấn khóa học, theo dõi học viên và phối hợp bộ phận học thuật.',
      requirements: [
        'Kỹ năng giao tiếp, thuyết phục tốt',
        'Ưu tiên có kinh nghiệm giáo dục',
      ],
    },
    {
      id: 103,
      title: 'Marketing Executive',
      department: 'Marketing',
      type: 'Intern/Part-time',
      location: 'Remote',
      level: 'Intern–Junior',
      postedAt: '2025-09-20',
      description: 'Tham gia triển khai chiến dịch marketing số và nội dung.',
      requirements: [
        'Hiểu biết cơ bản SEO/Content/Ads',
        'Tinh thần học hỏi, chủ động',
      ],
    },
  ];
}

window.fetchJobs = fetchJobs;


