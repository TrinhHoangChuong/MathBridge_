package com.mathbridge.service.portaltutor;

import com.mathbridge.dto.portaltutor.TuAssignedStudentResponseDTO;
import com.mathbridge.entity.CoVanHocSinh;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.repository.portaltutor.TuCoVanHocSinhRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Comparator;

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
     * Lấy chi tiết một học sinh được phân công cho cố vấn
     */
    public TuAssignedStudentResponseDTO getAssignedStudentDetail(String idNv, String idHs) {
        if (idNv == null || idHs == null) {
            throw new RuntimeException("ID cố vấn và ID học sinh không được để trống");
        }
        
        List<CoVanHocSinh> list = coVanHocSinhRepository.findByTutorIdAndStudentId(idNv, idHs);
        if (list == null || list.isEmpty()) {
            throw new RuntimeException("Không tìm thấy phân công cho cố vấn: " + idNv + " và học sinh: " + idHs);
        }

        // Lấy phân công mới nhất (theo ngayBatDau)
        CoVanHocSinh assignment = list.stream()
                .max(Comparator.comparing(
                        a -> a.getId() != null && a.getId().getNgayBatDau() != null ? a.getId().getNgayBatDau()
                                : LocalDateTime.MIN))
                .orElse(list.get(0));

        return convertToDTO(assignment);
    }

    /**
     * Kiểm tra cố vấn (idNv) có đang phụ trách học sinh (idHs) hay không
     * Trả về true nếu tồn tại phân công với trạng thái đang phụ trách và chưa kết
     * thúc
     */
    public boolean isTutorAssignedToStudent(String idNv, String idHs) {
        if (idNv == null || idHs == null)
            return false;
        List<CoVanHocSinh> list = coVanHocSinhRepository.findByTutorIdAndStudentId(idNv, idHs);
        if (list == null || list.isEmpty())
            return false;

        LocalDateTime now = LocalDateTime.now();
        return list.stream().anyMatch(cv -> {
            String tt = cv.getTrangThai();
            boolean statusOk = (tt == null) || tt.contains("Dang phu trach") || tt.contains("Đang")
                    || tt.toLowerCase().contains("dang");
            boolean notEnded = cv.getNgayKetThuc() == null || cv.getNgayKetThuc().isAfter(now);
            return statusOk && notEnded;
        });
    }

    /**
     * Kết thúc phân công của cố vấn cho một học sinh (đặt trạng thái = 'Ket thuc'
     * và đặt ngayKetThuc = now)
     */
    public TuAssignedStudentResponseDTO finishAssignedStudent(String idNv, String idHs) {
        List<CoVanHocSinh> list = coVanHocSinhRepository.findByTutorIdAndStudentId(idNv, idHs);
        if (list == null || list.isEmpty()) {
            throw new RuntimeException("Không tìm thấy phân công cho cố vấn: " + idNv + " và học sinh: " + idHs);
        }

        // Lấy phân công mới nhất (theo ngayBatDau)
        CoVanHocSinh assignment = list.stream()
                .max(Comparator.comparing(
                        a -> a.getId() != null && a.getId().getNgayBatDau() != null ? a.getId().getNgayBatDau()
                                : LocalDateTime.MIN))
                .orElse(list.get(0));

        LocalDateTime now = LocalDateTime.now();
        assignment.setNgayKetThuc(now);
        assignment.setTrangThai("Ket thuc");

        CoVanHocSinh saved = coVanHocSinhRepository.save(assignment);
        return convertToDTO(saved);
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

            // Lấy thông tin lớp học (nếu có) từ các đăng ký lớp của học sinh
            // Ưu tiên lấy lớp học có trạng thái đang hoạt động
            if (hocSinh.getDangKyLhs() != null && !hocSinh.getDangKyLhs().isEmpty()) {
                hocSinh.getDangKyLhs().stream()
                        .filter(dk -> dk.getLopHoc() != null)
                        .filter(dk -> {
                            String trangThai = dk.getLopHoc().getTrangThai();
                            return trangThai != null && 
                                   (trangThai.equals("Đang mở") || 
                                    trangThai.equals("Dang mo") ||
                                    trangThai.equals("Dự Kiến") ||
                                    trangThai.equals("Du Kien"));
                        })
                        .findFirst()
                        .or(() -> hocSinh.getDangKyLhs().stream()
                                .filter(dk -> dk.getLopHoc() != null)
                                .findFirst())
                        .ifPresent(dk -> {
                            dto.setClassId(dk.getLopHoc().getIdLh());
                            dto.setClassName(dk.getLopHoc().getTenLop() != null ? 
                                           dk.getLopHoc().getTenLop() : "");
                        });
            }
        }

        return dto;
    }
}
