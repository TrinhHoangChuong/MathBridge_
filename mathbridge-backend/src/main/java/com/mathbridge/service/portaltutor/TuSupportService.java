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

    // Lấy tất cả yêu cầu hỗ trợ
    public List<TuYeuCauHoTroResponseDTO> getAllSupportRequests() {
        List<YeuCauHoTro> requests = yeuCauHoTroRepository.findAllOrderByThoiDiemTaoDesc();
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy yêu cầu hỗ trợ theo trạng thái
    public List<TuYeuCauHoTroResponseDTO> getSupportRequestsByStatus(String trangThai) {
        List<YeuCauHoTro> requests = yeuCauHoTroRepository.findByTrangThaiOrderByThoiDiemTaoDesc(trangThai);
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy yêu cầu hỗ trợ chưa đóng
    public List<TuYeuCauHoTroResponseDTO> getOpenSupportRequests() {
        List<YeuCauHoTro> requests = yeuCauHoTroRepository.findOpenRequestsOrderByThoiDiemTaoDesc();
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy yêu cầu hỗ trợ theo học sinh
    public List<TuYeuCauHoTroResponseDTO> getSupportRequestsByStudent(String idHs) {
        List<YeuCauHoTro> requests = yeuCauHoTroRepository.findByHocSinhIdOrderByThoiDiemTaoDesc(idHs);
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy chi tiết yêu cầu hỗ trợ theo ID
    public TuYeuCauHoTroResponseDTO getSupportRequestById(String idYc) {
        YeuCauHoTro entity = yeuCauHoTroRepository.findById(idYc)
                .orElseThrow(() -> new RuntimeException("Yêu cầu hỗ trợ không tồn tại với ID: " + idYc));
        return convertToDTO(entity);
    }

    // Cập nhật trạng thái yêu cầu hỗ trợ
    @Transactional
    public TuYeuCauHoTroResponseDTO updateSupportStatus(String idYc, TuUpdateSupportStatusRequestDTO request) {
        YeuCauHoTro entity = yeuCauHoTroRepository.findById(idYc)
                .orElseThrow(() -> new RuntimeException("Yêu cầu hỗ trợ không tồn tại với ID: " + idYc));
        
        // Cập nhật trạng thái
        if (request.getTrangThai() != null && !request.getTrangThai().trim().isEmpty()) {
            entity.setTrangThai(request.getTrangThai());
        }
        
        // Nếu trạng thái là "Đã đóng" hoặc "Đã xử lý", set thời điểm đóng
        if (request.getTrangThai() != null && 
            (request.getTrangThai().equals("Đã đóng") || request.getTrangThai().equals("Đã xử lý"))) {
            if (entity.getThoiDiemDong() == null) {
                entity.setThoiDiemDong(LocalDateTime.now());
            }
        }
        
        // Lưu lại
        entity = yeuCauHoTroRepository.save(entity);
        
        return convertToDTO(entity);
    }

    // Convert entity to DTO
    private TuYeuCauHoTroResponseDTO convertToDTO(YeuCauHoTro entity) {
        if (entity == null) {
            return null;
        }
        
        TuYeuCauHoTroResponseDTO dto = new TuYeuCauHoTroResponseDTO();
        
        dto.setIdYc(entity.getIdYc());
        dto.setTieuDe(entity.getTieuDe() != null ? entity.getTieuDe() : "");
        dto.setNoiDung(entity.getNoiDung() != null ? entity.getNoiDung() : "");
        dto.setFileUrl(entity.getFileUrl());
        dto.setLoaiYeuCau(entity.getLoaiYeuCau());
        dto.setTrangThai(entity.getTrangThai() != null ? entity.getTrangThai() : "Chưa xử lý");
        dto.setThoiDiemTao(entity.getThoiDiemTao());
        dto.setThoiDiemDong(entity.getThoiDiemDong());
        
        // Thông tin học sinh
        HocSinh hocSinh = entity.getHocSinh();
        if (hocSinh != null) {
            dto.setIdHs(hocSinh.getIdHs());
            String studentName = hocSinh.getHo() != null ? hocSinh.getHo() : "";
            if (hocSinh.getTenDem() != null && !hocSinh.getTenDem().trim().isEmpty()) {
                studentName += " " + hocSinh.getTenDem();
            }
            if (hocSinh.getTen() != null) {
                studentName += " " + hocSinh.getTen();
            }
            dto.setStudentName(studentName.trim());
            dto.setStudentEmail(hocSinh.getEmail());
            dto.setStudentPhone(hocSinh.getSdt());
        }
        
        // Thông tin lớp học
        LopHoc lopHoc = entity.getLopHoc();
        if (lopHoc != null) {
            dto.setIdLh(lopHoc.getIdLh());
            dto.setTenLop(lopHoc.getTenLop() != null ? lopHoc.getTenLop() : "");
            if (lopHoc.getChuongTrinh() != null) {
                dto.setChuongTrinh(lopHoc.getChuongTrinh().getTenCt() != null ? 
                    lopHoc.getChuongTrinh().getTenCt() : "");
            }
        }
        
        return dto;
    }
}

