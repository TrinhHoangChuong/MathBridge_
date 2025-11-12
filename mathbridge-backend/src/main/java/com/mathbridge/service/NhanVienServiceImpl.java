package com.mathbridge.service;

import com.mathbridge.dto.GiaoVienCardDTO;
import com.mathbridge.dto.NhanVienProfileDTO;
import com.mathbridge.dto.NhanVienProfileUpdateDTO;
import com.mathbridge.entity.CoSo;
import com.mathbridge.entity.NhanVien;
import com.mathbridge.repository.NhanVienRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NhanVienServiceImpl implements NhanVienService {

    private final NhanVienRepository nhanVienRepository;

    public NhanVienServiceImpl(NhanVienRepository nhanVienRepository) {
        this.nhanVienRepository = nhanVienRepository;
    }

    @Override
    public List<GiaoVienCardDTO> getDanhSachGiaoVien() {
        return nhanVienRepository.findAll()
                .stream()
                // lọc đúng chức vụ = "Giáo Viên"
                .filter(nv -> {
                    String cv = nv.getChucVu();
                    return cv != null && cv.trim().equalsIgnoreCase("Giáo Viên");
                })
                .map(nv -> new GiaoVienCardDTO(
                        nv.getIdNv(),                // rất quan trọng cho FE
                        nv.getHo(),
                        nv.getTenDem(),
                        nv.getTen(),
                        nv.getChuyenMon(),
                        nv.getKinhNghiem()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<NhanVienProfileDTO> getProfileByAccountId(String idTk) {
        return nhanVienRepository.findFirstByTaiKhoan_IdTk(idTk)
                .map(this::mapToProfileDto);
    }

    @Override
    public NhanVienProfileDTO updateProfileByAccountId(String idTk, NhanVienProfileUpdateDTO request) {
        NhanVien nhanVien = nhanVienRepository.findFirstByTaiKhoan_IdTk(idTk)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin nhân viên cho tài khoản: " + idTk));

        if (request.getHo() != null) {
            nhanVien.setHo(request.getHo().trim());
        }
        if (request.getTenDem() != null) {
            nhanVien.setTenDem(request.getTenDem().trim());
        }
        if (request.getTen() != null) {
            nhanVien.setTen(request.getTen().trim());
        }
        if (request.getSdt() != null) {
            nhanVien.setSdt(request.getSdt().trim());
        }
        if (request.getChuyenMon() != null) {
            nhanVien.setChuyenMon(request.getChuyenMon().trim());
        }
        if (request.getKinhNghiem() != null) {
            nhanVien.setKinhNghiem(request.getKinhNghiem());
        }
        if (request.getGioiTinh() != null) {
            nhanVien.setGioiTinh(request.getGioiTinh());
        }

        nhanVien.setThoiGianCapNhat(LocalDateTime.now());

        NhanVien saved = nhanVienRepository.save(nhanVien);
        return mapToProfileDto(saved);
    }

    private NhanVienProfileDTO mapToProfileDto(NhanVien nv) {
        String fullName = buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen());
        CoSo coSo = nv.getCoSo();

        return new NhanVienProfileDTO(
                nv.getIdNv(),
                nv.getTaiKhoan() != null ? nv.getTaiKhoan().getIdTk() : null,
                nv.getHo(),
                nv.getTenDem(),
                nv.getTen(),
                fullName,
                nv.getEmail(),
                nv.getSdt(),
                nv.getChuyenMon(),
                nv.getKinhNghiem(),
                nv.getGioiTinh(),
                nv.getChucVu(),
                coSo != null ? coSo.getIdCs() : null,
                coSo != null ? coSo.getTenCoSo() : null
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
