// file: src/main/java/com/mathbridge/controller/AuthController.java
package com.mathbridge.controller;

import com.mathbridge.dto.AuthResponseDTO;
import com.mathbridge.dto.AuthenticatedAccountDTO;
import com.mathbridge.dto.LoginRequestDTO;
import com.mathbridge.security.JwtUtil;
import com.mathbridge.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        AuthenticatedAccountDTO account = authService.authenticate(request.getEmail(), request.getPassword());
        if (account == null) {
            return ResponseEntity
                    .status(401)
                    .body(
                            new AuthResponseDTO(
                                    false,
                                    null,
                                    null,
                                    0,
                                    null
                            )
                    );
        }

        String token = jwtUtil.generateToken(
                account.getEmail(),
                account.getRoles()
        );

        AuthResponseDTO response = new AuthResponseDTO(
                true,
                token,
                "Bearer",
                jwtUtil.getExpirationMs(),
                account
        );

        return ResponseEntity.ok(response);
    }
}