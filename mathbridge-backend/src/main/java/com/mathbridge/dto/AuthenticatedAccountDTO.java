// file: src/main/java/com/mathbridge/dto/AuthenticatedAccountDTO.java
package com.mathbridge.dto;

import java.util.List;

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

    // Getters and Setters
    public String getIdTk() {
        return idTk;
    }

    public void setIdTk(String idTk) {
        this.idTk = idTk;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getIdHs() {
        return idHs;
    }

    public void setIdHs(String idHs) {
        this.idHs = idHs;
    }

    public String getIdNv() {
        return idNv;
    }

    public void setIdNv(String idNv) {
        this.idNv = idNv;
    }
}
