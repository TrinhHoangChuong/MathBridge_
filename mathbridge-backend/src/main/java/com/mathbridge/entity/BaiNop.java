package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "BaiNop")
public class BaiNop {

    @Id
    @Column(name = "ID_BN", length = 10, nullable = false)
    private String idBn;

    @Column(name = "ID_BT", length = 10)
    private String idBt;

    @Column(name = "ID_HS", length = 10)
    private String idHs;

    @Column(name = "FileURL", length = 400)
    private String fileUrl;

    @Column(name = "DiemSo", precision = 18, scale = 0)
    private BigDecimal diemSo;

    @Column(name = "NhanXet", length = 255)
    private String nhanXet;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_BT", insertable = false, updatable = false)
    private BaiTap baiTap;

    @ManyToOne
    @JoinColumn(name = "ID_HS", insertable = false, updatable = false)
    private HocSinh hocSinh;

    @OneToMany(mappedBy = "baiNop")
    private Set<BinhLuanBaiNop> binhLuanBaiNops = new HashSet<>();
}
