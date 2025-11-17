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
public class Association25Id implements Serializable {

    @Column(name = "ID_TD", length = 10, nullable = false)
    private String idTd;

    @Column(name = "ID_UV", length = 10, nullable = false)
    private String idUv;
}
