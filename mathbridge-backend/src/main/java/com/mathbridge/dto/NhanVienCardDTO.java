package com.mathbridge.dto;

public class NhanVienCardDTO {
    private String idNv;
    private String hoTen;
    private String chuyenMon;
    private Integer kinhNghiem;

    public NhanVienCardDTO(String idNv,
                           String hoTen,
                           String chuyenMon,
                           Integer kinhNghiem) {
        this.idNv = idNv;
        this.hoTen = hoTen;
        this.chuyenMon = chuyenMon;
        this.kinhNghiem = kinhNghiem;
    }

    public String getIdNv() {
        return idNv;
    }

    public void setIdNv(String idNv) {
        this.idNv = idNv;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public String getChuyenMon() {
        return chuyenMon;
    }

    public void setChuyenMon(String chuyenMon) {
        this.chuyenMon = chuyenMon;
    }

    public Integer getKinhNghiem() {
        return kinhNghiem;
    }

    public void setKinhNghiem(Integer kinhNghiem) {
        this.kinhNghiem = kinhNghiem;
    }
}
