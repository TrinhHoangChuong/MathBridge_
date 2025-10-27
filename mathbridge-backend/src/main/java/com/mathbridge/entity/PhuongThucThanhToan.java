package com.mathbridge.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PhuongThucThanhToan")
public class PhuongThucThanhToan {

    @Id
    @Column(name = "ID_PT", length = 10, nullable = false)
    private String idPt;

    @Column(name = "TenPT", length = 100, nullable = false)
    private String tenPt;

    @Column(name = "HinhThucTT", length = 100, nullable = false)
    private String hinhThucTt;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    // 1 PhuongThucThanhToan -> n LichSuThanhToan
    @OneToMany(mappedBy = "phuongThucThanhToan", fetch = FetchType.LAZY)
    private List<LichSuThanhToan> lichSuThanhToans = new ArrayList<>();

    public PhuongThucThanhToan() {
    }

    public PhuongThucThanhToan(String idPt) {
        this.idPt = idPt;
    }

    public String getIdPt() {
        return idPt;
    }

    public void setIdPt(String idPt) {
        this.idPt = idPt;
    }

    public String getTenPt() {
        return tenPt;
    }

    public void setTenPt(String tenPt) {
        this.tenPt = tenPt;
    }

    public String getHinhThucTt() {
        return hinhThucTt;
    }

    public void setHinhThucTt(String hinhThucTt) {
        this.hinhThucTt = hinhThucTt;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public List<LichSuThanhToan> getLichSuThanhToans() {
        return lichSuThanhToans;
    }

    public void setLichSuThanhToans(List<LichSuThanhToan> lichSuThanhToans) {
        this.lichSuThanhToans = lichSuThanhToans;
    }
}
