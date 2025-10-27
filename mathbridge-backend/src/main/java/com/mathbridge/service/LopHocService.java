package com.mathbridge.service;

import com.mathbridge.dto.LopHocDTO;
import com.mathbridge.entity.LopHoc;
import com.mathbridge.repository.LopHocRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LopHocService {

    private final LopHocRepository lopHocRepository;

    public LopHocService(LopHocRepository lopHocRepository) {
        this.lopHocRepository = lopHocRepository;
    }

    // Lấy tất cả lớp mà một giáo viên phụ trách
    public List<LopHocDTO> getLopHocByGiaoVien(String idNv) {
        List<LopHoc> ds = lopHocRepository.findByNhanVien_IdNv(idNv);

        return ds.stream()
                .map(this::mapToLopHocBriefDTO)
                .collect(Collectors.toList());
    }

    // mapper: convert entity -> DTO cho FE
    private LopHocDTO mapToLopHocBriefDTO(LopHoc lh) {
        if (lh == null) return null;

        String tenChuongTrinh = null;
        if (lh.getChuongTrinh() != null) {
            tenChuongTrinh = lh.getChuongTrinh().getTenCt();
        }

        return new LopHocDTO(
                lh.getIdLh(),                 // idLop
                lh.getTenLop(),               // tenLop
                tenChuongTrinh,               // chuongTrinh (TenCT)
                lh.getHinhThucHoc(),          // hinhThucHoc
                lh.getNgayBatDau(),           // ngayBatDau
                lh.getMucGiaThang(),          // hocPhiThang
                lh.getTrangThai()             // trangThai
        );
    }
}
