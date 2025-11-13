// com/mathbridge/dto/admin/LopHocRequest.java
package com.mathbridge.dto.PortalAdmin.Request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LopHocRequest {
    @NotBlank @Size(max=10)  private String idLh;
    @NotBlank @Size(max=10)  private String idNv;
    @NotBlank @Size(max=10)  private String idCt;
    @NotBlank @Size(max=100) private String tenLop;
    @NotBlank @Size(max=100) private String loaiNgay;
    @NotBlank @Size(max=100) private String soBuoi;
    @NotBlank @Size(max=100) private String hinhThucHoc;
    @NotNull                 private LocalDateTime ngayBatDau;
    @NotNull                 private BigDecimal mucGiaThang;
    @Size(max=200)           private String danhGia;
    @Size(max=60)            private String trangThai;
    @Size(max=200)           private String moTa;
    // getters/setters (rút gọn)
    public String getIdLh(){return idLh;} public void setIdLh(String v){idLh=v;}
    public String getIdNv(){return idNv;} public void setIdNv(String v){idNv=v;}
    public String getIdCt(){return idCt;} public void setIdCt(String v){idCt=v;}
    public String getTenLop(){return tenLop;} public void setTenLop(String v){tenLop=v;}
    public String getLoaiNgay(){return loaiNgay;} public void setLoaiNgay(String v){loaiNgay=v;}
    public String getSoBuoi(){return soBuoi;} public void setSoBuoi(String v){soBuoi=v;}
    public String getHinhThucHoc(){return hinhThucHoc;} public void setHinhThucHoc(String v){hinhThucHoc=v;}
    public LocalDateTime getNgayBatDau(){return ngayBatDau;} public void setNgayBatDau(LocalDateTime v){ngayBatDau=v;}
    public BigDecimal getMucGiaThang(){return mucGiaThang;} public void setMucGiaThang(BigDecimal v){mucGiaThang=v;}
    public String getDanhGia(){return danhGia;} public void setDanhGia(String v){danhGia=v;}
    public String getTrangThai(){return trangThai;} public void setTrangThai(String v){trangThai=v;}
    public String getMoTa(){return moTa;} public void setMoTa(String v){moTa=v;}
}
