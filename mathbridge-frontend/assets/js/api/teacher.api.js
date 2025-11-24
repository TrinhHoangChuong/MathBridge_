// assets/js/api/teacher.api.js
// Lấy danh sách giáo viên để hiển thị ở trang /pages/Teachers.html
// backend: GET /api/public/nhanvien/giaovien
// backend trả: [ { idNv, ho, tenDem, ten, chuyenMon, kinhNghiem }, ... ]
// FE sẽ dùng thêm intro/tags/programsLabel để giới thiệu từng giảng viên.

import { CONFIG } from "../config.js";

/* ========== UTIL CƠ BẢN ========== */
function buildFullName(ho, tenDem, ten) {
  const parts = [];
  if (ho) parts.push(ho);
  if (tenDem) parts.push(tenDem);
  if (ten) parts.push(ten);
  return parts.join(" ").trim();
}

function hashStringToNumber(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/* ========== BẢNG CẤU HÌNH RIÊNG (NẾU MUỐN) ========== */
/**
 * Nếu bạn có 1 vài GV “key” muốn viết giới thiệu riêng (ví dụ GV trưởng bộ môn),
 * có thể map ở đây theo idNv.
 *
 * Nếu không match idNv ở đây → sẽ dùng template tự động bên dưới.
 */
const TEACHER_EXTRA_INFO = {
  // Ví dụ:
  // "GV001": {
  //   intro:
  //     "Tập trung xây nền tảng vững chắc cho học sinh theo chuẩn Cambridge, giúp các em tự tin chinh phục điểm A/A*.",
  //   tags: [
  //     "IGCSE Extended",
  //     "A-Level Math",
  //     "Lộ trình cá nhân hóa",
  //   ],
  //   programsLabel: "IGCSE · A-Level · Lớp 10–12",
  // },
};

/* ========== PHÂN LOẠI GIẢNG VIÊN THEO CHUYÊN MÔN ========== */
function detectCategory(chuyenMonRaw = "") {
  const s = chuyenMonRaw.toLowerCase();

  if (s.includes("igcse")) return "igcse";
  if (s.includes("a-level") || s.includes("a level")) return "alevel";
  if (s.includes("ib")) return "ib";
  if (s.includes("sat")) return "sat";
  if (s.includes("ap calculus") || s.includes("ap math") || s.includes("ap "))
    return "ap";
  if (s.includes("nâng cao") || s.includes("chuyên") || s.includes("olymp"))
    return "advanced";

  return "generic"; // Toán THPT / quốc tế chung chung
}

/* ========== TEMPLATE INTRO THEO NHÓM ========== */
// Mỗi nhóm có nhiều template – sẽ chọn template theo hash (ổn định cho từng GV)

const INTRO_TEMPLATES = {
  igcse: [
    (t) =>
      `Giúp học sinh nắm chắc Number, Algebra, Geometry theo chuẩn IGCSE, kết hợp bài giảng trực quan và nhiều ví dụ gần gũi để giảm áp lực học Toán.`,
    (t) =>
      `Tập trung củng cố nền tảng và kĩ năng làm bài cho kỳ thi IGCSE, bám sát sách giáo khoa và past papers, phù hợp cho học sinh muốn cải thiện điểm nhanh.`,
    (t) =>
      `Phong cách dạy rõ ràng, chậm rãi nhưng sâu, luôn nhấn mạnh “hiểu bản chất trước rồi mới luyện đề” để học sinh không bị mất gốc khi lên lớp trên.`,
  ],
  alevel: [
    (t) =>
      `Chuyên ôn thi A-Level với trọng tâm là tư duy giải nhanh và trình bày logic. Hướng dẫn học sinh phân tích đề, nhận diện dạng bài và tối ưu thời gian làm bài.`,
    (t) =>
      `Kinh nghiệm làm việc với học sinh thi A-Level tại các trường quốc tế, xây dựng lộ trình từ nền tảng đến chinh phục điểm A/A* với nhiều buổi luyện past papers.`,
    (t) =>
      `Giảng dạy theo style “concept first”, luôn bắt đầu từ trực quan rồi mới đi vào công thức, giúp học sinh nhớ lâu và vận dụng linh hoạt trong đề thi A-Level.`,
  ],
  ib: [
    (t) =>
      `Tập trung vào hiểu bản chất trong IB Math (AA/AI), rèn cách trình bày bài thi Paper 1 & 2 chuẩn rubrics, giúp học sinh tự tin đạt 6–7 điểm.`,
    (t) =>
      `Kinh nghiệm đồng hành cùng nhiều học sinh IB, hỗ trợ song song việc làm IA, luyện đề và củng cố kĩ năng giải quyết vấn đề trong bối cảnh thực tiễn.`,
    (t) =>
      `Luôn kết nối kiến thức Toán với ví dụ đời sống và các môn học khác trong chương trình IB, giúp học sinh không chỉ “giải bài” mà còn “hiểu ý nghĩa”.`,
  ],
  sat: [
    (t) =>
      `Chuyên luyện SAT Math với chiến lược làm nhanh, hướng dẫn nhận diện bẫy đề và các mẹo rút gọn thời gian, phù hợp cho học sinh mục tiêu 650–750+.`,
    (t) =>
      `Xây dựng lộ trình SAT Math cá nhân hoá, kết hợp luyện đề theo từng chủ đề yếu, tracking tiến độ qua từng tuần để đảm bảo điểm số tăng đều.`,
    (t) =>
      `Giảng dạy theo hướng “exam oriented” nhưng không bỏ qua nền tảng, giúp học sinh hiểu vì sao chọn đáp án, thay vì chỉ học mẹo giải nhanh.`,
  ],
  ap: [
    (t) =>
      `Giúp học sinh nắm chắc Calculus theo chuẩn AP, tập trung vào trực quan hoá đạo hàm – tích phân và ứng dụng, từ đó làm chủ các dạng bài trong đề thi.`,
    (t) =>
      `Kết hợp song song luyện đề AP và ôn lại khái niệm cốt lõi, đảm bảo học sinh không bị “học vẹt công thức” mà hiểu được logic của từng bước giải.`,
  ],
  advanced: [
    (t) =>
      `Nhiều năm kinh nghiệm làm việc với học sinh chuyên và đội tuyển, tập trung rèn tư duy giải các bài toán khó, bài toán chứng minh và Olympiad cơ bản.`,
    (t) =>
      `Phong cách dạy giàu năng lượng, hay đặt câu hỏi gợi mở để học sinh tự suy nghĩ và tìm lời giải, rất phù hợp với các bạn yêu thích thử thách Toán học.`,
    (t) =>
      `Thiết kế lộ trình bám sát mục tiêu thi HSG, thi vào lớp chuyên, đồng thời vẫn củng cố nền tảng vững chắc cho chương trình THPT và quốc tế.`,
  ],
  generic: [
    (t) =>
      `Tập trung xây dựng nền tảng vững chắc cho học sinh, giải thích khái niệm từ dễ đến khó, giúp các em không còn sợ Toán và dần yêu thích môn học.`,
    (t) =>
      `Luôn dùng ví dụ gần gũi với đời sống để giải thích các khái niệm trừu tượng, tạo môi trường học thoải mái nhưng vẫn giữ kỷ luật và hiệu quả.`,
    (t) =>
      `Thiết kế lộ trình học cá nhân hoá, kết hợp bài trên lớp ở trường với hệ thống bài tập rèn luyện thêm, giúp cải thiện cả điểm kiểm tra và tư duy Toán.`,
    (t) =>
      `Phong cách giảng dạy nhẹ nhàng, kiên nhẫn, phù hợp với học sinh đang mất gốc hoặc thiếu tự tin khi học Toán ở các chương trình quốc tế.`,
  ],
};

/* ========== TAGS & PROGRAMS LABEL ========== */

function buildTagsForCategory(cat, chuyenMon) {
  switch (cat) {
    case "igcse":
      return [
        "IGCSE Core/Extended",
        "Theo sát chương trình Cambridge",
        "Luyện past papers có chọn lọc",
      ];
    case "alevel":
      return [
        "A-Level Mathematics",
        "Luyện past papers A-Level",
        "Tập trung tư duy giải nhanh",
      ];
    case "ib":
      return [
        "IB Math AA/AI HL & SL",
        "Hỗ trợ làm Internal Assessment (IA)",
        "Chuẩn bị cho Paper 1 & 2",
      ];
    case "sat":
      return [
        "SAT Math 600→750+",
        "Chiến lược làm bài nhanh",
        "Phân tích lỗi sai theo từng chủ đề",
      ];
    case "ap":
      return [
        "AP Calculus AB/BC",
        "Ôn concept kèm luyện đề",
        "Phù hợp mục tiêu điểm cao",
      ];
    case "advanced":
      return [
        "Toán nâng cao THPT",
        "Olympiad cơ bản",
        "Bồi dưỡng tư duy chứng minh",
      ];
    default:
      return [
        "Theo sát chương trình trên lớp",
        "Củng cố nền tảng và kĩ năng làm bài",
        "Lộ trình học cá nhân hoá",
      ];
  }
}

function buildProgramsLabel(cat) {
  switch (cat) {
    case "igcse":
      return "IGCSE · Lớp 9–11";
    case "alevel":
      return "A-Level · Lớp 11–12";
    case "ib":
      return "IB Math · Lớp 11–12";
    case "sat":
      return "SAT Math · Lớp 10–12";
    case "ap":
      return "AP Calculus · Lớp 11–12";
    case "advanced":
      return "Toán nâng cao · Lớp 9–12";
    default:
      return "Toán THPT & chương trình quốc tế";
  }
}

/* ========== CHỌN INTRO CHO TỪNG GIÁO VIÊN ========== */
function buildIntroForTeacher(teacher) {
  // Nếu có cấu hình riêng theo idNv → ưu tiên
  const extra = teacher.idNv ? TEACHER_EXTRA_INFO[teacher.idNv] : undefined;
  if (extra && extra.intro) {
    return extra.intro;
  }

  const cat = detectCategory(teacher.chuyenMon);
  const templates = INTRO_TEMPLATES[cat] || INTRO_TEMPLATES.generic;

  const key = teacher.idNv || teacher.hoTen || teacher.chuyenMon || "";
  const idx = templates.length ? hashStringToNumber(key) % templates.length : 0;

  const templateFn = templates[idx] || INTRO_TEMPLATES.generic[0];
  return templateFn(teacher);
}

function buildTagsForTeacher(teacher) {
  const extra = teacher.idNv ? TEACHER_EXTRA_INFO[teacher.idNv] : undefined;
  if (extra && Array.isArray(extra.tags) && extra.tags.length > 0) {
    return extra.tags;
  }
  const cat = detectCategory(teacher.chuyenMon);
  return buildTagsForCategory(cat, teacher.chuyenMon);
}

function buildProgramsLabelForTeacher(teacher) {
  const extra = teacher.idNv ? TEACHER_EXTRA_INFO[teacher.idNv] : undefined;
  if (extra && extra.programsLabel) {
    return extra.programsLabel;
  }
  const cat = detectCategory(teacher.chuyenMon);
  return buildProgramsLabel(cat);
}

function attachTeacherIntros(teachers) {
  return teachers.map((t) => {
    const intro = buildIntroForTeacher(t);
    const tags = buildTagsForTeacher(t);
    const programsLabel = buildProgramsLabelForTeacher(t);

    return {
      ...t,
      intro,
      tags,
      programsLabel,
    };
  });
}

/* ========== HÀM CHÍNH GỌI BACKEND ========== */
export async function getTeachersFromApi() {
  const url = `${CONFIG.BASE_URL}/api/public/nhanvien/giaovien`;

  try {
    const res = await fetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      console.error("teachers API error:", res.status);
      return { teachers: [] };
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.warn("teachers API: response không phải array", data);
      return { teachers: [] };
    }

    let teachers = data.map((item) => ({
      idNv: item.idNv,
      hoTen: buildFullName(item.ho, item.tenDem, item.ten),
      chuyenMon: item.chuyenMon || "",
      kinhNghiem: item.kinhNghiem ?? null,
    }));

    teachers = attachTeacherIntros(teachers);

    return { teachers };
  } catch (err) {
    console.error("teachers API exception:", err);
    return { teachers: [] };
  }
}
