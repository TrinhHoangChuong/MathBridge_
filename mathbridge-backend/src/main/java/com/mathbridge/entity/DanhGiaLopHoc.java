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
@Table(
        name = "DanhGiaLopHoc",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UQ_DGLH_HS_LH",
                        columnNames = {"ID_HS", "ID_LH"}
                )
        }
)
public class DanhGiaLopHoc {

    @Id
    @Column(name = "ID_DGLH", length = 10, nullable = false)
    private String idDglh;

    @Column(name = "ID_HS", length = 10, nullable = false)
    private String idHs;

    @Column(name = "ID_LH", length = 10, nullable = false)
    private String idLh;

    @Column(name = "DiemDanhGia", nullable = false)
    private Integer diemDanhGia; // tinyint

    @Column(name = "NhanXet", length = 400)
    private String nhanXet;

    @Column(name = "ThoiDiemDanhGia", nullable = false)
    private LocalDateTime thoiDiemDanhGia;

    // QUAN HỆ

    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "ID_HS", referencedColumnName = "ID_HS", insertable = false, updatable = false),
            @JoinColumn(name = "ID_LH", referencedColumnName = "ID_LH", insertable = false, updatable = false)
    })
    private DangKyLH dangKyLh;

    @ManyToOne
    @JoinColumn(name = "ID_HS", insertable = false, updatable = false)
    private HocSinh hocSinh;

    @ManyToOne
    @JoinColumn(name = "ID_LH", insertable = false, updatable = false)
    private LopHoc lopHoc;
}
