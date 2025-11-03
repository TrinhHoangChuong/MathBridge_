// file: src/main/java/com/mathbridge/controller/RegistrationController.java
package com.mathbridge.controller;

import com.mathbridge.dto.AuthResponseDTO;
import com.mathbridge.dto.AuthenticatedAccountDTO;
import com.mathbridge.dto.RegisterRequestDTO;
import com.mathbridge.security.JwtUtil;
import com.mathbridge.service.RegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/auth")
public class RegistrationController {

    private final RegistrationService registrationService;
    private final JwtUtil jwtUtil;

    public RegistrationController(RegistrationService registrationService, JwtUtil jwtUtil) {
        this.registrationService = registrationService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO request) {
        // validate tối thiểu
        if (request.getEmail() == null || request.getPassword() == null ||
                request.getHo() == null || request.getTen() == null ||
                request.getSdt() == null || request.getGioiTinh() == null ||
                request.getDiaChi() == null) {
            return ResponseEntity.badRequest().body(new AuthResponseDTO(false, null, null, 0, null));
        }

        AuthenticatedAccountDTO account = registrationService.registerStudent(request);
        if (account == null) {
            // Email/SĐT đã tồn tại hoặc validate fail
            return ResponseEntity.status(409).body(new AuthResponseDTO(false, null, null, 0, null));
        }

        String token = jwtUtil.generateToken(account.getEmail(), account.getRoles());
        return ResponseEntity.ok(new AuthResponseDTO(true, token, "Bearer", jwtUtil.getExpirationMs(), account));
    }
}
