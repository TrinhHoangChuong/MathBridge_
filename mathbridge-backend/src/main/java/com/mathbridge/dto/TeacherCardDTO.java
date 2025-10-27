package com.mathbridge.dto;

public class TeacherCardDTO {

    private String ID_NV;
    private String Ho;
    private String TenDem;
    private String Ten;
    private String Email;
    private Boolean GioiTinh;
    private String SDT;

    private String ChuyenMon;
    private Integer KinhNghiem;
    private String ChucVu;
    private Boolean TrangThaiHoatDong;

    private String AvatarUrl;

    public String getID_NV() {
        return ID_NV;
    }

    public void setID_NV(String ID_NV) {
        this.ID_NV = ID_NV;
    }

    public String getHo() {
        return Ho;
    }

    public void setHo(String ho) {
        Ho = ho;
    }

    public String getTenDem() {
        return TenDem;
    }

    public void setTenDem(String tenDem) {
        TenDem = tenDem;
    }

    public String getTen() {
        return Ten;
    }

    public void setTen(String ten) {
        Ten = ten;
    }

    public String getEmail() {
        return Email;
    }

    public void setEmail(String email) {
        Email = email;
    }

    public Boolean getGioiTinh() {
        return GioiTinh;
    }

    public void setGioiTinh(Boolean gioiTinh) {
        GioiTinh = gioiTinh;
    }

    public String getSDT() {
        return SDT;
    }

    public void setSDT(String SDT) {
        this.SDT = SDT;
    }

    public String getChuyenMon() {
        return ChuyenMon;
    }

    public void setChuyenMon(String chuyenMon) {
        ChuyenMon = chuyenMon;
    }

    public Integer getKinhNghiem() {
        return KinhNghiem;
    }

    public void setKinhNghiem(Integer kinhNghiem) {
        KinhNghiem = kinhNghiem;
    }

    public String getChucVu() {
        return ChucVu;
    }

    public void setChucVu(String chucVu) {
        ChucVu = chucVu;
    }

    public Boolean getTrangThaiHoatDong() {
        return TrangThaiHoatDong;
    }

    public void setTrangThaiHoatDong(Boolean trangThaiHoatDong) {
        TrangThaiHoatDong = trangThaiHoatDong;
    }

    public String getAvatarUrl() {
        return AvatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        AvatarUrl = avatarUrl;
    }
}
