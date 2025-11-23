package com.mathbridge.service.portaltutor;

import com.mathbridge.dto.JobDTO;
import com.mathbridge.entity.TinTuyenDung;
import com.mathbridge.repository.TinTuyenDungRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TuRecruitmentService {

    private final TinTuyenDungRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TuRecruitmentService(TinTuyenDungRepository repository) {
        this.repository = repository;
    }

    // Lấy tất cả tin tuyển dụng
    public List<JobDTO> getAllJobs() {
        List<TinTuyenDung> jobs = repository.findAll();
        return jobs.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Lấy tin tuyển dụng theo ID
    public JobDTO getJobById(String idTd) {
        TinTuyenDung job = repository.findById(idTd)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tuyển dụng với ID: " + idTd));
        return toDTO(job);
    }

    // Tạo tin tuyển dụng mới
    @Transactional
    public JobDTO createJob(JobDTO jobDTO) {
        // Tạo ID mới
        int maxNumber = repository.findAll().stream()
                .map(job -> {
                    String id = job.getIdTd();
                    if (id != null && id.startsWith("TD")) {
                        try {
                            return Integer.parseInt(id.substring(2));
                        } catch (NumberFormatException e) {
                            return 0;
                        }
                    }
                    return 0;
                })
                .max(Integer::compareTo)
                .orElse(0);
        
        String newId = String.format("TD%03d", maxNumber + 1);

        // Kiểm tra ID đã tồn tại chưa
        while (repository.existsById(newId)) {
            maxNumber++;
            newId = String.format("TD%03d", maxNumber + 1);
        }

        TinTuyenDung job = toEntity(jobDTO);
        job.setIdTd(newId);
        
        TinTuyenDung saved = repository.save(job);
        return toDTO(saved);
    }

    // Cập nhật tin tuyển dụng
    @Transactional
    public JobDTO updateJob(String idTd, JobDTO jobDTO) {
        TinTuyenDung existing = repository.findById(idTd)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tuyển dụng với ID: " + idTd));

        // Cập nhật các trường
        existing.setTieuDe(jobDTO.getTieuDe());
        existing.setViTri(jobDTO.getViTri());
        existing.setMoTaNgan(jobDTO.getMoTaNgan());
        existing.setMoTa(jobDTO.getMoTa());
        existing.setYeuCau(jobDTO.getYeuCau());
        existing.setCapBac(jobDTO.getCapBac());
        existing.setHinhThucLamViec(jobDTO.getHinhThucLamViec());
        existing.setMucLuongTu(jobDTO.getMucLuongTu());
        existing.setMucLuongDen(jobDTO.getMucLuongDen());
        existing.setKinhNghiem(jobDTO.getKinhNghiem());
        existing.setSoLuongTuyen(jobDTO.getSoLuongTuyen());
        existing.setHanNop(jobDTO.getHanNop());
        existing.setTrangThai(jobDTO.getTrangThai());

        TinTuyenDung saved = repository.save(existing);
        return toDTO(saved);
    }

    // Xóa tin tuyển dụng
    @Transactional
    public void deleteJob(String idTd) {
        if (!repository.existsById(idTd)) {
            throw new RuntimeException("Không tìm thấy tin tuyển dụng với ID: " + idTd);
        }
        repository.deleteById(idTd);
    }

    // Chuyển đổi Entity sang DTO
    private JobDTO toDTO(TinTuyenDung entity) {
        JobDTO dto = new JobDTO();
        dto.setIdTd(entity.getIdTd());
        dto.setTieuDe(entity.getTieuDe());
        dto.setViTri(entity.getViTri());
        dto.setMoTaNgan(entity.getMoTaNgan());
        dto.setMoTa(entity.getMoTa());
        dto.setYeuCau(entity.getYeuCau());
        dto.setCapBac(entity.getCapBac());
        dto.setHinhThucLamViec(entity.getHinhThucLamViec());
        dto.setMucLuongTu(entity.getMucLuongTu());
        dto.setMucLuongDen(entity.getMucLuongDen());
        dto.setKinhNghiem(entity.getKinhNghiem());
        dto.setSoLuongTuyen(entity.getSoLuongTuyen());
        dto.setHanNop(entity.getHanNop());
        dto.setTrangThai(entity.getTrangThai());

        // Parse yêu cầu thành list
        dto.setYeuCauList(parseStringArray(entity.getYeuCau()));
        
        // Benefits không có trong entity, để trống
        dto.setBenefits(new ArrayList<>());

        return dto;
    }

    // Chuyển đổi DTO sang Entity
    private TinTuyenDung toEntity(JobDTO dto) {
        TinTuyenDung entity = new TinTuyenDung();
        entity.setTieuDe(dto.getTieuDe());
        entity.setViTri(dto.getViTri());
        entity.setMoTaNgan(dto.getMoTaNgan());
        entity.setMoTa(dto.getMoTa());
        entity.setYeuCau(dto.getYeuCau());
        entity.setCapBac(dto.getCapBac());
        entity.setHinhThucLamViec(dto.getHinhThucLamViec());
        entity.setMucLuongTu(dto.getMucLuongTu());
        entity.setMucLuongDen(dto.getMucLuongDen());
        entity.setKinhNghiem(dto.getKinhNghiem());
        entity.setSoLuongTuyen(dto.getSoLuongTuyen());
        entity.setHanNop(dto.getHanNop());
        entity.setTrangThai(dto.getTrangThai() != null ? dto.getTrangThai() : "Đang tuyển");

        return entity;
    }

    // Parse string array từ JSON hoặc newline-separated
    private List<String> parseStringArray(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        try {
            // Thử parse như JSON array
            if (raw.trim().startsWith("[")) {
                return objectMapper.readValue(raw, new TypeReference<List<String>>() {});
            }
        } catch (Exception ignored) {
            // Nếu không phải JSON, xử lý như newline-separated
        }
        
        // Fallback: split by newlines
        String[] parts = raw.split("\r?\n");
        List<String> result = new ArrayList<>();
        for (String part : parts) {
            if (part != null && !part.trim().isEmpty()) {
                result.add(part.trim());
            }
        }
        return result;
    }
}

