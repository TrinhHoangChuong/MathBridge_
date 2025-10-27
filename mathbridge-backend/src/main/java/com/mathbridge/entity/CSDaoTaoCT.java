package com.mathbridge.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "CS_DaoTao_CT")
public class CSDaoTaoCT {

    @EmbeddedId
    private CSDaoTaoCTId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idCs")
    @JoinColumn(name = "ID_CS", nullable = false, referencedColumnName = "ID_CS")
    private CoSo coSo;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idCt")
    @JoinColumn(name = "ID_CT", nullable = false, referencedColumnName = "ID_CT")
    private ChuongTrinh chuongTrinh;

    public CSDaoTaoCT() {
    }

    public CSDaoTaoCT(CSDaoTaoCTId id) {
        this.id = id;
    }

    public CSDaoTaoCTId getId() {
        return id;
    }

    public void setId(CSDaoTaoCTId id) {
        this.id = id;
    }

    public CoSo getCoSo() {
        return coSo;
    }

    public void setCoSo(CoSo coSo) {
        this.coSo = coSo;
    }

    public ChuongTrinh getChuongTrinh() {
        return chuongTrinh;
    }

    public void setChuongTrinh(ChuongTrinh chuongTrinh) {
        this.chuongTrinh = chuongTrinh;
    }
}
