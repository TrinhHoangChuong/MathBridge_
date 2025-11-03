package com.mathbridge.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Role")
public class Role {

    @Id
    @Column(name = "ID_Role", length = 10, nullable = false)
    private String idRole;

    @Column(name = "TenVaiTro", length = 100, nullable = false)
    private String tenVaiTro;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    // Quan hệ với TaiKhoan qua TaiKhoan_VaiTro
    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    private List<TaiKhoanVaiTro> taiKhoanVaiTros = new ArrayList<>();

    public Role() {
    }

    public Role(String idRole) {
        this.idRole = idRole;
    }

    public String getIdRole() {
        return idRole;
    }

    public void setIdRole(String idRole) {
        this.idRole = idRole;
    }

    public String getTenVaiTro() {
        return tenVaiTro;
    }

    public void setTenVaiTro(String tenVaiTro) {
        this.tenVaiTro = tenVaiTro;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public List<TaiKhoanVaiTro> getTaiKhoanVaiTros() {
        return taiKhoanVaiTros;
    }

    public void setTaiKhoanVaiTros(List<TaiKhoanVaiTro> taiKhoanVaiTros) {
        this.taiKhoanVaiTros = taiKhoanVaiTros;
    }
}
