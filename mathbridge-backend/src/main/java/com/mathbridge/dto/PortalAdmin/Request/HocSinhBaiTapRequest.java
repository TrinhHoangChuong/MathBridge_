package com.mathbridge.dto.PortalAdmin.Request;

import lombok.Data;

import java.time.LocalDate;

/**
 * Dùng chung cho:
 * - Filter danh sách học sinh
 * - Tạo / cập nhật 1 học sinh
 * - Thêm học sinh vào lớp
 * - Filter bài tập / bài nộp / đánh giá
 */
@Data
public class HocSinhBaiTapRequest {

    // --------- FILTER LIST HỌC SINH (tab Học sinh - cột trái) ----------
    /** Tên / email / mã HS / SĐT */
    private String searchKeyword;

    /** Lọc theo chương trình (ID_CT) */
    private String programId;

    /** Lọc theo lớp (ID_LH) */
    private String classId;

    /** Trạng thái: "active" / "inactive" / null */
    private String status;

    /** Phân trang đơn giản (optional) */
    private Integer page;
    private Integer size;

    // --------- TẠO / CẬP NHẬT HỌC SINH (cột phải) ----------
    /** ID_HS: dùng khi update */
    private String idHs;

    /** ID_TK: account gắn với học sinh (bảng TaiKhoan) */
    private String idTk;

    private String ho;
    private String tenDem;
    private String ten;
    private String email;
    private String sdt;
    private Boolean gioiTinh;          // true = nam, false = nữ (map từ bit)
    private String diaChi;
    private LocalDate ngaySinh;
    private Boolean trangThaiHoatDong; // map tới column TrangThaiHoatDong (bit)

    // --------- THÊM HỌC SINH VÀO LỚP ----------
    /** Mã lớp cần thêm (ID_LH) */
    private String classIdToAdd;

    // --------- FILTER BÀI TẬP / BÀI NỘP / ĐÁNH GIÁ ----------
    /** Khoảng ngày áp dụng cho NgayBatDau/NgayKetThuc (BaiTap) hoặc NgayHoc (BuoiHocChiTiet) */
    private LocalDate fromDate;
    private LocalDate toDate;

    /** Mã bài tập (ID_BT) - dùng khi filter bài nộp theo 1 bài */
    private String assignmentId;

    /** Mã buổi học (ID_BH) - nếu cần filter đánh giá buổi học theo 1 buổi */
    private String sessionId;
}
