package com.mathbridge.service;

import com.mathbridge.entity.LienHeTuVan;
import com.mathbridge.repository.LienHeTuVanRepository;
import com.mathbridge.dto.LienHeTuVanDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

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
}