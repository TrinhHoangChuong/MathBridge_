package com.mathbridge.service;

import com.mathbridge.dto.AuthenticatedAccountDTO;
import com.mathbridge.dto.RegisterRequestDTO;
import com.mathbridge.entity.*;
import com.mathbridge.repository.*;
import com.mathbridge.service.RegistrationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RegistrationServiceImpl implements RegistrationService {

    private final TaiKhoanRepository taiKhoanRepo;
    private final HocSinhRepository hocSinhRepo;
    private final TaiKhoanVaiTroRepository tkvtRepo;
    private final RoleRepository roleRepo;

    public RegistrationServiceImpl(TaiKhoanRepository taiKhoanRepo,
                                   HocSinhRepository hocSinhRepo,
                                   TaiKhoanVaiTroRepository tkvtRepo,
                                   RoleRepository roleRepo) {
        this.taiKhoanRepo = taiKhoanRepo;
        this.hocSinhRepo = hocSinhRepo;
        this.tkvtRepo = tkvtRepo;
        this.roleRepo = roleRepo;
    }

    @Override
    @Transactional
    public AuthenticatedAccountDTO registerStudent(RegisterRequestDTO req) {
        // 0) Validate
        if (req.getEmail() == null || req.getPassword() == null ||
                req.getHo() == null || req.getTen() == null ||
                req.getSdt() == null || req.getGioiTinh() == null || req.getDiaChi() == null) {
            return null;
        }

        // 1) Chống trùng email/sđt
        if (taiKhoanRepo.existsByEmail(req.getEmail())) return null;
        if (hocSinhRepo.findByEmail(req.getEmail()).isPresent()) return null;
        if (hocSinhRepo.findBySdt(req.getSdt()).isPresent()) return null;

        // 2) Sinh ID_TK theo 'TK###'
        int nextTkNo = taiKhoanRepo.findMaxTkNumber() + 1;
        String idTk = "TK" + String.format("%03d", nextTkNo);

        // 3) Tạo TaiKhoan
        TaiKhoan tk = new TaiKhoan();
        tk.setIdTk(idTk);
        tk.setEmail(req.getEmail());
        tk.setPassword(req.getPassword());
        tk.setTrangThai("ACTIVE");
        tk.setThoiDiemTao(LocalDateTime.now());
        taiKhoanRepo.save(tk);

        // 4) Sinh ID_HS theo 'HS###'
        int nextHsNo = hocSinhRepo.findMaxHsNumber() + 1;
        String idHs = "HS" + String.format("%03d", nextHsNo);

        // 5) Tạo HocSinh (NOT NULL: Ho, Ten, Email, SDT, GioiTinh, DiaChi, ThoiGianCapNhat, TrangThaiHoatDong)
        HocSinh hs = new HocSinh();
        hs.setIdHs(idHs);
        hs.setTaiKhoan(tk); // FK ID_TK
        hs.setHo(req.getHo());
        hs.setTenDem(req.getTenDem());
        hs.setTen(req.getTen());
        hs.setEmail(req.getEmail());
        hs.setSdt(req.getSdt());
        hs.setGioiTinh(req.getGioiTinh());
        hs.setDiaChi(req.getDiaChi());
        hs.setThoiGianTao(LocalDateTime.now());
        hs.setThoiGianCapNhat(LocalDateTime.now());
        hs.setTrangThaiHoatDong(true);
        hocSinhRepo.save(hs);

        // 6) Cập nhật ngược TaiKhoan.idHsRef
        tk.setIdHsRef(idHs);
        taiKhoanRepo.save(tk);

        // 7) Gán role R001 vào TaiKhoan_VaiTro
        //    - Lấy role R001
        Role r001 = roleRepo.findById("R001")
                .orElseGet(() -> { 
                    return roleRepo.findByTenVaiTro("HOC_SINH").orElse(null);
                });
        TaiKhoanVaiTro tkvt = new TaiKhoanVaiTro();
        tkvt.setId(new TaiKhoanVaiTroId(idTk, r001 != null ? r001.getIdRole() : "R001"));
        tkvt.setTaiKhoan(tk);
        tkvt.setRole(r001 != null ? r001 : new Role("R001"));
        tkvtRepo.save(tkvt);

        // 8) Trả về AuthenticatedAccountDTO để Controller phát hành JWT
        String fullName = (hs.getHo() + " " + (hs.getTenDem() == null ? "" : hs.getTenDem() + " ") + hs.getTen()).trim();
        return new AuthenticatedAccountDTO(
                tk.getIdTk(),
                tk.getEmail(),
                List.of(tkvt.getRole().getIdRole()), // ["R001"]
                fullName,
                idHs,
                null
        );
    }
}
