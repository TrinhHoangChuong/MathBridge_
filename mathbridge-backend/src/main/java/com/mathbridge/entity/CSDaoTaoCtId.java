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
public class CSDaoTaoCtId implements Serializable {

    @Column(name = "ID_CS", length = 10, nullable = false)
    private String idCs;

    @Column(name = "ID_CT", length = 10, nullable = false)
    private String idCt;
}
