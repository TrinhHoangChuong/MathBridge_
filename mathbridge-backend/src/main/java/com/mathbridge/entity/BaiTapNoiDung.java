package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "BaiTapNoiDung")
public class BaiTapNoiDung {

    @Id
    @Column(name = "ID_BT", length = 10, nullable = false)
    private String idBt;

    @OneToOne
    @MapsId
    @JoinColumn(name = "ID_BT")
    private BaiTap baiTap;

    @Lob
    @Column(name = "NoiDungJSON")
    private String noiDungJson;

    @Column(name = "ThoiLuongPhut")
    private Integer thoiLuongPhut;

    @Column(name = "CanhBao", length = 500)
    private String canhBao;

    @Column(name = "TuDongNop")
    private Boolean tuDongNop;

    @Column(name = "CheDoChamDiem", length = 50)
    private String cheDoChamDiem;
}

