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

        // Tạo DTO cơ bản
        AuthenticatedAccountDTO dto = new AuthenticatedAccountDTO(
                tk.getIdTk(),
                tk.getEmail(),
                roleIds
        );

        // Nếu là học sinh (R001), lấy thông tin học sinh
        if (roleIds.contains("R001")) {
            Optional<HocSinh> hocSinhOpt = hocSinhRepository.findByEmail(email);
            if (hocSinhOpt.isPresent()) {
                HocSinh hs = hocSinhOpt.get();
                String fullName = (hs.getHo() + " " + (hs.getTenDem() != null ? hs.getTenDem() + " " : "") + hs.getTen()).trim();
                dto.setFullName(fullName);
                dto.setIdHs(hs.getIdHs());
            }
        }

        // Nếu là nhân viên, có thể lấy thông tin nhân viên tương tự
        // if (roleIds.contains("R002") || roleIds.contains("R003")) {
        //     Optional<NhanVien> nhanVienOpt = nhanVienRepository.findByEmail(email);
        //     if (nhanVienOpt.isPresent()) {
        //         NhanVien nv = nhanVienOpt.get();
        //         String fullName = (nv.getHo() + " " + (nv.getTenDem() != null ? nv.getTenDem() + " " : "") + nv.getTen()).trim();
        //         dto.setFullName(fullName);
        //         dto.setIdNv(nv.getIdNv());
        //     }
        // }

        return dto;
    }
}
