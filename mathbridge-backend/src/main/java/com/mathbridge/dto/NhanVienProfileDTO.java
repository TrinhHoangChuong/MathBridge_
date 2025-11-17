package com.mathbridge.dto;

public class NhanVienProfileDTO {

    private String idNv;
    private String idTk;
    private String ho;
    private String tenDem;
    private String ten;
    private String fullName;
    private String email;
    private String sdt;
    private String chuyenMon;
    private Integer kinhNghiem;
    private Boolean gioiTinh;
    private String chucVu;
    private String coSoId;
    private String coSoTen;

    public NhanVienProfileDTO() {
    }

    public NhanVienProfileDTO(String idNv,
                              String idTk,
                              String ho,
                              String tenDem,
                              String ten,
                              String fullName,
                              String email,
                              String sdt,
                              String chuyenMon,
                              Integer kinhNghiem,
                              Boolean gioiTinh,
                              String chucVu,
                              String coSoId,
                              String coSoTen) {
        this.idNv = idNv;
        this.idTk = idTk;
        this.ho = ho;
        this.tenDem = tenDem;
        this.ten = ten;
        this.fullName = fullName;
        this.email = email;
        this.sdt = sdt;
        this.chuyenMon = chuyenMon;
        this.kinhNghiem = kinhNghiem;
        this.gioiTinh = gioiTinh;
        this.chucVu = chucVu;
        this.coSoId = coSoId;
        this.coSoTen = coSoTen;
    }

    public String getIdNv() {
        return idNv;
    }

    public void setIdNv(String idNv) {
        this.idNv = idNv;
    }

    public String getIdTk() {
        return idTk;
    }

    public void setIdTk(String idTk) {
        this.idTk = idTk;
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSdt() {
        return sdt;
    }

    public void setSdt(String sdt) {
        this.sdt = sdt;
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

    public Boolean getGioiTinh() {
        return gioiTinh;
    }

    public void setGioiTinh(Boolean gioiTinh) {
        this.gioiTinh = gioiTinh;
    }

    public String getChucVu() {
        return chucVu;
    }

    public void setChucVu(String chucVu) {
        this.chucVu = chucVu;
    }

    public String getCoSoId() {
        return coSoId;
    }

    public void setCoSoId(String coSoId) {
        this.coSoId = coSoId;
    }

    public String getCoSoTen() {
        return coSoTen;
    }

    public void setCoSoTen(String coSoTen) {
        this.coSoTen = coSoTen;
    }
}

