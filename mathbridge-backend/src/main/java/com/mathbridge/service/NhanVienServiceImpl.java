package com.mathbridge.service;

import com.mathbridge.dto.GiaoVienCardDTO;
import com.mathbridge.dto.NhanVienProfileDTO;
import com.mathbridge.dto.NhanVienProfileUpdateDTO;
import com.mathbridge.entity.NhanVien;
import com.mathbridge.repository.NhanVienRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
    @Transactional(readOnly = true)
    public Optional<NhanVienProfileDTO> getProfileByAccountId(String idTk) {
        return nhanVienRepository.findByIdTk(idTk)
                .map(this::mapToProfileDto);
    }

    @Override
    @Transactional
    public NhanVienProfileDTO updateProfileByAccountId(String idTk, NhanVienProfileUpdateDTO request) {
        NhanVien nhanVien = nhanVienRepository.findByIdTk(idTk)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhân viên với tài khoản " + idTk));

        if (request.getHo() != null) {
            nhanVien.setHo(request.getHo());
        }
        if (request.getTenDem() != null) {
            nhanVien.setTenDem(request.getTenDem());
        }
        if (request.getTen() != null) {
            nhanVien.setTen(request.getTen());
        }
        if (request.getSdt() != null) {
            nhanVien.setSdt(request.getSdt());
        }
        if (request.getChuyenMon() != null) {
            nhanVien.setChuyenMon(request.getChuyenMon());
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

    private NhanVienProfileDTO mapToProfileDto(NhanVien nhanVien) {
        String ho = safeTrim(nhanVien.getHo());
        String tenDem = safeTrim(nhanVien.getTenDem());
        String ten = safeTrim(nhanVien.getTen());

        String fullName = Stream.of(ho, tenDem, ten)
                .filter(part -> part != null && !part.isBlank())
                .collect(Collectors.joining(" "));

        String coSoId = nhanVien.getCoSo() != null ? nhanVien.getCoSo().getIdCs() : nhanVien.getIdCs();
        String coSoTen = nhanVien.getCoSo() != null ? nhanVien.getCoSo().getTenCoSo() : null;

        return new NhanVienProfileDTO(
                nhanVien.getIdNv(),
                nhanVien.getIdTk(),
                nhanVien.getHo(),
                nhanVien.getTenDem(),
                nhanVien.getTen(),
                fullName.isEmpty() ? nhanVien.getEmail() : fullName,
                nhanVien.getEmail(),
                nhanVien.getSdt(),
                nhanVien.getChuyenMon(),
                nhanVien.getKinhNghiem(),
                nhanVien.getGioiTinh(),
                nhanVien.getChucVu(),
                coSoId,
                coSoTen
        );
    }

    private String safeTrim(String value) {
        return value != null ? value.trim() : null;
    }
}
