package com.mathbridge.dto.PortalAdmin.Request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgramAdminCreateRequest {
    private String idCT;   // ID_CT
    private String tenCT;  // TenCT
    private String moTa;   // MoTa
}
