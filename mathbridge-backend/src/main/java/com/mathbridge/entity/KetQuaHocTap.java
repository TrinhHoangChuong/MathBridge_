package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "KetQuaHocTap")
public class KetQuaHocTap {

    @Id
    @Column(name = "ID_KQ", length = 10, nullable = false)
    private String idKq;

    @Column(name = "ID_HS", length = 10, nullable = false)
    private String idHs;

    @Column(name = "DiemSo", precision = 18, scale = 0, nullable = false)
    private BigDecimal diemSo;

    @Column(name = "XepLoai", length = 10, nullable = false)
    private String xepLoai;
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_HS", insertable = false, updatable = false)
    private HocSinh hocSinh;
}
