package com.mathbridge.dto.PortalAdmin.Request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgramAdminUpdateRequest {
    private String tenCT;  // TenCT
    private String moTa;   // MoTa
}
