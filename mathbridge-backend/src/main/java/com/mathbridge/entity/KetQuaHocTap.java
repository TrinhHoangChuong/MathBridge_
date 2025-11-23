package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

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
    private String diemSo; // Format: "1,2,3" where 1=15p, 2=45p, 3=HK

    @Column(name = "XepLoai", length = 10, nullable = false)
    private String xepLoai;
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_HS", insertable = false, updatable = false)
    private HocSinh hocSinh;
}
