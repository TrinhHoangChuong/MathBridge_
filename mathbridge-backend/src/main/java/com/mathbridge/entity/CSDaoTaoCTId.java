package com.mathbridge.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CSDaoTaoCTId implements Serializable {

    @Column(name = "ID_CS", length = 10, nullable = false)
    private String idCs;

    @Column(name = "ID_CT", length = 10, nullable = false)
    private String idCt;

    public CSDaoTaoCTId() {
    }

    public CSDaoTaoCTId(String idCs, String idCt) {
        this.idCs = idCs;
        this.idCt = idCt;
    }

    public String getIdCs() {
        return idCs;
    }

    public void setIdCs(String idCs) {
        this.idCs = idCs;
    }

    public String getIdCt() {
        return idCt;
    }

    public void setIdCt(String idCt) {
        this.idCt = idCt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CSDaoTaoCTId)) return false;
        CSDaoTaoCTId that = (CSDaoTaoCTId) o;
        return Objects.equals(idCs, that.idCs) &&
                Objects.equals(idCt, that.idCt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idCs, idCt);
    }
}
