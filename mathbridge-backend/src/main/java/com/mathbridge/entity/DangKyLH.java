package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "DangKyLH")
public class DangKyLH {

    @EmbeddedId
    private DangKyLhId id;

    @ManyToOne
    @MapsId("idHs")
    @JoinColumn(name = "ID_HS", nullable = false)
    private HocSinh hocSinh;

    @ManyToOne
    @MapsId("idLh")
    @JoinColumn(name = "ID_LH", nullable = false)
    private LopHoc lopHoc;
}
