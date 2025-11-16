package com.mathbridge.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Embeddable
public class CoVanHocSinhId implements Serializable {

    @Column(name = "ID_NV", length = 10, nullable = false)
    private String idNv;

    @Column(name = "ID_HS", length = 10, nullable = false)
    private String idHs;

    @Column(name = "NgayBatDau", nullable = false)
    private LocalDateTime ngayBatDau;

    public CoVanHocSinhId() {
    }

    public CoVanHocSinhId(String idNv, String idHs, LocalDateTime ngayBatDau) {
        this.idNv = idNv;
        this.idHs = idHs;
        this.ngayBatDau = ngayBatDau;
    }

    public String getIdNv() {
        return idNv;
    }

    public void setIdNv(String idNv) {
        this.idNv = idNv;
    }

    public String getIdHs() {
        return idHs;
    }

    public void setIdHs(String idHs) {
        this.idHs = idHs;
    }

    public LocalDateTime getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDateTime ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CoVanHocSinhId)) return false;
        CoVanHocSinhId that = (CoVanHocSinhId) o;
        return Objects.equals(idNv, that.idNv) &&
                Objects.equals(idHs, that.idHs) &&
                Objects.equals(ngayBatDau, that.ngayBatDau);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idNv, idHs, ngayBatDau);
    }
}

