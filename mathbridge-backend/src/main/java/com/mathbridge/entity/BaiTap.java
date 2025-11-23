package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "BaiTap")
public class BaiTap {

    @Id
    @Column(name = "ID_BT", length = 10, nullable = false)
    private String idBt;

    @Column(name = "ID_BH", length = 10)
    private String idBh;

    @Column(name = "TieuDe", length = 100, nullable = false)
    private String tieuDe;

    @Column(name = "MoTa", length = 200)
    private String moTa;

    @Column(name = "LoaiBT", length = 100)
    private String loaiBt;

    @Column(name = "ChoPhepLamLai")
    private Boolean choPhepLamLai;

    @Column(name = "HocSinhDuocPhep", length = 1000)
    private String hocSinhDuocPhep; // JSON array of student IDs: ["HS001", "HS002"]

    @Column(name = "NgayBatDau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "NgayKetThuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    @Lob
    @Column(name = "NoiDungJSON")
    private String noiDungJson;

    @Column(name = "CanhBao", length = 500)
    private String canhBao;

    @Column(name = "ThoiLuongPhut")
    private Integer thoiLuongPhut;

    // Removed: TuDongNop and CheDoChamDiem - these fields exist in BaiNop table
    // @Column(name = "TuDongNop")
    // private Boolean tuDongNop;
    // @Column(name = "CheDoChamDiem", length = 50)
    // private String cheDoChamDiem;

    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_BH", insertable = false, updatable = false)
    private BuoiHocChiTiet buoiHocChiTiet;

    // Removed: @OneToOne relationship with BaiTapNoiDung - data now in BaiTap table
    // @OneToOne(mappedBy = "baiTap", cascade = CascadeType.ALL, orphanRemoval = true)
    // private BaiTapNoiDung noiDungChiTiet;

    @OneToMany(mappedBy = "baiTap")
    private Set<BaiNop> baiNops = new HashSet<>();
}
