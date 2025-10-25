// Gọi API liên quan đến giáo viên

// Tạm thời: mock dữ liệu trong FE
async function fetchTutors() {
  // TODO: khi có BE, thay bằng: return http('/api/tutors');
  return [
    {
      id: 1,
      name: 'Nguyễn Minh Anh',
      title: 'ThS. Toán học — Giảng viên IGCSE',
      photo: 'assets/img/hero4.jpg',
      experience: '7+ năm',
      specialties: ['IGCSE', 'IB HL', 'AP Calc'],
    },
    {
      id: 2,
      name: 'Trần Quốc Khánh',
      title: 'Cử nhân Sư phạm — Luyện thi SAT/IB',
      photo: 'assets/img/hero5.jpg',
      experience: '5+ năm',
      specialties: ['SAT Math', 'IB AA SL'],
    },
    {
      id: 3,
      name: 'Lê Thu Hà',
      title: 'Thạc sĩ Giáo dục — AP/Toán nâng cao',
      photo: 'assets/img/hero6.jpg',
      experience: '8+ năm',
      specialties: ['AP Calc AB', 'AP Calc BC', 'Toán nâng cao VN'],
    },
    {
      id: 4,
      name: 'Phạm Đức Long',
      title: 'Giảng viên Toán — IB/SAT',
      photo: 'assets/img/hero7.jpg',
      experience: '6+ năm',
      specialties: ['IB AA HL', 'SAT Math'],
    },
  ];
}

window.fetchTutors = fetchTutors;
