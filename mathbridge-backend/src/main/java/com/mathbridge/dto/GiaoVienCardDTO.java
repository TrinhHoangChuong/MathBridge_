package com.mathbridge.dto;

public class GiaoVienCardDTO {

    private String idNv;
    private String ho;
    private String tenDem;
    private String ten;
    private String chuyenMon;
    private Integer kinhNghiem;

    public GiaoVienCardDTO() {
    }

    public GiaoVienCardDTO(String idNv,
                           String ho,
                           String tenDem,
                           String ten,
                           String chuyenMon,
                           Integer kinhNghiem) {
        this.idNv = idNv;
        this.ho = ho;
        this.tenDem = tenDem;
        this.ten = ten;
        this.chuyenMon = chuyenMon;
        this.kinhNghiem = kinhNghiem;
    }

    public String getIdNv() {
        return idNv;
    }

    public void setIdNv(String idNv) {
        this.idNv = idNv;
    }

    public String getHo() {
        return ho;
    }

    public void setHo(String ho) {
        this.ho = ho;
    }

    public String getTenDem() {
        return tenDem;
    }

    public void setTenDem(String tenDem) {
        this.tenDem = tenDem;
    }

    public String getTen() {
        return ten;
    }

    public void setTen(String ten) {
        this.ten = ten;
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
