package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Association_25")
public class Association_25 {
    @EmbeddedId
    private Association25Id id;

    @ManyToOne
    @MapsId("idTd")
    @JoinColumn(name = "ID_TD", nullable = false)
    private TinTuyenDung tinTuyenDung;

    @ManyToOne
    @MapsId("idUv")
    @JoinColumn(name = "ID_UV", nullable = false)
    private UngVien ungVien;
}
