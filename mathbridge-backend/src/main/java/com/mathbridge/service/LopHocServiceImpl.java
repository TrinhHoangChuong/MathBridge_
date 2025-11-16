package com.mathbridge.service;

import com.mathbridge.dto.LopHocDTO;
import com.mathbridge.entity.LopHoc;
import com.mathbridge.repository.LopHocRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LopHocServiceImpl implements LopHocService {

    private final LopHocRepository lopHocRepository;

    public LopHocServiceImpl(LopHocRepository lopHocRepository) {
        this.lopHocRepository = lopHocRepository;
    }

    @Override
    public List<LopHocDTO> getLopHocByGiaoVien(String idNv) {
        List<LopHoc> lopHocs = lopHocRepository.findByNhanVien_IdNv(idNv);

        return lopHocs.stream()
                .map(lh -> {
                    // Đếm số học sinh đã đăng ký vào lớp học
                    int soHocSinh = lh.getDangKyLhs() != null ? lh.getDangKyLhs().size() : 0;
                    
                    return new LopHocDTO(
                            lh.getIdLh(),
                            lh.getTenLop(),
                            lh.getLoaiNgay(),
                            lh.getSoBuoi(),
                            lh.getHinhThucHoc(),
                            lh.getNgayBatDau(),
                            lh.getMucGiaThang(),
                            lh.getTrangThai(),
                            lh.getMoTa(),
                            soHocSinh
                    );
                })
                .collect(Collectors.toList());
    }
}
