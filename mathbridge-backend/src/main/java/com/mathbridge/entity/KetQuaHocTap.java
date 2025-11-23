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

    @Column(name = "DiemSo", length = 50)
    private String diemSo; // Format: "8.5,8,9" where 1st=15p, 2nd=45p, 3rd=HK

    @Column(name = "DiemTB", precision = 5, scale = 2)
    private BigDecimal diemTB; // Điểm trung bình được tính từ 3 cột điểm

    @Column(name = "XepLoai", length = 10, nullable = false)
    private String xepLoai;
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_HS", insertable = false, updatable = false)
    private HocSinh hocSinh;
}
