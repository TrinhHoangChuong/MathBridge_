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
@Table(name = "ChuongTrinh")
public class ChuongTrinh {

    @Id
    @Column(name = "ID_CT", length = 10, nullable = false)
    private String idCt;

    @Column(name = "TenCT", length = 100, nullable = false)
    private String tenCt;

    @Column(name = "MoTa", length = 200)
    private String moTa;

    // QUAN HỆ

    @OneToMany(mappedBy = "chuongTrinh")
    private Set<CS_DaoTao_CT> csDaoTaoCts = new HashSet<>();

    @OneToMany(mappedBy = "chuongTrinh")
    private Set<LopHoc> lopHocs = new HashSet<>();
}
