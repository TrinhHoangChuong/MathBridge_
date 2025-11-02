package com.mathbridge.dto;

import java.util.Date;

/**
 * DTO cho request đăng ký khóa học (chưa đăng nhập)
 */
public class DangKyLHRequest {
    private String hoTen;
    private String soDienThoai;
    private Date ngaySinh;
    private String diaChi;
    private Integer gioiTinh; // 1=Nam, 0=Nữ
    private String courseId;
    private Integer coursePosition; // Vị trí thẻ trong danh sách (1, 2, 3, ...)

    public DangKyLHRequest() {}

    public String getHoTen() { return hoTen; }
    public void setHoTen(String hoTen) { this.hoTen = hoTen; }

    public String getSoDienThoai() { return soDienThoai; }
    public void setSoDienThoai(String soDienThoai) { this.soDienThoai = soDienThoai; }

    public Date getNgaySinh() { return ngaySinh; }
    public void setNgaySinh(Date ngaySinh) { this.ngaySinh = ngaySinh; }

    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }

    public Integer getGioiTinh() { return gioiTinh; }
    public void setGioiTinh(Integer gioiTinh) { this.gioiTinh = gioiTinh; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public Integer getCoursePosition() { return coursePosition; }
    public void setCoursePosition(Integer coursePosition) { this.coursePosition = coursePosition; }
}

