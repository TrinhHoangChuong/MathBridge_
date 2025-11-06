package com.mathbridge.service;

import com.mathbridge.dto.AuthenticatedAccountDTO;
import com.mathbridge.entity.TaiKhoan;
import com.mathbridge.entity.TaiKhoanVaiTro;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.NhanVien;
import com.mathbridge.repository.TaiKhoanRepository;
import com.mathbridge.repository.TaiKhoanVaiTroRepository;
import com.mathbridge.repository.HocSinhRepository;
import com.mathbridge.repository.NhanVienRepository;
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

        // Lấy thông tin đầy đủ từ HocSinh hoặc NhanVien
        String fullName = null;
        String idHs = null;
        String idNv = null;

        // Ưu tiên 1: Kiểm tra nếu là học sinh (có role R001) - tìm theo ID_TK
        if (roleIds.contains("R001")) {
            Optional<HocSinh> hocSinhOpt = hocSinhRepository.findByTaiKhoan_IdTk(tk.getIdTk());
            if (hocSinhOpt.isPresent()) {
                HocSinh hs = hocSinhOpt.get();
                idHs = hs.getIdHs();
                // Build fullName từ ho, tenDem, ten
                fullName = buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen());
                System.out.println("Found HocSinh: ID_HS=" + idHs + ", FullName=" + fullName);
            } else {
                // Fallback: thử tìm theo email
                Optional<HocSinh> hocSinhByEmailOpt = hocSinhRepository.findByEmail(tk.getEmail());
                if (hocSinhByEmailOpt.isPresent()) {
                    HocSinh hs = hocSinhByEmailOpt.get();
                    idHs = hs.getIdHs();
                    fullName = buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen());
                    System.out.println("Found HocSinh by email: ID_HS=" + idHs + ", FullName=" + fullName);
                }
            }
        }

        // Ưu tiên 2: Nếu chưa có fullName, kiểm tra NhanVien (giáo viên, admin)
        if (fullName == null || fullName.trim().isEmpty()) {
            // Tìm NhanVien theo ID_TK
            Optional<NhanVien> nhanVienOpt = nhanVienRepository.findByTaiKhoan_IdTk(tk.getIdTk());
            
            if (nhanVienOpt.isPresent()) {
                NhanVien nv = nhanVienOpt.get();
                idNv = nv.getIdNv();
                // Build fullName từ ho, tenDem, ten
                fullName = buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen());
                System.out.println("Found NhanVien: ID_NV=" + idNv + ", FullName=" + fullName);
            }
        }

        // Fallback bổ sung: nếu vẫn chưa có fullName, thử tìm HocSinh theo email
        if (fullName == null || fullName.trim().isEmpty()) {
            Optional<HocSinh> hocSinhByEmailAny = hocSinhRepository.findByEmail(tk.getEmail());
            if (hocSinhByEmailAny.isPresent()) {
                HocSinh hs = hocSinhByEmailAny.get();
                idHs = (idHs == null ? hs.getIdHs() : idHs);
                fullName = buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen());
                System.out.println("Fallback HocSinh by email (no R001): ID_HS=" + hs.getIdHs() + ", FullName=" + fullName);
            }
        }

        // Nếu vẫn chưa có fullName, dùng email
        if (fullName == null || fullName.trim().isEmpty()) {
            fullName = tk.getEmail();
            System.out.println("Using email as fullName: " + fullName);
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

    /**
     * Build full name từ ho, tenDem, ten
     */
    private String buildFullName(String ho, String tenDem, String ten) {
        StringBuilder sb = new StringBuilder();
        if (ho != null && !ho.trim().isEmpty()) {
            sb.append(ho.trim());
        }
        if (tenDem != null && !tenDem.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(tenDem.trim());
        }
        if (ten != null && !ten.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(ten.trim());
        }
        return sb.toString().trim();
    }
}
