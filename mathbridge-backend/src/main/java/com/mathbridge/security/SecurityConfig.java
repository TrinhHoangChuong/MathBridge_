package com.mathbridge.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Cho phép CORS
                .cors(Customizer.withDefaults())

                // Tắt CSRF cho API public (nếu không POST form thì ok)
                .csrf(csrf -> csrf.disable())

                // Phân quyền
                .authorizeHttpRequests(auth -> auth
                        // các endpoint public cho FE gọi thoải mái
                        .requestMatchers("/api/public/**").permitAll()
                        // tạm thời cho phép hết để dễ dev
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // FE của bạn chạy ở http://localhost:63342
        // Có thể dùng setAllowedOriginPatterns để cho phép tất cả
        config.setAllowedOriginPatterns(List.of("*"));

        // Các method FE có thể gọi
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Cho phép tất cả header
        config.setAllowedHeaders(List.of("*"));

        // Mình không gửi cookie/Authorization từ FE cho endpoint public nên để false
        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Áp cho toàn bộ API
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
