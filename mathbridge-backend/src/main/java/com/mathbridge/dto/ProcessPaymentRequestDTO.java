package com.mathbridge.dto;

public class ProcessPaymentRequestDTO {
    private String idHoaDon;
    private String idPt;
    private String ghiChu;

    // Getters and Setters
    public String getIdHoaDon() {
        return idHoaDon;
    }

    public void setIdHoaDon(String idHoaDon) {
        this.idHoaDon = idHoaDon;
    }

    public String getIdPt() {
        return idPt;
    }

    public void setIdPt(String idPt) {
        this.idPt = idPt;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
}

