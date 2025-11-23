package com.mathbridge.dto.PortalAdmin.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
    private List<LessonEvaluation> lessonEvaluations;
    private List<ClassEvaluation> classEvaluations;
    private List<ClassResult> classResults;

    // --------- CHO FILTER COMBOBOX ----------
    private List<SessionOption> sessionOptions;
    private List<AssignmentOption> assignmentOptions;

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
        private int tongSoBaiTap;
        private int soBaiDaNop;
        private int soBaiChuaNop;
        private BigDecimal diemTrungBinh;
        private String xepLoai;
    }

    // ====================== TAB BÀI TẬP ======================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentSummary {
        private String idBt;
        private String tieuDe;
        private String moTa;
        private String loaiBt;
        private String idBh;
        private String tenBuoiHoc;
        private LocalDateTime ngayHoc;
        private String idLh;
        private String tenLop;
        private String idCt;
        private String tenCt;
        private LocalDateTime ngayBatDau;
        private LocalDateTime ngayKetThuc;
        private int soHsTrongLop;
        private int soLuongNop;
        private BigDecimal diemTrungBinh;
    }

    // ====================== TAB BÀI NỘP & CHẤM ĐIỂM ======================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmissionSummary {
        private String idBn;
        private String idBt;
        private String tieuDeBt;
        private String idHs;
        private String tenHs;
        private String fileUrl;
        private BigDecimal diemSo;
        private String nhanXet;
        private String trangThai;
        private String ghiChu;
        private LocalDateTime thoiGianNop; // Thêm field này
    }

    // ====================== TAB ĐÁNH GIÁ & KẾT QUẢ ======================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonEvaluation {
        private String idDgbh;
        private String idBh;
        private String tenBuoiHoc;
        private LocalDateTime ngayHoc;
        private String idHs;
        private String tenHs;
        private int diemDanhGia;
        private String nhanXet;
        private LocalDateTime thoiDiemDanhGia;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassEvaluation {
        private String idDglh;
        private String idLh;
        private String tenLop; // Thêm tên lớp
        private String idHs;
        private String tenHs;
        private int diemDanhGia;
        private String nhanXet;
        private LocalDateTime thoiDiemDanhGia;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassResult {
        private String idHs;
        private String tenHs;
        private String idLh; // Thêm ID lớp
        private String tenLop; // Thêm tên lớp
        private BigDecimal diemKetQua;
        private String xepLoai;
    }

    // ====================== CHO FILTER COMBOBOX ======================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionOption {
        private String idBh;
        private String tenBuoiHoc;
        private LocalDateTime ngayHoc;
        private String idLh;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentOption {
        private String idBt;
        private String tieuDe;
        private String idLh;
    }
}