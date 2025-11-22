package com.mathbridge.service;

import com.mathbridge.dto.DangKyLHRequest;
import com.mathbridge.dto.DangKyLHResponse;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.DangKyLH;
import com.mathbridge.entity.DangKyLhId;
import com.mathbridge.entity.LopHoc;
import com.mathbridge.entity.Role;
import com.mathbridge.entity.TaiKhoan;
import com.mathbridge.entity.TaiKhoan_VaiTro;
import com.mathbridge.entity.TaiKhoanVaiTroId;
import com.mathbridge.repository.HocSinhRepository;
import com.mathbridge.repository.DangKyLHRepository;
import com.mathbridge.repository.LopHocRepository;
import com.mathbridge.repository.TaiKhoanRepository;
import com.mathbridge.repository.TaiKhoanVaiTroRepository;
import com.mathbridge.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.regex.Pattern;

/**
* Service xử lý logic đăng ký khóa học
*/
@Service
public class DangKyLHService {

   @Autowired
   private HocSinhRepository hocSinhRepository;

   @Autowired
   private DangKyLHRepository dangKyLHRepository;

   @Autowired
   private LopHocRepository lopHocRepository;

   @Autowired
   private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private TaiKhoanVaiTroRepository taiKhoanVaiTroRepository;

    @Autowired
    private RoleRepository roleRepository;

    private static final String STUDENT_ROLE_ID = "R001";

    // Regex kiểm tra số điện thoại Việt Nam (theo các đầu số bạn cung cấp)
    // Chỉ chấp nhận 10 chữ số, bắt đầu bằng một trong các prefix hợp lệ
    private static final Pattern VN_PHONE_PATTERN = Pattern.compile(
            "^(032|033|034|035|036|037|038|039|"
                    + "056|058|059|"
                    + "070|076|077|078|079|"
                    + "081|082|083|084|085|"
                    + "086|088|089|"
                    + "090|091|093|094|"
                    + "096|097|098|"
                    + "087)[0-9]{7}$"
    );

   /**
    * Tạo email unique, tự động thêm số nếu trùng
    * Format: <tendem>.<ten>.hs@mathbridge.vn hoặc <tendem>.<ten>.hs1@mathbridge.vn nếu trùng
    */
   private String generateUniqueEmail(String fullName) {
       String base = toEmailBase(fullName);
       String email = base + "@mathbridge.vn";
       int suffix = 0;

       while (hocSinhRepository.findByEmail(email).isPresent()) {
           suffix++;
           email = base + suffix + "@mathbridge.vn";
       }
       return email;
   }

