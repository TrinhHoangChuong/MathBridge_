package com.mathbridge.service;

import com.mathbridge.dto.AuthenticatedAccountDTO;
import com.mathbridge.entity.TaiKhoan;
import com.mathbridge.entity.TaiKhoanVaiTro;
import com.mathbridge.repository.TaiKhoanRepository;
import com.mathbridge.repository.TaiKhoanVaiTroRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final TaiKhoanVaiTroRepository taiKhoanVaiTroRepository;

    public AuthService(TaiKhoanRepository taiKhoanRepository,
                       TaiKhoanVaiTroRepository taiKhoanVaiTroRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.taiKhoanVaiTroRepository = taiKhoanVaiTroRepository;
    }

    /**
     * @return AuthenticatedAccountDto nếu hợp lệ, ngược lại return null
     */
    public AuthenticatedAccountDTO authenticate(String email, String rawPassword) {
        Optional<TaiKhoan> opt = taiKhoanRepository.findByEmail(email);
        if (opt.isEmpty()) {
            return null;
        }
        TaiKhoan tk = opt.get();

        // TODO: tạm thời so sánh plaintext
        if (!tk.getPassword().equals(rawPassword)) {
            return null;
        }

        // chặn tk bị khóa nếu bạn muốn
        if (tk.getTrangThai() != null && tk.getTrangThai().equalsIgnoreCase("LOCK")) {
            return null;
        }

        // lấy roles từ bảng trung gian
        List<TaiKhoanVaiTro> list = taiKhoanVaiTroRepository.findByTaiKhoan_IdTk(tk.getIdTk());
        List<String> roleIds = list.stream()
                .map(t -> t.getRole().getIdRole())   // R001, R002, R003
                .collect(Collectors.toList());

        return new AuthenticatedAccountDTO(
                tk.getIdTk(),
                tk.getEmail(),
                roleIds
        );
    }
}
