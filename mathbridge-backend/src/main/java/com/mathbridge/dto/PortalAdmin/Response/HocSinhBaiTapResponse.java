package com.mathbridge.dto.PortalAdmin.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Dùng trả về cho tất cả API của HocSinhBaiTapController.
 * Tuỳ API mà chỉ dùng một số field.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HocSinhBaiTapResponse {

    private boolean success;
    private String message;

    // --------- LIST HỌC SINH ----------
    private List<StudentSummary> students;
    private Long totalStudents;

    // --------- CHI TIẾT 1 HỌC SINH ----------
    private StudentDetail studentDetail;
    private List<StudentClass> studentClasses;
    private StudentSummaryStats studentStats;

    // --------- TAB BÀI TẬP ----------
    private List<AssignmentSummary> assignments;

    // --------- TAB BÀI NỘP & CHẤM ĐIỂM ----------
    private List<SubmissionSummary> submissions;

    // --------- TAB ĐÁNH GIÁ & KẾT QUẢ ----------
    /** Đánh giá buổi học */
    private List<LessonEvaluation> lessonEvaluations;

    /** Đánh giá lớp học */
    private List<ClassEvaluation> classEvaluations;

    /** Kết quả & xếp loại theo lớp (lọc theo HS thuộc lớp) */
    private List<ClassResult> classResults;

    // ====================== INNER DTOs ======================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSummary {
        private String idHs;
        private String fullName;
        private String email;
        private String sdt;
        private boolean trangThaiHoatDong;
        private int soLopDangHoc;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentDetail {
        private String idHs;
        private String idTk;
        private String ho;
        private String tenDem;
        private String ten;
        private String email;
        private String sdt;
        private Boolean gioiTinh;
        private String diaChi;
        private LocalDate ngaySinh;
        private Boolean trangThaiHoatDong;
        private LocalDateTime thoiGianTao;
        private LocalDateTime thoiGianCapNhat;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentClass {
        private String idLh;
        private String tenLop;
        private String idCt;
        private String tenCt;
        private String loaiNgay;
        private String hinhThucHoc;
        private String trangThai;
        private LocalDateTime ngayBatDau;
        private String soBuoi;
        private BigDecimal mucGiaThang;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSummaryStats {
        private int soLopDangHoc;
        private int tongSoBaiTap;   // tổng số BaiTap của các lớp HS đang học
        private int soBaiDaNop;     // số BaiNop của HS
        private int soBaiChuaNop;   // tongSoBaiTap - soBaiDaNop (>=0)
        private BigDecimal diemTrungBinh; // từ KetQuaHocTap hoặc tính TB từ BaiNop.DiemSo
        private String xepLoai;           // từ KetQuaHocTap.XepLoai (char(10))
    }

    // ====================== TAB BÀI TẬP ======================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentSummary {
        private String idBt;           // ID_BT
        private String tieuDe;
        private String moTa;
        private String loaiBt;

        private String idBh;           // ID_BH
        private String tenBuoiHoc;     // từ BuoiHocChiTiet.TenCaHoc / NoiDung
        private LocalDateTime ngayHoc; // từ BuoiHocChiTiet.NgayHoc (nếu map LocalDateTime)

        private String idLh;           // ID_LH
        private String tenLop;
        private String idCt;           // ID_CT
        private String tenCt;

        private LocalDateTime ngayBatDau; // BaiTap.NgayBatDau
        private LocalDateTime ngayKetThuc; // BaiTap.NgayKetThuc

        private int soHsTrongLop;      // số HS đã đăng ký lớp (DangKyLH)
        private int soLuongNop;        // số BaiNop thuộc bài tập này
        private BigDecimal diemTrungBinh; // TB DiemSo từ BaiNop (nếu có)
    }

    // ====================== TAB BÀI NỘP & CHẤM ĐIỂM ======================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmissionSummary {
        private String idBn;      // ID_BN
        private String idBt;      // ID_BT
        private String tieuDeBt;  // BaiTap.TieuDe

        private String idHs;      // ID_HS
        private String tenHs;     // họ tên từ HocSinh

        private String fileUrl;   // FileURL
        private BigDecimal diemSo;
        private String nhanXet;
        private String trangThai;
        private String ghiChu;
    }

    // ====================== TAB ĐÁNH GIÁ & KẾT QUẢ ======================

    /** Đánh giá từng buổi học (DanhGiaBuoiHoc + BuoiHocChiTiet + HocSinh) */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonEvaluation {
        private String idDgbh;           // ID_DGBH
        private String idBh;             // ID_BH
        private String tenBuoiHoc;
        private LocalDateTime ngayHoc;   // BuoiHocChiTiet.NgayHoc

        private String idHs;             // ID_HS
        private String tenHs;

        private int diemDanhGia;         // DiemDanhGia (tinyint)
        private String nhanXet;          // NhanXet
        private LocalDateTime thoiDiemDanhGia;
    }

    /** Đánh giá lớp học (DanhGiaLopHoc + HocSinh) */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassEvaluation {
        private String idDglh;           // ID_DGLH
        private String idLh;             // ID_LH

        private String idHs;
        private String tenHs;

        private int diemDanhGia;         // DiemDanhGia
        private String nhanXet;
        private LocalDateTime thoiDiemDanhGia;
    }

    /** Kết quả tổng kết theo HS trong lớp (KetQuaHocTap + HocSinh + DangKyLH) */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassResult {
        private String idHs;
        private String tenHs;
        private BigDecimal diemKetQua;   // KetQuaHocTap.DiemSo
        private String xepLoai;          // KetQuaHocTap.XepLoai
    }
}
