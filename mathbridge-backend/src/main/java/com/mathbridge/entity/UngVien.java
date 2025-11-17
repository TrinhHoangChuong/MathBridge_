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
@Table(name = "UngVien")
public class UngVien {

    @Id
    @Column(name = "ID_UV", length = 10, nullable = false)
    private String idUv;

    @Column(name = "HoTen", length = 100, nullable = false)
    private String hoTen;

    @Column(name = "Email", length = 100, nullable = false)
    private String email;

    @Column(name = "SDT", length = 100, nullable = false)
    private String sdt;

    @Column(name = "CV_URL", length = 255, nullable = false)
    private String cvUrl;

    @Column(name = "TrangThaiHoSo", length = 100)
    private String trangThaiHoSo;

    @Column(name = "LinkProfile", length = 255)
    private String linkProfile;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;
    // QUAN HỆ

    @OneToMany(mappedBy = "ungVien")
    private Set<Association_25> associations = new HashSet<>();
}