   /**
    * Bỏ dấu tiếng Việt
    */
   private String removeVietnameseAccent(String input) {
       if (input == null || input.isEmpty()) return "";
       String norm = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD);
       String noAccent = norm.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
       return noAccent.replace('đ', 'd').replace('Đ', 'D');
   }

   /**
    * Tạo email base từ họ tên đầy đủ: <tendem>.<ten>.hs
    */
   private String toEmailBase(String fullName) {
       if (fullName == null || fullName.trim().isEmpty()) {
           return "hocsinh.hs";
       }
       String noAccent = removeVietnameseAccent(fullName).toLowerCase().trim();
       noAccent = noAccent.replaceAll("\\s+", " ");
       String[] parts = noAccent.split(" ");
       if (parts.length == 1) {
           return parts[0] + ".hs";
       }
       String lastName = parts[parts.length - 1];
       String middle = parts[parts.length - 2];
       return middle + "." + lastName + ".hs";
   }

   /**
    * Tạo hoặc lấy học sinh từ SĐT
    * Logic: Tạo TaiKhoan → Tạo HocSinh → Cập nhật TaiKhoan với ID_HS
    */
   private HocSinh createOrGetStudent(DangKyLHRequest req) {
        Optional<HocSinh> existingOpt = hocSinhRepository.findBySdt(req.getSoDienThoai());
        if (existingOpt.isPresent()) {
            HocSinh existing = existingOpt.get();
            TaiKhoan tk = existing.getTaiKhoan();
            if (tk == null && existing.getIdTk() != null) {
                tk = taiKhoanRepository.findById(existing.getIdTk()).orElse(null);
            }
            if (tk != null) {
                ensureStudentRole(tk);
            }
            return existing;
       }

       String email = generateUniqueEmail(req.getHoTen());
       String defaultPassword = generateDefaultPassword(req.getSoDienThoai());

       TaiKhoan taiKhoan = new TaiKhoan();
       String tkId = generateNextTaiKhoanId();
       taiKhoan.setIdTk(tkId);
       taiKhoan.setEmail(email);
       taiKhoan.setPassWord(defaultPassword);
       taiKhoan.setTrangThai("pending");
       taiKhoan.setThoiDiemTao(LocalDateTime.now());
       taiKhoan = taiKhoanRepository.save(taiKhoan);
        ensureStudentRole(taiKhoan);

       HocSinh hs = new HocSinh();
       String newId = generateNextStudentId();
       hs.setIdHs(newId);
       // set khóa ngoại ID_TK đúng với cấu trúc bảng HocSinh (ID_TK NOT NULL)
       hs.setIdTk(taiKhoan.getIdTk());

       String[] nameParts = parseFullName(req.getHoTen());
       hs.setHo(nameParts[0]);
       hs.setTenDem(nameParts.length > 2 ? nameParts[1] : "");
       hs.setTen(nameParts[nameParts.length - 1]);

       hs.setEmail(email);
       hs.setSdt(req.getSoDienThoai());
       hs.setGioiTinh(req.getGioiTinh() != null && req.getGioiTinh() == 1);
       hs.setDiaChi(req.getDiaChi());
       hs.setThoiGianTao(LocalDateTime.now());
       hs.setThoiGianCapNhat(LocalDateTime.now());
       hs.setTrangThaiHoatDong(true);

       hs = hocSinhRepository.save(hs);

       taiKhoan.setIdHs(newId);
       taiKhoanRepository.save(taiKhoan);

       return hs;
   }

    /**
     * Gán vai trò học sinh mặc định (R001) cho tài khoản nếu chưa có
     */
    private void ensureStudentRole(TaiKhoan taiKhoan) {
        if (taiKhoan == null || taiKhoan.getIdTk() == null) {
            return;
        }
        TaiKhoanVaiTroId mappingId = new TaiKhoanVaiTroId(taiKhoan.getIdTk(), STUDENT_ROLE_ID);
        if (taiKhoanVaiTroRepository.existsById(mappingId)) {
            return;
        }
        Role studentRole = roleRepository.findById(STUDENT_ROLE_ID)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò học sinh (R001) trong hệ thống"));
        TaiKhoan_VaiTro mapping = new TaiKhoan_VaiTro();
        mapping.setId(mappingId);
        mapping.setTaiKhoan(taiKhoan);
        mapping.setRole(studentRole);
        taiKhoanVaiTroRepository.save(mapping);
    }

   /**
    * Tạo password mặc định: "HS" + 4 số cuối SĐT
    */
   private String generateDefaultPassword(String soDienThoai) {
       if (soDienThoai == null || soDienThoai.length() < 4) {
           return "HS1234";
       }
       String last4 = soDienThoai.substring(soDienThoai.length() - 4);
       return "HS" + last4;
   }

   private String generateNextTaiKhoanId() {
       long count = taiKhoanRepository.count();
       return "TK" + String.format("%03d", count + 1);
   }

   private String generateNextStudentId() {
       long count = hocSinhRepository.count();
       return "HS" + String.format("%03d", count + 1);
   }

   /**
    * Parse tên đầy đủ thành mảng [Họ, Tên đệm..., Tên]
    */
   private String[] parseFullName(String fullName) {
       if (fullName == null || fullName.trim().isEmpty()) {
           return new String[]{"", "", ""};
       }
       String[] parts = fullName.trim().split("\\s+");
       return parts;
   }

   /**
    * Tạo đăng ký pending
    */
   @Transactional
   public DangKyLHResponse createPendingEnrollment(DangKyLHRequest req) {
       // Validate request chung
       if (req.getHoTen() == null || req.getHoTen().trim().isEmpty()) {
           throw new RuntimeException("Họ tên không được để trống");
       }
       if (req.getSoDienThoai() == null || req.getSoDienThoai().trim().isEmpty()) {
           throw new RuntimeException("Số điện thoại không được để trống");
       }

       // Chuẩn hóa và validate số điện thoại Việt Nam
       String rawPhone = req.getSoDienThoai();
       String digitsOnly = rawPhone.replaceAll("\\D", ""); // bỏ khoảng trắng, dấu +
       if (!VN_PHONE_PATTERN.matcher(digitsOnly).matches()) {
           throw new RuntimeException("Số điện thoại không hợp lệ. Vui lòng dùng số di động Việt Nam (10 số).");
       }
       // Ghi lại dạng chuẩn vào request để các bước sau dùng
       req.setSoDienThoai(digitsOnly);

       // Tạo hoặc lấy học sinh
       HocSinh student = createOrGetStudent(req);

       String password = null;
       String email = student.getEmail();

       if (student.getTaiKhoan() != null) {
           String tkId = student.getTaiKhoan().getIdTk();
           TaiKhoan tk = taiKhoanRepository.findById(tkId).orElse(null);
           if (tk != null) {
               password = tk.getPassWord();
               email = tk.getEmail();
           }
       }

       if (password == null || password.isEmpty()) {
           password = generateDefaultPassword(req.getSoDienThoai());
       }

       if (email == null || email.isEmpty()) {
           email = student.getEmail();
       }

       // Nếu không có courseId (đăng ký tài khoản chung từ trang login/register)
       if (req.getCourseId() == null || req.getCourseId().trim().isEmpty()) {
           // Không tạo bản ghi DangKyLH, chỉ trả về thông tin tài khoản
           return new DangKyLHResponse(null, student.getIdHs(), email, password);
       }

       // Có courseId -> thực hiện đăng ký lớp học
       LopHoc lopHoc = lopHocRepository.findById(req.getCourseId())
           .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại với mã: " + req.getCourseId()));

       // Kiểm tra trạng thái lớp học có cho phép đăng ký không
       String trangThai = lopHoc.getTrangThai();
       if (trangThai != null && !trangThai.equals("Đang mở") && !trangThai.equals("Dự Kiến")) {
           throw new RuntimeException("Lớp học này hiện không nhận đăng ký. Trạng thái: " + trangThai);
       }

       // Kiểm tra xem đã đăng ký chưa
       DangKyLhId id = new DangKyLhId(student.getIdHs(), lopHoc.getIdLh());
       Optional<DangKyLH> existingEnrollment = dangKyLHRepository.findById(id);

       if (existingEnrollment.isPresent()) {
           // Bảng DangKyLH trong DB hiện chỉ có khóa chính (ID_HS, ID_LH) không có cột TrangThai,
           // nên chỉ cần báo đã đăng ký là đủ.
           throw new RuntimeException("Học sinh đã đăng ký lớp học này rồi.");
       }

       // Tạo đăng ký mới
       DangKyLH enrollment = new DangKyLH();
       enrollment.setId(id);
       enrollment.setHocSinh(student);
       enrollment.setLopHoc(lopHoc);

       dangKyLHRepository.save(enrollment);

       // Tạo registrationId string từ composite key
       String registrationId = student.getIdHs() + "-" + lopHoc.getIdLh();

       return new DangKyLHResponse(registrationId, student.getIdHs(), email, password);
   }
}
