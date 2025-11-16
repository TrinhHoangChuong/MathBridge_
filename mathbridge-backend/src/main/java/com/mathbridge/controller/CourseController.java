package com.mathbridge.controller;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.dto.CourseResponse;
import com.mathbridge.entity.LopHoc;
import com.mathbridge.service.CourseService;
import com.mathbridge.repository.Admin.NhanVienRepository;
import com.mathbridge.entity.NhanVien;
import com.mathbridge.repository.ChuongTrinhRepository;
import com.mathbridge.entity.ChuongTrinh;
import com.mathbridge.repository.StudentRepo.DangKyLHRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller xử lý các API về Lớp học (Course)
 * Quản lý CRUD và filter lớp học theo nhiều tiêu chí
 * Map với bảng LopHoc trong SQL Server database
 */
@RestController
@RequestMapping("/api/public/course")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private ChuongTrinhRepository chuongTrinhRepository;

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private DangKyLHRepository dangKyLHRepository;

    /**
     * Convert từ Entity LopHoc sang DTO CourseResponse
     * @param lopHoc Entity LopHoc từ database
     * @return CourseResponse DTO để trả về cho client
     */
    private CourseResponse toCourseResponse(LopHoc lopHoc) {
        CourseResponse response = new CourseResponse();
        response.setIdLH(lopHoc.getIdLh());
        
        // Get ID_NV from NhanVien relationship
        if (lopHoc.getNhanVien() != null) {
            response.setIdNV(lopHoc.getNhanVien().getIdNv());
            
            // Get teacher name
            try {
                NhanVien nv = nhanVienRepository.findById(lopHoc.getNhanVien().getIdNv()).orElse(null);
                if (nv != null) {
                    String ten = (nv.getTenDem() != null && !nv.getTenDem().isEmpty()) ? (nv.getTenDem() + " " + nv.getTen()) : nv.getTen();
                    String hoTen = (nv.getHo() != null ? nv.getHo() + " " : "") + (ten != null ? ten : "");
                    response.setTeacherName(hoTen.trim());
                }
            } catch (Exception ignored) {}
        }
        
        // Get ID_CT from ChuongTrinh relationship
        if (lopHoc.getChuongTrinh() != null) {
            response.setIdCT(lopHoc.getChuongTrinh().getIdCt());
        }
        
        response.setTenLop(lopHoc.getTenLop());
        response.setLoaiNgay(lopHoc.getLoaiNgay());
        response.setSoBuoi(lopHoc.getSoBuoi());
        response.setHinhThucHoc(lopHoc.getHinhThucHoc());
        
        // Convert LocalDateTime to Date
        if (lopHoc.getNgayBatDau() != null) {
            response.setNgayBatDau(Date.from(lopHoc.getNgayBatDau().atZone(ZoneId.systemDefault()).toInstant()));
        }
        
        // LopHoc không có ngayKetThucDangKy, để null
        response.setNgayKetThucDangKy(null);
        
        response.setMucGiaThang(lopHoc.getMucGiaThang());
        response.setDanhGia(lopHoc.getDanhGia());
        response.setTrangThai(lopHoc.getTrangThai());
        response.setMoTa(lopHoc.getMoTa());
        
        return response;
    }

    /**
     * API: Lấy tất cả lớp học
     * GET /api/public/course
     * @return Danh sách tất cả lớp học trong hệ thống
     */
    @GetMapping
    public ResponseEntity<?> getAllCourses() {
        try {
            List<CourseResponse> courses = courseService.getAllCourses().stream()
                    .map(this::toCourseResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<List<CourseResponse>>(true, "Courses retrieved successfully", courses));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<List<CourseResponse>>(false, "Error retrieving courses: " + e.getMessage(), null));
        }
    }

    /**
     * API: Lấy tất cả chương trình
     * GET /api/public/course/programs
     * @return Danh sách chương trình/khoá (CT001..)
     */
    @GetMapping("/programs")
    public ResponseEntity<?> getAllPrograms() {
        try {
            return ResponseEntity.ok(new ApiResponse<List<ChuongTrinh>>(true, "Programs retrieved successfully", chuongTrinhRepository.findAll()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<List<ChuongTrinh>>(false, "Error retrieving programs: " + e.getMessage(), null));
        }
    }

    /**
     * API: Lấy lớp học theo chương trình
     * GET /api/public/course/program/{idCT}
     * @param idCT Mã chương trình (CT001=Lớp 9, CT002=Lớp 10, CT003=Lớp 11, CT004=Lớp 12, CT005=Thi chứng chỉ)
     * @return Danh sách lớp học theo chương trình
     */
    @GetMapping("/program/{idCT}")
    public ResponseEntity<?> getCoursesByProgram(@PathVariable String idCT) {
        try {
            List<CourseResponse> courses = courseService.getCoursesByProgram(idCT).stream()
                    .map(this::toCourseResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<List<CourseResponse>>(true, "Courses retrieved successfully", courses));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<List<CourseResponse>>(false, "Error retrieving courses: " + e.getMessage(), null));
        }
    }

    /**
     * API: Lấy chi tiết một lớp học theo ID
     * GET /api/public/course/{idLH}
     * @param idLH Mã lớp học (ID_LH)
     * @return Thông tin chi tiết lớp học
     */
    @GetMapping("/{idLH}")
    public ResponseEntity<?> getCourseById(@PathVariable String idLH) {
        try {
            Optional<LopHoc> course = courseService.getCourseById(idLH);
            if (course.isPresent()) {
                CourseResponse response = toCourseResponse(course.get());
                return ResponseEntity.ok(new ApiResponse<CourseResponse>(true, "Course retrieved successfully", response));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<CourseResponse>(false, "Error retrieving course: " + e.getMessage(), null));
        }
    }

    /**
     * API: Lọc lớp học theo nhiều tiêu chí
     * GET /api/public/course/filter?idCT=xxx&hinhThucHoc=xxx&trangThai=xxx
     * @param idCT Mã chương trình (optional)
     * @param hinhThucHoc Hình thức học: ONLINE, OFFLINE, GIA SƯ (optional)
     * @param trangThai Trạng thái: Đang mở, Dự Kiến (optional)
     * @return Danh sách lớp học theo filter
     */
    @GetMapping("/filter")
    public ResponseEntity<?> getCoursesByFilters(
            @RequestParam(required = false) String idCT,
            @RequestParam(required = false) String hinhThucHoc,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String loaiNgay) {
        try {
            List<CourseResponse> courses;

            if (idCT != null && hinhThucHoc != null) {
                courses = courseService.getCoursesByProgramAndMethod(idCT, hinhThucHoc).stream()
                        .map(this::toCourseResponse)
                        .collect(Collectors.toList());
            } else if (loaiNgay != null) {
                courses = courseService.getCoursesByLoaiNgay(loaiNgay).stream()
                        .map(this::toCourseResponse)
                        .collect(Collectors.toList());
            } else if (idCT != null) {
                courses = courseService.getCoursesByProgram(idCT).stream()
                        .map(this::toCourseResponse)
                        .collect(Collectors.toList());
            } else if (hinhThucHoc != null) {
                courses = courseService.getCoursesByMethod(hinhThucHoc).stream()
                        .map(this::toCourseResponse)
                        .collect(Collectors.toList());
            } else if (trangThai != null) {
                courses = courseService.getCoursesByStatus(trangThai).stream()
                        .map(this::toCourseResponse)
                        .collect(Collectors.toList());
            } else {
                courses = courseService.getAllCourses().stream()
                        .map(this::toCourseResponse)
                        .collect(Collectors.toList());
            }

            return ResponseEntity.ok(new ApiResponse<List<CourseResponse>>(true, "Courses filtered successfully", courses));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<List<CourseResponse>>(false, "Error filtering courses: " + e.getMessage(), null));
        }
    }

    /**
     * API: Lấy số lượng đăng ký của một lớp học
     * GET /api/public/course/{idLH}/enrollments/count
     * @param idLH Mã lớp học
     * @return Số lượng học sinh đã đăng ký lớp học này
     */
    @GetMapping("/{idLH}/enrollments/count")
    public ResponseEntity<?> getEnrollmentCount(@PathVariable String idLH) {
        try {
            if (!courseService.getCourseById(idLH).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            long count = dangKyLHRepository.countByLopHocId(idLH);
            return ResponseEntity.ok(new ApiResponse<Long>(true, "Enrollment count retrieved successfully", count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<Long>(false, "Error retrieving enrollment count: " + e.getMessage(), null));
        }
    }
}
