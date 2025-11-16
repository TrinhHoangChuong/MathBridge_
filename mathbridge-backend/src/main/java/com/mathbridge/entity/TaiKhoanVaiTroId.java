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
public class TaiKhoanVaiTroId implements Serializable {

    @Column(name = "ID_TK", length = 10, nullable = false)
    private String idTk;

    @Column(name = "ID_Role", length = 10, nullable = false)
    private String idRole;
}
