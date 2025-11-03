package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "TaiKhoan")
public class TaiKhoan {

    @Id
    @Column(name = "ID_TK", length = 10, nullable = false)
    private String idTk;

    // Hai cột dưới này là FK trong DB (ID_HS -> HocSinh, ID_NV -> NhanVien),
    // nhưng để tránh vòng lặp phức tạp, tạm thời map chúng như String.
    @Column(name = "ID_HS", length = 10)
    private String idHsRef;

    @Column(name = "ID_NV", length = 10)
    private String idNvRef;

    @Column(name = "Email", length = 100, nullable = false)
    private String email;

    @Column(name = "PassWord", length = 255, nullable = false)
    private String password;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    @Column(name = "ThoiDiemTao")
    private LocalDateTime thoiDiemTao;

    // 1 TaiKhoan -> n HocSinh (theo FK HocSinh.ID_TK)
    @OneToMany(mappedBy = "taiKhoan", fetch = FetchType.LAZY)
    private List<HocSinh> hocSinhs = new ArrayList<>();

    // 1 TaiKhoan -> n NhanVien (theo FK NhanVien.ID_TK)
    @OneToMany(mappedBy = "taiKhoan", fetch = FetchType.LAZY)
    private List<NhanVien> nhanViens = new ArrayList<>();

    // 1 TaiKhoan -> n TaiKhoanVaiTro
    @OneToMany(mappedBy = "taiKhoan", fetch = FetchType.LAZY)
    private List<TaiKhoanVaiTro> taiKhoanVaiTros = new ArrayList<>();

    public TaiKhoan() {
    }

    public TaiKhoan(String idTk) {
        this.idTk = idTk;
    }

    public String getIdTk() {
        return idTk;
    }

    public void setIdTk(String idTk) {
        this.idTk = idTk;
    }

    public String getIdHsRef() {
        return idHsRef;
    }

    public void setIdHsRef(String idHsRef) {
        this.idHsRef = idHsRef;
    }

    public String getIdNvRef() {
        return idNvRef;
    }

    public void setIdNvRef(String idNvRef) {
        this.idNvRef = idNvRef;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public LocalDateTime getThoiDiemTao() {
        return thoiDiemTao;
    }

    public void setThoiDiemTao(LocalDateTime thoiDiemTao) {
        this.thoiDiemTao = thoiDiemTao;
    }

    public List<HocSinh> getHocSinhs() {
        return hocSinhs;
    }

    public void setHocSinhs(List<HocSinh> hocSinhs) {
        this.hocSinhs = hocSinhs;
    }

    public List<NhanVien> getNhanViens() {
        return nhanViens;
    }

    public void setNhanViens(List<NhanVien> nhanViens) {
        this.nhanViens = nhanViens;
    }

    public List<TaiKhoanVaiTro> getTaiKhoanVaiTros() {
        return taiKhoanVaiTros;
    }

    public void setTaiKhoanVaiTros(List<TaiKhoanVaiTro> taiKhoanVaiTros) {
        this.taiKhoanVaiTros = taiKhoanVaiTros;
    }
}
