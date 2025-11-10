package com.mathbridge.service;

import com.mathbridge.dto.DangKyLHRequest;
import com.mathbridge.dto.DangKyLHResponse;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.DangKyLH;
import com.mathbridge.entity.DangKyLHId;
import com.mathbridge.entity.LopHoc;
import com.mathbridge.entity.TaiKhoan;
import com.mathbridge.entity.TaiKhoanVaiTro;
import com.mathbridge.entity.TaiKhoanVaiTroId;
import com.mathbridge.entity.Role;
import com.mathbridge.repository.HocSinhRepository;
import com.mathbridge.repository.DangKyLHRepository;
import com.mathbridge.repository.LopHocRepository;
import com.mathbridge.repository.TaiKhoanRepository;
import com.mathbridge.repository.TaiKhoanVaiTroRepository;
import com.mathbridge.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

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
        Optional<HocSinh> existing = hocSinhRepository.findBySdt(req.getSoDienThoai());
        if (existing.isPresent()) {
            // Refresh từ DB để đảm bảo có đầy đủ thông tin (bao gồm TaiKhoan)
            HocSinh student = existing.get();
            String studentId = student.getIdHs();
            if (studentId != null) {
                // Refresh để load TaiKhoan nếu là LAZY
                return hocSinhRepository.findById(studentId).orElse(student);
            }
            return student;
        }

        String email = generateUniqueEmail(req.getHoTen());
        String defaultPassword = generateDefaultPassword(req.getSoDienThoai());
        
        TaiKhoan taiKhoan = new TaiKhoan();
        String tkId = generateNextTaiKhoanId();
        taiKhoan.setIdTk(tkId);
        taiKhoan.setEmail(email);
        taiKhoan.setPassword(defaultPassword);
        taiKhoan.setTrangThai("ACTIVE");
        taiKhoan.setThoiDiemTao(LocalDateTime.now());
        taiKhoan = taiKhoanRepository.save(taiKhoan);

        HocSinh hs = new HocSinh();
        String newId = generateNextStudentId();
        hs.setIdHs(newId);
        hs.setTaiKhoan(taiKhoan);
        
        String[] nameParts = parseFullName(req.getHoTen());
        hs.setHo(nameParts[0]);
        hs.setTenDem(nameParts.length > 2 ? nameParts[1] : "");
        hs.setTen(nameParts[nameParts.length - 1]);
        
        hs.setEmail(email);
        hs.setSdt(req.getSoDienThoai());
        hs.setGioiTinh(req.getGioiTinh() != null && req.getGioiTinh() == 1);
        hs.setDiaChi(req.getDiaChi());

        /*        if (req.getNgaySinh() != null) {
            LocalDate ns = req.getNgaySinh().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            hs.setNgaySinh(ns);
        }  */ 

        hs.setThoiGianTao(LocalDateTime.now());
        hs.setThoiGianCapNhat(LocalDateTime.now());
        hs.setTrangThaiHoatDong(true);

        hs = hocSinhRepository.save(hs);

        taiKhoan.setIdHsRef(newId);
        taiKhoanRepository.save(taiKhoan);

        // Gán role R001 vào TaiKhoan_VaiTro (giống RegistrationServiceImpl)
        Role r001 = roleRepository.findById("R001")
                .orElseGet(() -> {
                    return roleRepository.findByTenVaiTro("HOC_SINH").orElse(null);
                });

        // Nếu không tìm thấy role, throw exception thay vì tạo role không hợp lệ
        if (r001 == null) {
            throw new RuntimeException("Không tìm thấy role R001 (HOC_SINH) trong hệ thống. Vui lòng kiểm tra database.");
        }

        TaiKhoanVaiTro tkvt = new TaiKhoanVaiTro();
        tkvt.setId(new TaiKhoanVaiTroId(tkId, r001.getIdRole()));
        tkvt.setTaiKhoan(taiKhoan);
        tkvt.setRole(r001);
        taiKhoanVaiTroRepository.save(tkvt);

        // Refresh từ DB để đảm bảo có đầy đủ thông tin
        if (newId != null) {
            return hocSinhRepository.findById(newId).orElse(hs);
        }
        return hs;
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
        int maxNo = taiKhoanRepository.findMaxTkNumber();
        return "TK" + String.format("%03d", maxNo + 1);
    }

    private String generateNextStudentId() {
        int maxNo = hocSinhRepository.findMaxHsNumber();
        return "HS" + String.format("%03d", maxNo + 1);
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
        // Validate request
        if (req.getHoTen() == null || req.getHoTen().trim().isEmpty()) {
            throw new RuntimeException("Họ tên không được để trống");
        }
        if (req.getSoDienThoai() == null || req.getSoDienThoai().trim().isEmpty()) {
            throw new RuntimeException("Số điện thoại không được để trống");
        }
        
        // Tạo hoặc lấy học sinh
        HocSinh student = createOrGetStudent(req);
        
        // Nếu không có courseId, chỉ tạo tài khoản học sinh, không đăng ký lớp
        String courseId = req.getCourseId();
        if (courseId == null || courseId.trim().isEmpty()) {
            // Refresh student từ DB để đảm bảo có đầy đủ thông tin
            String studentId = student.getIdHs();
            HocSinh refreshedStudent = (studentId != null) 
                ? hocSinhRepository.findById(studentId).orElse(student) 
                : student;
            
            // Lấy email và password từ TaiKhoan (ưu tiên) hoặc từ HocSinh
            String email = null;
            String password = null;
            
            if (refreshedStudent.getTaiKhoan() != null) {
                String tkId = refreshedStudent.getTaiKhoan().getIdTk();
                if (tkId != null) {
                    TaiKhoan tk = taiKhoanRepository.findById(tkId).orElse(null);
                    if (tk != null) {
                        password = tk.getPassword();
                        email = tk.getEmail();
                    }
                }
            }
            
            // Fallback: nếu không lấy được từ TaiKhoan, lấy từ HocSinh
            if (email == null || email.isEmpty()) {
                email = refreshedStudent.getEmail();
            }
            
            if (password == null || password.isEmpty()) {
                password = generateDefaultPassword(req.getSoDienThoai());
            }
            
            String finalStudentId = refreshedStudent.getIdHs();
            return new DangKyLHResponse(null, finalStudentId != null ? finalStudentId : "", email != null ? email : "", password != null ? password : "");
        }
        
        // Có courseId - đăng ký lớp học
        // Kiểm tra và lấy thông tin lớp học
        LopHoc lopHoc = lopHocRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại với mã: " + courseId));
        
        // Kiểm tra trạng thái lớp học có cho phép đăng ký không
        String trangThai = lopHoc.getTrangThai();
        if (trangThai != null && !trangThai.equals("Đang mở") && !trangThai.equals("Dự Kiến")) {
            throw new RuntimeException("Lớp học này hiện không nhận đăng ký. Trạng thái: " + trangThai);
        }
        
        // Lấy email và password từ TaiKhoan (ưu tiên) hoặc từ HocSinh
        String password = null;
        String email = null;
        
        // Refresh student từ DB để đảm bảo có đầy đủ thông tin
        String studentId = student.getIdHs();
        HocSinh refreshedStudent = (studentId != null) 
            ? hocSinhRepository.findById(studentId).orElse(student) 
            : student;
        
        if (refreshedStudent.getTaiKhoan() != null) {
            String tkId = refreshedStudent.getTaiKhoan().getIdTk();
            if (tkId != null) {
                TaiKhoan tk = taiKhoanRepository.findById(tkId).orElse(null);
                if (tk != null) {
                    password = tk.getPassword();
                    email = tk.getEmail();
                }
            }
        }
        
        // Fallback: nếu không lấy được từ TaiKhoan, lấy từ HocSinh
        if (email == null || email.isEmpty()) {
            email = refreshedStudent.getEmail();
        }
        
        if (password == null || password.isEmpty()) {
            password = generateDefaultPassword(req.getSoDienThoai());
        }

        // Kiểm tra xem đã đăng ký chưa
        DangKyLHId id = new DangKyLHId(student.getIdHs(), lopHoc.getIdLh());
        Optional<DangKyLH> existingEnrollment = dangKyLHRepository.findById(id);
        
        if (existingEnrollment.isPresent()) {
            DangKyLH existing = existingEnrollment.get();
            String existingStatus = existing.getTrangThai();
            throw new RuntimeException("Học sinh đã đăng ký lớp học này rồi. Trạng thái đăng ký: " + 
                (existingStatus != null ? existingStatus : "pending"));
        }
        
        // Tạo đăng ký mới
        DangKyLH enrollment = new DangKyLH();
        enrollment.setId(id);
        enrollment.setHocSinh(student);
        enrollment.setLopHoc(lopHoc);
        enrollment.setTrangThai("pending");

        dangKyLHRepository.save(enrollment);

        // Tạo registrationId string từ composite key
        String registrationId = student.getIdHs() + "-" + lopHoc.getIdLh();
        
        return new DangKyLHResponse(registrationId, student.getIdHs(), email, password);
    }
}

