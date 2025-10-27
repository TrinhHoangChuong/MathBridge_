package com.mathbridge.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class TaiKhoanVaiTroId implements Serializable {

    @Column(name = "ID_TK", length = 10, nullable = false)
    private String idTk;

    @Column(name = "ID_Role", length = 10, nullable = false)
    private String idRole;

    public TaiKhoanVaiTroId() {
    }

    public TaiKhoanVaiTroId(String idTk, String idRole) {
        this.idTk = idTk;
        this.idRole = idRole;
    }

    public String getIdTk() {
        return idTk;
    }

    public void setIdTk(String idTk) {
        this.idTk = idTk;
    }

    public String getIdRole() {
        return idRole;
    }

    public void setIdRole(String idRole) {
        this.idRole = idRole;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TaiKhoanVaiTroId)) return false;
        TaiKhoanVaiTroId that = (TaiKhoanVaiTroId) o;
        return Objects.equals(idTk, that.idTk) &&
                Objects.equals(idRole, that.idRole);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idTk, idRole);
    }
}
