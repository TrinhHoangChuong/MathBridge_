package com.mathbridge.dto.PortalStudentDTO;

public class StudentRegistrationDTO {
    private String id;
    private String className;
    private String teacherName;
    private String registrationDate;
    private String status;
    private String description;
    private Integer rating; // Đánh giá lớp học (1-5 sao)
    private String ratingComment; // Nhận xét đánh giá lớp học
    
    // Thông tin từ LopHoc
    private String classId; // ID_LH
    private String loaiNgay; // Loại ngày học
    private String soBuoi; // Số buổi
    private String hinhThucHoc; // Hình thức học
    private String mucGiaThang; // Mức giá tháng
    private String trangThaiLop; // Trạng thái lớp học
    
    // Thông tin từ HoaDon
    private String invoiceId; // ID_HoaDon
    private String ngayDangKy; // Ngày đăng ký hóa đơn
    private String ngayThanhToan; // Ngày thanh toán
    private String hanThanhToan; // Hạn thanh toán
    private String soThang; // Số tháng
    private String tongTien; // Tổng tiền
    private String trangThaiHoaDon; // Trạng thái hóa đơn

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public String getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(String registrationDate) { this.registrationDate = registrationDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getRatingComment() { return ratingComment; }
    public void setRatingComment(String ratingComment) { this.ratingComment = ratingComment; }

    // Getters and Setters for LopHoc info
    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }

    public String getLoaiNgay() { return loaiNgay; }
    public void setLoaiNgay(String loaiNgay) { this.loaiNgay = loaiNgay; }

    public String getSoBuoi() { return soBuoi; }
    public void setSoBuoi(String soBuoi) { this.soBuoi = soBuoi; }

    public String getHinhThucHoc() { return hinhThucHoc; }
    public void setHinhThucHoc(String hinhThucHoc) { this.hinhThucHoc = hinhThucHoc; }

    public String getMucGiaThang() { return mucGiaThang; }
    public void setMucGiaThang(String mucGiaThang) { this.mucGiaThang = mucGiaThang; }

    public String getTrangThaiLop() { return trangThaiLop; }
    public void setTrangThaiLop(String trangThaiLop) { this.trangThaiLop = trangThaiLop; }

    // Getters and Setters for HoaDon info
    public String getInvoiceId() { return invoiceId; }
    public void setInvoiceId(String invoiceId) { this.invoiceId = invoiceId; }

    public String getNgayDangKy() { return ngayDangKy; }
    public void setNgayDangKy(String ngayDangKy) { this.ngayDangKy = ngayDangKy; }

    public String getNgayThanhToan() { return ngayThanhToan; }
    public void setNgayThanhToan(String ngayThanhToan) { this.ngayThanhToan = ngayThanhToan; }

    public String getHanThanhToan() { return hanThanhToan; }
    public void setHanThanhToan(String hanThanhToan) { this.hanThanhToan = hanThanhToan; }

    public String getSoThang() { return soThang; }
    public void setSoThang(String soThang) { this.soThang = soThang; }

    public String getTongTien() { return tongTien; }
    public void setTongTien(String tongTien) { this.tongTien = tongTien; }

    public String getTrangThaiHoaDon() { return trangThaiHoaDon; }
    public void setTrangThaiHoaDon(String trangThaiHoaDon) { this.trangThaiHoaDon = trangThaiHoaDon; }
}