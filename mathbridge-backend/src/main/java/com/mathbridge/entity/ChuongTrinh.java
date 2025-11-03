package com.mathbridge.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ChuongTrinh")
public class ChuongTrinh {

    @Id
    @Column(name = "ID_CT", length = 10, nullable = false)
    private String idCt;

    @Column(name = "TenCT", length = 100, nullable = false)
    private String tenCt;

    @Column(name = "MoTa", length = 200)
    private String moTa;

    // 1 ChuongTrinh -> n LopHoc
    @OneToMany(mappedBy = "chuongTrinh", fetch = FetchType.LAZY)
    private List<LopHoc> lopHocs = new ArrayList<>();

    // Liên kết nhiều-nhiều với CoSo thông qua CSDaoTaoCT
    @OneToMany(mappedBy = "chuongTrinh", fetch = FetchType.LAZY)
    private List<CSDaoTaoCT> csDaoTaoCTs = new ArrayList<>();

    public ChuongTrinh() {
    }

    public ChuongTrinh(String idCt) {
        this.idCt = idCt;
    }

    public String getIdCt() {
        return idCt;
    }

    public void setIdCt(String idCt) {
        this.idCt = idCt;
    }

    public String getTenCt() {
        return tenCt;
    }

    public void setTenCt(String tenCt) {
        this.tenCt = tenCt;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public List<LopHoc> getLopHocs() {
        return lopHocs;
    }

    public void setLopHocs(List<LopHoc> lopHocs) {
        this.lopHocs = lopHocs;
    }

    public List<CSDaoTaoCT> getCsDaoTaoCTs() {
        return csDaoTaoCTs;
    }

    public void setCsDaoTaoCTs(List<CSDaoTaoCT> csDaoTaoCTs) {
        this.csDaoTaoCTs = csDaoTaoCTs;
    }
}
