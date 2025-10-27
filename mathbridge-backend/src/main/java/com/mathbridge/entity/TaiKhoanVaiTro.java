package com.mathbridge.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "TaiKhoan_VaiTro")
public class TaiKhoanVaiTro {

    @EmbeddedId
    private TaiKhoanVaiTroId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idTk")
    @JoinColumn(name = "ID_TK", nullable = false, referencedColumnName = "ID_TK")
    private TaiKhoan taiKhoan;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idRole")
    @JoinColumn(name = "ID_Role", nullable = false, referencedColumnName = "ID_Role")
    private Role role;

    public TaiKhoanVaiTro() {
    }

    public TaiKhoanVaiTro(TaiKhoanVaiTroId id) {
        this.id = id;
    }

    public TaiKhoanVaiTroId getId() {
        return id;
    }

    public void setId(TaiKhoanVaiTroId id) {
        this.id = id;
    }

    public TaiKhoan getTaiKhoan() {
        return taiKhoan;
    }

    public void setTaiKhoan(TaiKhoan taiKhoan) {
        this.taiKhoan = taiKhoan;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
