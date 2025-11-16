package com.mathbridge.service;

import com.mathbridge.dto.GiaoVienCardDTO;
import com.mathbridge.dto.NhanVienProfileDTO;
import com.mathbridge.dto.NhanVienProfileUpdateDTO;
import com.mathbridge.repository.NhanVienRepository;
import org.springframework.stereotype.Service;

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
        return Optional.empty();
    }

    @Override
    public NhanVienProfileDTO updateProfileByAccountId(String idTk, NhanVienProfileUpdateDTO request) {
        return null;
    }
}
