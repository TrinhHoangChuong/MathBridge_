package com.mathbridge.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Association_25")
public class Association25 {

    @EmbeddedId
    private Association25Id id;

    // --- FK -> TinTuyenDung(ID_TD)
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idTd") // map field idTd trong Association25Id
    @JoinColumn(name = "ID_TD", nullable = false, referencedColumnName = "ID_TD")
    private TinTuyenDung tinTuyenDung;

    // --- FK -> UngVien(ID_UV)
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idUv") // map field idUv trong Association25Id
    @JoinColumn(name = "ID_UV", nullable = false, referencedColumnName = "ID_UV")
    private UngVien ungVien;

    public Association25() {
    }

    public Association25(Association25Id id) {
        this.id = id;
    }

    public Association25Id getId() {
        return id;
    }

    public void setId(Association25Id id) {
        this.id = id;
    }

    public TinTuyenDung getTinTuyenDung() {
        return tinTuyenDung;
    }

    public void setTinTuyenDung(TinTuyenDung tinTuyenDung) {
        this.tinTuyenDung = tinTuyenDung;
    }

    public UngVien getUngVien() {
        return ungVien;
    }

    public void setUngVien(UngVien ungVien) {
        this.ungVien = ungVien;
    }
}
