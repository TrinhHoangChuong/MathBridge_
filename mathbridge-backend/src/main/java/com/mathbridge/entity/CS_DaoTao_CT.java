package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "CS_DaoTao_CT")
public class CS_DaoTao_CT {
    @EmbeddedId
    private CSDaoTaoCtId id;

    @ManyToOne
    @MapsId("idCs")
    @JoinColumn(name = "ID_CS", nullable = false)
    private CoSo coSo;

    @ManyToOne
    @MapsId("idCt")
    @JoinColumn(name = "ID_CT", nullable = false)
    private ChuongTrinh chuongTrinh;
}
