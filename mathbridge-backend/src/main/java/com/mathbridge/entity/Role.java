package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    // QUAN HỆ

    @OneToMany(mappedBy = "role")
    private Set<TaiKhoan_VaiTro> taiKhoanVaiTros = new HashSet<>();
}
