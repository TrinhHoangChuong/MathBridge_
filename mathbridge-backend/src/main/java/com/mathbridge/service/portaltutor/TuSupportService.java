package com.mathbridge.service.portaltutor;

import com.mathbridge.dto.portaltutor.TuUpdateSupportStatusRequestDTO;
import com.mathbridge.dto.portaltutor.TuYeuCauHoTroResponseDTO;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.LopHoc;
import com.mathbridge.entity.YeuCauHoTro;
import com.mathbridge.repository.portaltutor.TuYeuCauHoTroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TuSupportService {

    private final TuYeuCauHoTroRepository yeuCauHoTroRepository;

    public TuSupportService(TuYeuCauHoTroRepository yeuCauHoTroRepository) {
        this.yeuCauHoTroRepository = yeuCauHoTroRepository;
    }

    public List<TuYeuCauHoTroResponseDTO> getAllSupportRequests() {
        return yeuCauHoTroRepository.findAllOrderByThoiDiemTaoDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TuYeuCauHoTroResponseDTO> getSupportRequestsByStatus(String trangThai) {
        return yeuCauHoTroRepository.findByTrangThaiOrderByThoiDiemTaoDesc(trangThai)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TuYeuCauHoTroResponseDTO> getOpenSupportRequests() {
        return yeuCauHoTroRepository.findOpenRequestsOrderByThoiDiemTaoDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TuYeuCauHoTroResponseDTO> getSupportRequestsByStudent(String idHs) {
        return yeuCauHoTroRepository.findByHocSinhIdOrderByThoiDiemTaoDesc(idHs)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TuYeuCauHoTroResponseDTO getSupportRequestById(String idYc) {
        YeuCauHoTro entity = yeuCauHoTroRepository.findById(idYc)
                .orElseThrow(() -> new RuntimeException("Yeu cau ho tro khong ton tai voi ID: " + idYc));
        return convertToDTO(entity);
    }

    @Transactional
    public TuYeuCauHoTroResponseDTO updateSupportStatus(String idYc, TuUpdateSupportStatusRequestDTO request) {
        YeuCauHoTro entity = yeuCauHoTroRepository.findById(idYc)
                .orElseThrow(() -> new RuntimeException("Yeu cau ho tro khong ton tai voi ID: " + idYc));

        if (request.getTrangThai() != null && !request.getTrangThai().trim().isEmpty()) {
            String newStatus = request.getTrangThai().trim();
            entity.setTrangThai(newStatus);

            String normalized = newStatus.toLowerCase();
            if (entity.getThoiDiemDong() == null && (normalized.contains("dong") || normalized.contains("close"))) {
                entity.setThoiDiemDong(LocalDateTime.now());
            }
        }

        YeuCauHoTro saved = yeuCauHoTroRepository.save(entity);
        return convertToDTO(saved);
    }

    private TuYeuCauHoTroResponseDTO convertToDTO(YeuCauHoTro entity) {
        TuYeuCauHoTroResponseDTO dto = new TuYeuCauHoTroResponseDTO();
        dto.setIdYc(entity.getIdYc());
        dto.setIdHs(entity.getIdHs());
        dto.setTieuDe(entity.getTieuDe() != null ? entity.getTieuDe() : "");
        dto.setNoiDung(entity.getNoiDung() != null ? entity.getNoiDung() : "");
        dto.setFileUrl(entity.getFileUrl());
        dto.setLoaiYeuCau(entity.getLoaiYeuCau());
        dto.setTrangThai(entity.getTrangThai() != null ? entity.getTrangThai() : "Chua xu ly");
        dto.setThoiDiemTao(entity.getThoiDiemTao());
        dto.setThoiDiemDong(entity.getThoiDiemDong());

        HocSinh hocSinh = entity.getHocSinh();
        if (hocSinh != null) {
            dto.setIdHs(hocSinh.getIdHs());
            StringBuilder nameBuilder = new StringBuilder();
            if (hocSinh.getHo() != null) {
                nameBuilder.append(hocSinh.getHo()).append(' ');
            }
            if (hocSinh.getTenDem() != null && !hocSinh.getTenDem().trim().isEmpty()) {
                nameBuilder.append(hocSinh.getTenDem()).append(' ');
            }
            if (hocSinh.getTen() != null) {
                nameBuilder.append(hocSinh.getTen());
            }
            dto.setStudentName(nameBuilder.toString().trim());
            dto.setStudentEmail(hocSinh.getEmail());
            dto.setStudentPhone(hocSinh.getSdt());
        }

        LopHoc lopHoc = entity.getLopHoc();
        if (lopHoc != null) {
            dto.setIdLh(lopHoc.getIdLh());
            dto.setTenLop(lopHoc.getTenLop() != null ? lopHoc.getTenLop() : "");
            if (lopHoc.getChuongTrinh() != null && lopHoc.getChuongTrinh().getTenCt() != null) {
                dto.setChuongTrinh(lopHoc.getChuongTrinh().getTenCt());
            }
        }

        return dto;
    }
}
