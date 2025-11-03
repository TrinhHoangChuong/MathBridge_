package com.mathbridge.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "UngVien")
public class UngVien {

    @Id
    @Column(name = "ID_UV", length = 10, nullable = false)
    private String idUv;

    @Column(name = "HoTen", length = 100, nullable = false)
    private String hoTen;

    @Column(name = "Email", length = 100, nullable = false)
    private String email;

    @Column(name = "SDT", length = 100, nullable = false)
    private String sdt;

    @Column(name = "CV_URL", length = 255, nullable = false)
    private String cvUrl;

    @Column(name = "TrangThaiHoSo", length = 100)
    private String trangThaiHoSo;

    @Column(name = "LinkProfile", length = 255)
    private String linkProfile;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    // Liên kết tin tuyển dụng qua Association_25
    @OneToMany(mappedBy = "ungVien", fetch = FetchType.LAZY)
    private List<Association25> tinTuyenDungLinks = new ArrayList<>();

    public UngVien() {
    }

    public UngVien(String idUv) {
        this.idUv = idUv;
    }

    public String getIdUv() {
        return idUv;
    }

    public void setIdUv(String idUv) {
        this.idUv = idUv;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSdt() {
        return sdt;
    }

    public void setSdt(String sdt) {
        this.sdt = sdt;
    }

    public String getCvUrl() {
        return cvUrl;
    }

    public void setCvUrl(String cvUrl) {
        this.cvUrl = cvUrl;
    }

    public String getTrangThaiHoSo() {
        return trangThaiHoSo;
    }

    public void setTrangThaiHoSo(String trangThaiHoSo) {
        this.trangThaiHoSo = trangThaiHoSo;
    }

    public String getLinkProfile() {
        return linkProfile;
    }

    public void setLinkProfile(String linkProfile) {
        this.linkProfile = linkProfile;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public List<Association25> getTinTuyenDungLinks() {
        return tinTuyenDungLinks;
    }

    public void setTinTuyenDungLinks(List<Association25> tinTuyenDungLinks) {
        this.tinTuyenDungLinks = tinTuyenDungLinks;
    }
}
