package com.mathbridge.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/**
 * Khóa composit
 *  - ID_TD (TinTuyenDung)
 *  - ID_UV (UngVien)
 */
@Embeddable
public class Association25Id implements Serializable {

    @Column(name = "ID_TD", length = 10, nullable = false)
    private String idTd;

    @Column(name = "ID_UV", length = 10, nullable = false)
    private String idUv;

    public Association25Id() {
    }

    public Association25Id(String idTd, String idUv) {
        this.idTd = idTd;
        this.idUv = idUv;
    }

    public String getIdTd() {
        return idTd;
    }

    public void setIdTd(String idTd) {
        this.idTd = idTd;
    }

    public String getIdUv() {
        return idUv;
    }

    public void setIdUv(String idUv) {
        this.idUv = idUv;
    }

    // BẮT BUỘC trong composite key: equals/hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Association25Id)) return false;
        Association25Id that = (Association25Id) o;
        return Objects.equals(idTd, that.idTd)
                && Objects.equals(idUv, that.idUv);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idTd, idUv);
    }
}