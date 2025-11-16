package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "CoVan_HocSinh")
public class CoVan_HocSinh {

    @EmbeddedId
    private CoVanHocSinhId id;

    @ManyToOne
    @MapsId("idNv")
    @JoinColumn(name = "ID_NV", nullable = false)
    private NhanVien nhanVien;

    @ManyToOne
    @MapsId("idHs")
    @JoinColumn(name = "ID_HS", nullable = false)
    private HocSinh hocSinh;

    @Column(name = "NgayKetThuc")
    private LocalDateTime ngayKetThuc;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;
}
