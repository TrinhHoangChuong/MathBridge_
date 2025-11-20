package com.mathbridge.service;

import com.mathbridge.dto.LienHeTuVanDTO;
import com.mathbridge.dto.portaltutor.TuLienHeTuVanResponseDTO;
import com.mathbridge.entity.LienHeTuVan;
import com.mathbridge.repository.LienHeTuVanRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LienHeTuVanService {

    private final LienHeTuVanRepository lienHeTuVanRepository;

    public LienHeTuVanService(LienHeTuVanRepository lienHeTuVanRepository) {
        this.lienHeTuVanRepository = lienHeTuVanRepository;
    }

    public LienHeTuVan saveContactRequest(LienHeTuVanDTO dto) {
        LienHeTuVan entity = new LienHeTuVan();

        // Generate ID
        entity.setIdTv("TV" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        entity.setHoTen(dto.getHoTen());
        entity.setEmail(dto.getEmail());
        entity.setSdt(dto.getSdt());
        entity.setTieuDe(dto.getTieuDe());
        entity.setNoiDung(dto.getNoiDung());
        entity.setHinhThucTuVan(dto.getHinhThucTuVan() != null ? dto.getHinhThucTuVan() : "Liên hệ qua form");

        entity.setThoiDiemTao(LocalDateTime.now());
        entity.setTrangThai("Chưa xử lý");

        return lienHeTuVanRepository.save(entity);
    }

    public List<TuLienHeTuVanResponseDTO> getAllConsultationRequests() {
        List<LienHeTuVan> requests = lienHeTuVanRepository.findAll();
        return requests.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public TuLienHeTuVanResponseDTO updateStatus(String idTv, String trangThai) {
        LienHeTuVan entity = lienHeTuVanRepository.findById(idTv)
                .orElseThrow(() -> new RuntimeException("Yêu cầu tư vấn không tồn tại"));
        entity.setTrangThai(trangThai);
        entity = lienHeTuVanRepository.save(entity);
        return convertToResponseDTO(entity);
    }

    private TuLienHeTuVanResponseDTO convertToResponseDTO(LienHeTuVan entity) {
        TuLienHeTuVanResponseDTO dto = new TuLienHeTuVanResponseDTO();
        dto.setIdTv(entity.getIdTv());
        dto.setHoTen(entity.getHoTen());
        dto.setEmail(entity.getEmail());
        dto.setSdt(entity.getSdt());
        dto.setTieuDe(entity.getTieuDe());
        dto.setNoiDung(entity.getNoiDung());
        dto.setHinhThucTuVan(entity.getHinhThucTuVan());
        dto.setThoiDiemTao(entity.getThoiDiemTao());
        dto.setTrangThai(entity.getTrangThai());
        return dto;
    }
}