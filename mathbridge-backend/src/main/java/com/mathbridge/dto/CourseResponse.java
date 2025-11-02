package com.mathbridge.dto;

import java.math.BigDecimal;
import java.util.Date;

public class CourseResponse {
    private String idLH;
    private String idNV;
    private String idCT;
    private String tenLop;
    private String loaiNgay;
    private String soBuoi;
    private String hinhThucHoc;
    private Date ngayBatDau;
    private Date ngayKetThucDangKy;
    private BigDecimal mucGiaThang;
    private String danhGia;
    private String trangThai;
    private String moTa;
    private String teacherName;

    public CourseResponse() {}

    public String getIdLH() { return idLH; }
    public void setIdLH(String idLH) { this.idLH = idLH; }

    public String getIdNV() { return idNV; }
    public void setIdNV(String idNV) { this.idNV = idNV; }

    public String getIdCT() { return idCT; }
    public void setIdCT(String idCT) { this.idCT = idCT; }

    public String getTenLop() { return tenLop; }
    public void setTenLop(String tenLop) { this.tenLop = tenLop; }

    public String getLoaiNgay() { return loaiNgay; }
    public void setLoaiNgay(String loaiNgay) { this.loaiNgay = loaiNgay; }

    public String getSoBuoi() { return soBuoi; }
    public void setSoBuoi(String soBuoi) { this.soBuoi = soBuoi; }

    public String getHinhThucHoc() { return hinhThucHoc; }
    public void setHinhThucHoc(String hinhThucHoc) { this.hinhThucHoc = hinhThucHoc; }

    public Date getNgayBatDau() { return ngayBatDau; }
    public void setNgayBatDau(Date ngayBatDau) { this.ngayBatDau = ngayBatDau; }

    public Date getNgayKetThucDangKy() { return ngayKetThucDangKy; }
    public void setNgayKetThucDangKy(Date ngayKetThucDangKy) { this.ngayKetThucDangKy = ngayKetThucDangKy; }

    public BigDecimal getMucGiaThang() { return mucGiaThang; }
    public void setMucGiaThang(BigDecimal mucGiaThang) { this.mucGiaThang = mucGiaThang; }

    public String getDanhGia() { return danhGia; }
    public void setDanhGia(String danhGia) { this.danhGia = danhGia; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
}
