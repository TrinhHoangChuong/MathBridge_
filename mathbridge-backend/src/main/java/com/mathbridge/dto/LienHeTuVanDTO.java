package com.mathbridge.dto;

import java.time.LocalDateTime;

public class LienHeTuVanDTO {
    private String hoTen;
    private String email;
    private String sdt;
    private String tieuDe;
    private String noiDung;
    private String hinhThucTuVan;

    public LienHeTuVanDTO() {}

    public String getHoTen() { return hoTen; }
    public void setHoTen(String hoTen) { this.hoTen = hoTen; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSdt() { return sdt; }
    public void setSdt(String sdt) { this.sdt = sdt; }

    public String getTieuDe() { return tieuDe; }
    public void setTieuDe(String tieuDe) { this.tieuDe = tieuDe; }

    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }

    public String getHinhThucTuVan() { return hinhThucTuVan; }
    public void setHinhThucTuVan(String hinhThucTuVan) { this.hinhThucTuVan = hinhThucTuVan; }
}