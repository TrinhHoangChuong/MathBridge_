package com.mathbridge.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "KetQuaHocTap")
public class KetQuaHocTap {

    @Id
    @Column(name = "ID_KQ", length = 10, nullable = false)
    private String idKq;

    // FK -> HocSinh(ID_HS)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_HS", nullable = false, referencedColumnName = "ID_HS")
    private HocSinh hocSinh;

    @Column(name = "DiemSo", nullable = false)
    private BigDecimal diemSo;

    @Column(name = "XepLoai", length = 10, nullable = false)
    private String xepLoai;

    public KetQuaHocTap() {
    }

    public KetQuaHocTap(String idKq) {
        this.idKq = idKq;
    }

    public String getIdKq() {
        return idKq;
    }

    public void setIdKq(String idKq) {
        this.idKq = idKq;
    }

    public HocSinh getHocSinh() {
        return hocSinh;
    }

    public void setHocSinh(HocSinh hocSinh) {
        this.hocSinh = hocSinh;
    }

    public BigDecimal getDiemSo() {
        return diemSo;
    }

    public void setDiemSo(BigDecimal diemSo) {
        this.diemSo = diemSo;
    }

    public String getXepLoai() {
        return xepLoai;
    }

    public void setXepLoai(String xepLoai) {
        this.xepLoai = xepLoai;
    }
}
