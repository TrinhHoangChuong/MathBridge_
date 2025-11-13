
package com.mathbridge.dto.PortalAdmin.Request;

import jakarta.validation.constraints.*;

public class CourseRequest {
    @NotBlank private String idCt;   // cho POST; với PUT lấy từ path
    @NotBlank private String tenCt;
    private String moTa;

    public String getIdCt() {
        return idCt;
    }

    public void setIdCt(String idCt) {
        this.idCt = idCt;
    }

    public String getTenCt() {
        return tenCt;
    }

    public void setTenCt(String tenCt) {
        this.tenCt = tenCt;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }
}

