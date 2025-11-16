package com.mathbridge.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class CoVanHocSinhId implements Serializable {

    @Column(name = "ID_NV", length = 10, nullable = false)
    private String idNv;

    @Column(name = "ID_HS", length = 10, nullable = false)
    private String idHs;

    @Column(name = "NgayBatDau", nullable = false)
    private LocalDateTime ngayBatDau;
}
