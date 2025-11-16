package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "YeuCauHoTro")
public class YeuCauHoTro {

    @Id
    @Column(name = "ID_YC", length = 10, nullable = false)
    private String idYc;

    // FK -> LopHoc(ID_LH), nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LH", referencedColumnName = "ID_LH")
    private LopHoc lopHoc;

    // FK -> HocSinh(ID_HS), nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_HS", referencedColumnName = "ID_HS")
    private HocSinh hocSinh;

    @Column(name = "TieuDe", length = 100, nullable = false)
    private String tieuDe;

    @Column(name = "NoiDung", length = 200, nullable = false)
    private String noiDung;

    @Column(name = "FileURL", length = 400)
    private String fileUrl;

    @Column(name = "LoaiYeuCau", length = 100)
    private String loaiYeuCau;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    @Column(name = "ThoiDiemTao")
    private LocalDateTime thoiDiemTao;

    @Column(name = "ThoiDiemDong")
    private LocalDateTime thoiDiemDong;

    public YeuCauHoTro() {
    }

    public YeuCauHoTro(String idYc) {
        this.idYc = idYc;
    }

    public String getIdYc() {
        return idYc;
    }

    public void setIdYc(String idYc) {
        this.idYc = idYc;
    }

    public LopHoc getLopHoc() {
        return lopHoc;
    }

    public void setLopHoc(LopHoc lopHoc) {
        this.lopHoc = lopHoc;
    }

    public HocSinh getHocSinh() {
        return hocSinh;
    }

    public void setHocSinh(HocSinh hocSinh) {
        this.hocSinh = hocSinh;
    }

    public String getTieuDe() {
        return tieuDe;
    }

    public void setTieuDe(String tieuDe) {
        this.tieuDe = tieuDe;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getLoaiYeuCau() {
        return loaiYeuCau;
    }

    public void setLoaiYeuCau(String loaiYeuCau) {
        this.loaiYeuCau = loaiYeuCau;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public LocalDateTime getThoiDiemTao() {
        return thoiDiemTao;
    }

    public void setThoiDiemTao(LocalDateTime thoiDiemTao) {
        this.thoiDiemTao = thoiDiemTao;
    }

    public LocalDateTime getThoiDiemDong() {
        return thoiDiemDong;
    }

    public void setThoiDiemDong(LocalDateTime thoiDiemDong) {
        this.thoiDiemDong = thoiDiemDong;
    }
}
