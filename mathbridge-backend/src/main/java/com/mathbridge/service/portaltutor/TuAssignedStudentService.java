package com.mathbridge.service.portaltutor;

import com.mathbridge.dto.portaltutor.TuAssignedStudentResponseDTO;
import com.mathbridge.entity.CoVanHocSinh;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.repository.portaltutor.TuCoVanHocSinhRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TuAssignedStudentService {
    
    private final TuCoVanHocSinhRepository coVanHocSinhRepository;
    
    public TuAssignedStudentService(TuCoVanHocSinhRepository coVanHocSinhRepository) {
        this.coVanHocSinhRepository = coVanHocSinhRepository;
    }
    
    /**
     * Lấy danh sách học sinh đang được phân công cho cố vấn
     * Chỉ lấy những học sinh có TrangThai = "Dang phu trach" 
     * và chưa kết thúc (NgayKetThuc IS NULL hoặc > hiện tại)
     */
    public List<TuAssignedStudentResponseDTO> getActiveAssignedStudents(String idNv) {
        LocalDateTime now = LocalDateTime.now();
        List<CoVanHocSinh> assignments = coVanHocSinhRepository.findActiveStudentsByTutorId(idNv, now);
        return assignments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy tất cả học sinh được phân công (bao gồm cả đã kết thúc)
     */
    public List<TuAssignedStudentResponseDTO> getAllAssignedStudents(String idNv) {
        List<CoVanHocSinh> assignments = coVanHocSinhRepository.findAllStudentsByTutorId(idNv);
        return assignments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy học sinh được phân công theo trạng thái
     */
    public List<TuAssignedStudentResponseDTO> getAssignedStudentsByStatus(String idNv, String trangThai) {
        List<CoVanHocSinh> assignments = coVanHocSinhRepository.findStudentsByTutorIdAndStatus(idNv, trangThai);
        return assignments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Đếm số học sinh đang được phân công
     */
    public Long countActiveAssignedStudents(String idNv) {
        LocalDateTime now = LocalDateTime.now();
        return coVanHocSinhRepository.countActiveStudentsByTutorId(idNv, now);
    }
    
    /**
     * Convert CoVanHocSinh entity to DTO
     */
    private TuAssignedStudentResponseDTO convertToDTO(CoVanHocSinh entity) {
        if (entity == null) {
            return null;
        }
        
        TuAssignedStudentResponseDTO dto = new TuAssignedStudentResponseDTO();
        
        // Thông tin phân công
        if (entity.getId() != null) {
            dto.setIdNv(entity.getId().getIdNv());
            dto.setNgayBatDau(entity.getId().getNgayBatDau());
        }
        dto.setNgayKetThuc(entity.getNgayKetThuc());
        dto.setTrangThai(entity.getTrangThai() != null ? entity.getTrangThai() : "Dang phu trach");
        dto.setGhiChu(entity.getGhiChu());
        
        // Thông tin học sinh
        HocSinh hocSinh = entity.getHocSinh();
        if (hocSinh != null) {
            dto.setIdHs(hocSinh.getIdHs());
            
            // Xây dựng họ tên đầy đủ
            String hoTen = hocSinh.getHo() != null ? hocSinh.getHo() : "";
            if (hocSinh.getTenDem() != null && !hocSinh.getTenDem().trim().isEmpty()) {
                hoTen += " " + hocSinh.getTenDem();
            }
            if (hocSinh.getTen() != null) {
                hoTen += " " + hocSinh.getTen();
            }
            dto.setHoTen(hoTen.trim());
            
            dto.setEmail(hocSinh.getEmail());
            dto.setSdt(hocSinh.getSdt());
            dto.setDiaChi(hocSinh.getDiaChi());
            dto.setGioiTinh(hocSinh.getGioiTinh());
            dto.setTrangThaiHoatDong(hocSinh.getTrangThaiHoatDong());
            dto.setThoiGianTao(hocSinh.getThoiGianTao());
            dto.setThoiGianCapNhat(hocSinh.getThoiGianCapNhat());
        }
        
        return dto;
    }
}



