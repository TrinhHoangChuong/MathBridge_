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
@Table(name = "BinhLuanBaiNop")
public class BinhLuanBaiNop {

    @Id
    @Column(name = "ID_BL", length = 10, nullable = false)
    private String idBl;

    @Column(name = "ID_BN", length = 10, nullable = false)
    private String idBn;

    @Column(name = "ID_TK_Gui", length = 10, nullable = false)
    private String idTkGui;

    @Column(name = "NoiDung", length = 1000, nullable = false)
    private String noiDung;

    @Column(name = "ThoiDiemTao", nullable = false)
    private LocalDateTime thoiDiemTao;

    @Column(name = "DaDoc")
    private Boolean daDoc;

    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_BN", insertable = false, updatable = false)
    private BaiNop baiNop;

    @ManyToOne
    @JoinColumn(name = "ID_TK_Gui", insertable = false, updatable = false)
    private TaiKhoan taiKhoanGui;
}
