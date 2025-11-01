// file: src/main/java/com/mathbridge/dto/AuthenticatedAccountDTO.java
package com.mathbridge.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AuthenticatedAccountDTO {

    private String idTk;
    private String email;
    private List<String> roles;  //  ["R001", "R002"]

    private String fullName;     // "Nguyen Bao An"
    private String idHs;         // nếu là học sinh
    private String idNv;         // nếu là nhân viên

    public AuthenticatedAccountDTO() {
    }

    public AuthenticatedAccountDTO(String idTk, String email, List<String> roles) {
        this.idTk = idTk;
        this.email = email;
        this.roles = roles;
    }

    public AuthenticatedAccountDTO(String idTk,
                                   String email,
                                   List<String> roles,
                                   String fullName,
                                   String idHs,
                                   String idNv) {
        this.idTk = idTk;
        this.email = email;
        this.roles = roles;
        this.fullName = fullName;
        this.idHs = idHs;
        this.idNv = idNv;
    }

}
