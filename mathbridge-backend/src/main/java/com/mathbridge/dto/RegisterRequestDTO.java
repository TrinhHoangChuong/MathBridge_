package com.mathbridge.dto;

public class RegisterRequestDTO {
    private String email;
    private String password;

    private String ho;
    private String tenDem;   // cho phép null
    private String ten;
    private String sdt;
    private Boolean gioiTinh; // false=Nam, true=Nữ
    private String diaChi;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getHo() { return ho; }
    public void setHo(String ho) { this.ho = ho; }
    public String getTenDem() { return tenDem; }
    public void setTenDem(String tenDem) { this.tenDem = tenDem; }
    public String getTen() { return ten; }
    public void setTen(String ten) { this.ten = ten; }
    public String getSdt() { return sdt; }
    public void setSdt(String sdt) { this.sdt = sdt; }
    public Boolean getGioiTinh() { return gioiTinh; }
    public void setGioiTinh(Boolean gioiTinh) { this.gioiTinh = gioiTinh; }
    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }
}
