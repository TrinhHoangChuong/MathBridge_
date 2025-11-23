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

    @Column(name = "DiemTrungBinh", precision = 18, scale = 0, nullable = false)
    private BigDecimal diemTrungBinh; // Điểm trung bình = (15p + 45p + thi) / 3

    @Column(name = "DiemTongKet", precision = 18, scale = 0, nullable = false)
    private BigDecimal diemTongKet; // Điểm tổng kết = 20%*15p + 30%*45p + 50%*thi

    @Column(name = "XepLoai", length = 10, nullable = false)
    private String xepLoai;
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_HS", insertable = false, updatable = false)
    private HocSinh hocSinh;
}
