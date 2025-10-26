package com.mathbridge.entity;

import jakarta.persistence.*;
// import java.time.LocalDateTime; (HY) xóa
import java.time.LocalTime;

@Entity
@Table(name = "CoSo", schema = "dbo")
public class CoSo {

    @Id
    @Column(name = "ID_CS")
    private String id; // nvarchar(10) not null

    @Column(name = "TENCOSO")
    private String tenCoSo; // nvarchar(200) not null

    @Column(name = "DIACHI2")
    private String diaChi; // nvarchar(200) not null

    @Column(name = "HOTLINE")
    private String hotline; // nvarchar(100) not null

    @Column(name = "GIOMOCUA")
    private LocalTime gioMoCua;

    @Column(name = "GIODONGCUA")
    private LocalTime gioDongCua;

    @Column(name = "NGAYLAMVIEC")
    private String ngayLamViec; // nvarchar(100) not null

    public CoSo() {
    }

    // ===== GETTERS / SETTERS =====
    public String getId() {
        return id;
    }

    public void setId(String id) { this.id = id; }

    public String getTenCoSo() {
        return tenCoSo;
    }

    public void setTenCoSo(String tenCoSo) { this.tenCoSo = tenCoSo; }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }

    public String getHotline() {
        return hotline;
    }

    public void setHotline(String hotline) { this.hotline = hotline; }

    public LocalTime getGioMoCua() {
        return gioMoCua;
    }

    public void setGioMoCua(LocalTime gioMoCua) { this.gioMoCua = gioMoCua; }

    public LocalTime getGioDongCua() {
        return gioDongCua;
    }

    public void setGioDongCua(LocalTime gioDongCua) { this.gioDongCua = gioDongCua; }

    public String getNgayLamViec() {
        return ngayLamViec;
    }

    public void setNgayLamViec(String ngayLamViec) { this.ngayLamViec = ngayLamViec; }
}
