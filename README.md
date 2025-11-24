# 🎓 MathBridge

MathBridge là bộ demo full-stack mô phỏng hệ thống quản lý trung tâm Toán học. Repo chứa:

- **Spring Boot backend** (JWT, Spring Data JPA, SQL Server/H2).
- **HTML/CSS/JavaScript frontend** (portal giáo viên/học sinh/tutor).
- Dữ liệu mẫu & logic thực tế: lịch dạy, bài tập, đánh giá buổi/lớp, báo cáo.

---

## 1. Tính năng chính

| Nhóm | Mô tả |
| --- | --- |
| **Teacher Portal** | Dashboard realtime, lịch dạy (tự phát hiện trùng phòng/thời gian), modal chi tiết lớp/buổi, giao/chấm bài tập, xem nhận xét học sinh. |
| **Student/Parent View** | Theo dõi lớp đăng ký, điểm số, bài tập, thông tin thanh toán (demo). |
| **Admin Services** | Các module quản lý lớp, nhân sự, lịch dạy, tài chính (dữ liệu mẫu). |
| **Đánh giá & báo cáo** | Bảng `DanhGiaBuoiHoc`, `DanhGiaLopHoc` lưu điểm/nhận xét, backend tổng hợp điểm trung bình và số lượng review để hiển thị trên portal. |

---

## 2. Kiến trúc tổng quan

```
┌────────────────────────────────────────────────────────────────┐
│                           MathBridge                           │
├──────────────────────┬──────────────────────────────────────────┤
│ Frontend             │ Backend                                  │
│ - HTML/CSS/JS        │ - Spring Boot 3.2 (port 8080)            │
│ - Fetch API + JWT    │ - REST Controller → Service → Repository │
│ - LocalStorage token │ - SQL Server (hoặc H2 khi dev)           │
└──────────────────────┴──────────────────────────────────────────┘
Flow: Login → lưu JWT → gọi `/api/public/...` → Backend xử lý → trả JSON → render UI.
```

---

## 3. Cấu trúc thư mục

```
MathBridge_/
├── mathbridge-backend/
│   ├── src/main/java/com/mathbridge/
│   │   ├── controller/       # Auth, GiaoVien, PortalAdmin,...
│   │   ├── dto/              # DTO chia theo module
│   │   ├── entity/           # BuoiHocChiTiet, LopHoc, DanhGia*, ...
│   │   ├── repository/       # Spring Data JPA
│   │   ├── service/          # Business logic (PortalTeacherServiceImpl,...)
│   │   └── security/config   # JWT, CORS, RestTemplateConfig
│   └── src/main/resources/application.properties
├── mathbridge-frontend/
│   ├── portal/teacher/index_teacher.html
│   ├── portal/assets/js/teacher-main.js, teacher-functions.js
│   └── assets/css/...
└── docs/, uploads/, run-*.bat
```

---

## 4. Domain & dữ liệu

| Bảng | Nội dung chính | Quan hệ |
| --- | --- | --- |
| `LopHoc` | Thông tin lớp, giáo viên phụ trách, mô tả, học phí. | 1-n với `BuoiHocChiTiet`, `DangKyLH`, `DanhGiaLopHoc`. |
| `BuoiHocChiTiet` | Lịch học cụ thể (ngày, giờ, phòng, nội dung). | n-1 `LopHoc`, 1-n `DanhGiaBuoiHoc`, `BaiTap`. |
| `DanhGiaBuoiHoc` | Nhận xét/điểm từng buổi của học sinh. | n-1 `BuoiHocChiTiet` & `HocSinh`. |
| `DanhGiaLopHoc` | Đánh giá tổng cho lớp (unique `ID_HS + ID_LH`). | n-1 `HocSinh`, `LopHoc`. |
| `BaiTap`/`BaiNop` | Bài giao và bài nộp, liên kết buổi học. | Dùng trong teacher portal để giao/chấm bài. |

---

## 5. Backend đáng chú ý

- **GiaoVienController**
  - `GET /api/public/giaovien/{idNv}/schedule`: trả lịch dạy + thống kê (live/upcoming/completed) + cảnh báo xung đột phòng/giờ.
  - `GET /api/public/giaovien/buoihoc/{idBh}/details`: chi tiết buổi học (thông tin buổi, danh sách nhận xét học sinh, bài tập gắn buổi, đánh giá lớp).
  - `GET /api/public/giaovien/lophoc/{idLh}/danhgia`: trả danh sách nhận xét lớp phục vụ modal “Danh sách học sinh”.

- **PortalTeacherServiceImpl**
  - Tách logic build lịch dạy: gom `BuoiHocChiTiet`, join `DanhGiaBuoiHoc`, `DanhGiaLopHoc`, phát hiện overlap theo `ID_Phong`, `GioBatDau/GioKetThuc`.
  - Tạo DTO `TeacherScheduleResponseDTO`, `TeacherSessionDetailDTO`, `TeacherClassEvaluationDTO`.

