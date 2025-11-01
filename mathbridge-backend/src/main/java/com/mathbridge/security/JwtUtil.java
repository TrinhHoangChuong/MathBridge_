package com.mathbridge.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    @Value("${mathbridge.security.jwt-secret}")
    private String jwtSecret;

    // ms -> ví dụ 86400000 = 1 ngày
    @Value("${mathbridge.security.jwt-expiration-ms}")
    private long jwtExpirationMs;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    //Tạo token cơ bản: chỉ có subject = email + roles
    public String generateToken(String email, List<String> roles) {
        return generateToken(email, null, roles);
    }

    // token đầy đủ: subject = email, thêm claim uid (ID_TK), thêm roles

    public String generateToken(String email, String userId, List<String> roles) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        var builder = Jwts.builder()
                .subject(email)
                .issuer("mathbridge")   // để biết token do hệ thống mình ký
                .issuedAt(now)
                .expiration(expiry)
                .claim("roles", roles); // ["R001","R002"]

        if (userId != null) {
            builder.claim("uid", userId); // ánh xạ với TaiKhoan.ID_TK
        }

        return builder
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    public long getExpirationMs() {
        return jwtExpirationMs;
    }
}
