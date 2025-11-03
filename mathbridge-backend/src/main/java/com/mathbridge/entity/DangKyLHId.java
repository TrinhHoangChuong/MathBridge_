package com.mathbridge.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class DangKyLHId implements Serializable {

    @Column(name = "ID_HS", length = 10, nullable = false)
    private String idHs;

    @Column(name = "ID_LH", length = 10, nullable = false)
    private String idLh;

    public DangKyLHId() {
    }

    public DangKyLHId(String idHs, String idLh) {
        this.idHs = idHs;
        this.idLh = idLh;
    }

    public String getIdHs() {
        return idHs;
    }

    public void setIdHs(String idHs) {
        this.idHs = idHs;
    }

    public String getIdLh() {
        return idLh;
    }

    public void setIdLh(String idLh) {
        this.idLh = idLh;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DangKyLHId)) return false;
        DangKyLHId that = (DangKyLHId) o;
        return Objects.equals(idHs, that.idHs) &&
                Objects.equals(idLh, that.idLh);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idHs, idLh);
    }
}
