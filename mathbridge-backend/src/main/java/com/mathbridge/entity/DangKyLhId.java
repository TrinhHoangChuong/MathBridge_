package com.mathbridge.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class DangKyLhId implements Serializable {

    @Column(name = "ID_HS", length = 10, nullable = false)
    private String idHs;

    @Column(name = "ID_LH", length = 10, nullable = false)
    private String idLh;
}
