package com.mathbridge.service;

import com.mathbridge.dto.AuthenticatedAccountDTO;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.NhanVien;
import com.mathbridge.entity.TaiKhoan;
import com.mathbridge.entity.TaiKhoan_VaiTro;
import com.mathbridge.repository.HocSinhRepository;
import com.mathbridge.repository.NhanVienRepository;
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
    private final HocSinhRepository hocSinhRepository;
    private final NhanVienRepository nhanVienRepository;

    public AuthService(TaiKhoanRepository taiKhoanRepository,
                       TaiKhoanVaiTroRepository taiKhoanVaiTroRepository,
                       HocSinhRepository hocSinhRepository,
                       NhanVienRepository nhanVienRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.taiKhoanVaiTroRepository = taiKhoanVaiTroRepository;
        this.hocSinhRepository = hocSinhRepository;
        this.nhanVienRepository = nhanVienRepository;
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
        if (!tk.getPassWord().equals(rawPassword)) {
            return null;
        }

        // chặn tk bị khóa nếu bạn muốn
        if (tk.getTrangThai() != null && tk.getTrangThai().equalsIgnoreCase("LOCK")) {
            return null;
        }

        // lấy roles từ bảng trung gian
        List<TaiKhoan_VaiTro> list = taiKhoanVaiTroRepository.findByTaiKhoan_IdTk(tk.getIdTk());
        List<String> roleIds = list.stream()
                .map(t -> t.getRole().getIdRole())   // R001, R002, R003
                .collect(Collectors.toList());

        String fullName = null;
        String idHs = null;
        String idNv = null;

        Optional<HocSinh> hsOpt = hocSinhRepository.findFirstByTaiKhoan_IdTk(tk.getIdTk());
        if (hsOpt.isPresent()) {
            HocSinh hs = hsOpt.get();
            idHs = hs.getIdHs();
            fullName = buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen());
        } else {
            Optional<NhanVien> nvOpt = nhanVienRepository.findByIdTk(tk.getIdTk());
            if (nvOpt.isPresent()) {
                NhanVien nv = nvOpt.get();
                idNv = nv.getIdNv();
                fullName = buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen());
            }
        }

        return new AuthenticatedAccountDTO(
                tk.getIdTk(),
                tk.getEmail(),
                roleIds,
                fullName,
                idHs,
                idNv
        );
    }

    private String buildFullName(String ho, String tenDem, String ten) {
        return java.util.stream.Stream.of(ho, tenDem, ten)
                .filter(part -> part != null && !part.isBlank())
                .collect(Collectors.joining(" "));
    }
}
