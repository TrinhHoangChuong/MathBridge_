package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "TaiKhoan_VaiTro")
public class TaiKhoan_VaiTro {
    @EmbeddedId
    private TaiKhoanVaiTroId id;

    @ManyToOne
    @MapsId("idTk")
    @JoinColumn(name = "ID_TK", nullable = false)
    private TaiKhoan taiKhoan;

    @ManyToOne
    @MapsId("idRole")
    @JoinColumn(name = "ID_Role", nullable = false)
    private Role role;
}
