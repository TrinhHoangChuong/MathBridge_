package com.mathbridge.service.impl;

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
        if (req.getEmail() == null || req.getPassword() == null ||
                req.getHo() == null || req.getTen() == null ||
                req.getSdt() == null || req.getGioiTinh() == null || req.getDiaChi() == null) {
            return null;
        }

        if (taiKhoanRepo.existsByEmail(req.getEmail())) return null;
        if (hocSinhRepo.findByEmail(req.getEmail()).isPresent()) return null;
        if (hocSinhRepo.findBySdt(req.getSdt()).isPresent()) return null;

        int nextTkNo = taiKhoanRepo.findMaxTkNumber() + 1;
        String idTk = "TK" + String.format("%03d", nextTkNo);

        TaiKhoan tk = new TaiKhoan();
        tk.setIdTk(idTk);
        tk.setEmail(req.getEmail());
        tk.setPassword(req.getPassword());
        tk.setTrangThai("ACTIVE");
        tk.setThoiDiemTao(LocalDateTime.now());
        taiKhoanRepo.save(tk);

        int nextHsNo = hocSinhRepo.findMaxHsNumber() + 1;
        String idHs = "HS" + String.format("%03d", nextHsNo);

        HocSinh hs = new HocSinh();
        hs.setIdHs(idHs);
        hs.setTaiKhoan(tk);
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

        tk.setIdHsRef(idHs);
        taiKhoanRepo.save(tk);

        // Ensure role R001 (HOC_SINH) exists
        Role r001 = roleRepo.findById("R001")
                .orElseGet(() -> roleRepo.findByTenVaiTro("HOC_SINH").orElse(null));
        if (r001 == null) {
            Role newRole = new Role();
            newRole.setIdRole("R001");
            newRole.setTenVaiTro("HOC_SINH");
            r001 = roleRepo.save(newRole);
        }
        TaiKhoanVaiTro tkvt = new TaiKhoanVaiTro();
        tkvt.setId(new TaiKhoanVaiTroId(idTk, r001.getIdRole()));
        tkvt.setTaiKhoan(tk);
        tkvt.setRole(r001);
        tkvtRepo.save(tkvt);

        String fullName = (hs.getHo() + " " + (hs.getTenDem() == null ? "" : hs.getTenDem() + " ") + hs.getTen()).trim();
        return new AuthenticatedAccountDTO(
                tk.getIdTk(),
                tk.getEmail(),
                List.of(tkvt.getRole().getIdRole()),
                fullName,
                idHs,
                null
        );
    }
}