- **BaiTapService**
  - Thêm `getBaiTapByBuoiHoc` để hiển thị bài tập theo từng buổi.

---

## 6. Frontend teacher portal

File chính: `portal/teacher/index_teacher.html`.

| Section | Data flow |
| --- | --- |
| Dashboard | `TeacherAPI` gọi `/public/giaovien/{idNv}/lophoc`, `/baitap`, `/diemso`. |
| Lịch dạy hôm nay | `loadScheduleSection()` → `getTeacherSchedule` (hiển thị thời gian, số HS, điểm TB buổi, badge “Xung đột”). |
| Modal “Chi tiết lớp” | Lấy học sinh, buổi học, bài tập, nhận xét lớp qua API tương ứng. |
| Modal “Chi tiết buổi” | `viewSessionDetails(idBh)` → API chi tiết buổi, render nhận xét & homework thực tế. |

Frontend dùng Fetch API + token Bearer (JWT lưu ở LocalStorage). Khi gặp 401 tự redirect về trang login.

---

## 7. Thiết lập & chạy

### Yêu cầu
- JDK 17+
- Maven 3.6+
- Python 3 (hoặc dev server khác) để phục vụ frontend
- SQL Server (nếu muốn dùng H2 dev mode thì sửa properties)

### Cấu hình database
`mathbridge-backend/src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=MathBridge;encrypt=false
spring.datasource.username=sa
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=none
server.port=8080
```
(Có thể đổi sang `jdbc:h2:mem:testdb` nếu muốn chạy nhanh.)

### Chạy backend
```bash
cd mathbridge-backend
mvn spring-boot:run        # dev mode
# hoặc build trước:
mvn clean package -DskipTests
java -jar target/mathbridge-backend-0.0.1-SNAPSHOT.jar
```

### Chạy frontend
```bash
cd mathbridge-frontend
python -m http.server 8000
# mở http://localhost:8000/portal/LoginPortal.html
```

---

## 8. API tiêu biểu

| Endpoint | Method | Ghi chú |
| --- | --- | --- |
| `/api/auth/signin` | POST | Đăng nhập, trả JWT. |
| `/api/public/nhanvien/{idNv}/lophoc` | GET | Lớp học của giáo viên. |
| `/api/public/giaovien/{idNv}/schedule` | GET | Lịch dạy (query optional `date`, `days`). |
| `/api/public/giaovien/buoihoc/{idBh}/details` | GET | Chi tiết buổi (nhận xét, bài tập). |
| `/api/public/giaovien/lophoc/{idLh}/danhgia` | GET | Nhận xét lớp. |
| `/api/public/giaovien/lophoc/{idLh}/buoihoc` | GET | Danh sách buổi của lớp. |
| `/api/public/giaovien/lophoc/{idLh}/baitap` | GET | Bài tập của lớp. |
| `/api/public/giaovien/baitap` | POST/PUT/DELETE | CRUD bài tập. |

> Tất cả endpoint (trừ `auth/*`) yêu cầu header `Authorization: Bearer <token>`.

---

## 9. Testing / build nhanh

- `mvn -q test -DskipTests` — xác minh compile.
- SQL: dùng SSMS để xem bảng `BuoiHocChiTiet`, `DanhGiaBuoiHoc` khi test logic lịch dạy.
- Frontend: mở DevTools → tab Network/Console để theo dõi lỗi fetch.

---

## 10. Troubleshooting

| Vấn đề | Giải pháp |
| --- | --- |
| Maven báo *“Could not find project in reactor”* | Chạy lệnh trong thư mục `mathbridge-backend`. |
| 401 Unauthorized | Token hết hạn → đăng nhập lại. |
| Lịch dạy trống | Kiểm tra `ID_NV` khớp user login + dữ liệu `BuoiHocChiTiet`/`NgayHoc`. |
| Không hiện badge “Xung đột” | Chỉ hiện khi cùng `ID_Phong` và thời gian chồng lấn (so sánh `GioBatDau`, `GioKetThuc`). |
| Frontend trắng | Chắc chắn đã host qua HTTP server, không mở file trực tiếp; xem console để biết lỗi JS/CORS. |

---

## 11. Lộ trình phát triển gợi ý

1. WebSocket/SignalR để cập nhật trạng thái buổi học realtime.
2. Upload tài liệu vào bài tập (`uploads/` đã có sẵn).
3. Đồng bộ module Tin nhắn với backend thay cho mock data.
4. Viết integration test cho `PortalTeacherService`.
5. Chuẩn hóa CI (GitHub Actions: build backend + lint frontend).

---

## 12. Đóng góp

1. Fork repo → tạo branch: `feature/...`.
2. Commit theo convention (`feat:`, `fix:`…).
3. Mở PR kèm mô tả & screenshot (nếu thay đổi UI).

Chúc bạn học tốt và khai thác MathBridge để xây dựng sản phẩm giáo dục của riêng mình! 🚀

