package com.mathbridge.service;

import com.mathbridge.dto.AuthenticatedAccountDTO;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.NhanVien;
import com.mathbridge.entity.TaiKhoan;
import com.mathbridge.entity.TaiKhoanVaiTro;
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
    private final NhanVienRepository nhanVienRepository;
    private final HocSinhRepository hocSinhRepository;

    public AuthService(TaiKhoanRepository taiKhoanRepository,
                       TaiKhoanVaiTroRepository taiKhoanVaiTroRepository,
                       NhanVienRepository nhanVienRepository,
                       HocSinhRepository hocSinhRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.taiKhoanVaiTroRepository = taiKhoanVaiTroRepository;
        this.nhanVienRepository = nhanVienRepository;
        this.hocSinhRepository = hocSinhRepository;
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

        String fullName = null;
        String idHs = null;
        String idNv = null;

        Optional<NhanVien> nhanVienOpt = nhanVienRepository.findFirstByTaiKhoan_IdTk(tk.getIdTk());
        if (nhanVienOpt.isPresent()) {
            NhanVien nv = nhanVienOpt.get();
            fullName = buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen());
            idNv = nv.getIdNv();
        } else {
            Optional<HocSinh> hocSinhOpt = hocSinhRepository.findFirstByTaiKhoan_IdTk(tk.getIdTk());
            if (hocSinhOpt.isPresent()) {
                HocSinh hs = hocSinhOpt.get();
                fullName = buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen());
                idHs = hs.getIdHs();
            }
        }

        if (fullName == null || fullName.isBlank()) {
            fullName = tk.getEmail();
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
        StringBuilder builder = new StringBuilder();
        if (ho != null && !ho.isBlank()) {
            builder.append(ho.trim());
        }
        if (tenDem != null && !tenDem.isBlank()) {
            if (builder.length() > 0) {
                builder.append(' ');
            }
            builder.append(tenDem.trim());
        }
        if (ten != null && !ten.isBlank()) {
            if (builder.length() > 0) {
                builder.append(' ');
            }
            builder.append(ten.trim());
        }
        String result = builder.toString().trim();
        return result.isBlank() ? null : result;
    }
}
