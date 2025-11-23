package com.mathbridge.dto.portaltutor;

public class TuUpdateSupportStatusRequestDTO {
    private String trangThai;
    private String ghiChu; // Optional note when updating status

    public TuUpdateSupportStatusRequestDTO() {
    }

    public TuUpdateSupportStatusRequestDTO(String trangThai) {
        this.trangThai = trangThai;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
}

