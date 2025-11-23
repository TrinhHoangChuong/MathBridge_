package com.mathbridge.dto.PortalAdmin.Request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class HocSinhBaiTapRequest {

    // --------- FILTER LIST HỌC SINH ----------
    private String searchKeyword;
    private String programId;
    private String classId;
    private String status;
    private Integer page;
    private Integer size;

    // --------- TẠO / CẬP NHẬT HỌC SINH ----------
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

    // --------- THÊM HỌC SINH VÀO LỚP ----------
    private String classIdToAdd;

    // --------- FILTER BÀI TẬP / BÀI NỘP / ĐÁNH GIÁ ----------
    private LocalDate fromDate;
    private LocalDate toDate;
    private String assignmentId;
    private String sessionId;
    private String studentId; // Thêm cho filter bài nộp theo HS

    // --------- CHẤM ĐIỂM BÀI NỘP ----------
    private BigDecimal diemSo; // Điểm số chấm
    private String nhanXet;    // Nhận xét khi chấm
}