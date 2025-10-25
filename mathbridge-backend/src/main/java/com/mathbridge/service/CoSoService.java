package com.mathbridge.service;

import com.mathbridge.entity.CoSo;
import com.mathbridge.repository.CoSoRepository;
import com.mathbridge.dto.FooterCenterDTO;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CoSoService {

    private final CoSoRepository coSoRepository;

    public CoSoService(CoSoRepository coSoRepository) {
        this.coSoRepository = coSoRepository;
    }

    // Trả danh sách cơ sở đã format sẵn cho footer
    public List<FooterCenterDTO> getCentersForFooter() {
        List<CoSo> dsCoSo = coSoRepository.findAll();

        return dsCoSo.stream().map(coSo -> {
            FooterCenterDTO dto = new FooterCenterDTO();
            dto.setId(coSo.getId());
            dto.setName(coSo.getTenCoSo());
            dto.setAddress(coSo.getDiaChi());
            dto.setHotline(coSo.getHotline());
            dto.setWorkingDays(coSo.getNgayLamViec());

            // Format giờ mở cửa - đóng cửa thành 1 chuỗi
            // Ví dụ "08:00 - 22:00"
            String gioMo = coSo.getGioMoCua() != null ? coSo.getGioMoCua().toString() : "";
            String gioDong = coSo.getGioDongCua() != null ? coSo.getGioDongCua().toString() : "";
            dto.setWorkingHours(gioMo + " - " + gioDong);

            return dto;
        }).collect(Collectors.toList());
    }
}
