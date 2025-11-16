package com.mathbridge.dto.PortalAdmin.Response;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class ProgramAdminResponse {
    private String idCT;
    private String tenCT;
    private String moTa;

    public String getIdCT() {
        return idCT;
    }

    public void setIdCT(String idCT) {
        this.idCT = idCT;
    }

    public String getTenCT() {
        return tenCT;
    }

    public void setTenCT(String tenCT) {
        this.tenCT = tenCT;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }
}
