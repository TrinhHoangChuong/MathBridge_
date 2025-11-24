package com.mathbridge.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mathbridge.dto.AssignmentQuestionDTO;
import com.mathbridge.dto.BaiTapDTO;
import com.mathbridge.dto.BaiNopDTO;
import com.mathbridge.entity.BaiTap;
import com.mathbridge.entity.BaiNop;
import com.mathbridge.entity.BuoiHocChiTiet;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.KetQuaHocTap;
import com.mathbridge.repository.BaiTapRepository;
import com.mathbridge.repository.BaiNopRepository;
import com.mathbridge.repository.BuoiHocChiTietRepository;
import com.mathbridge.repository.KetQuaHocTapRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BaiTapServiceImpl implements BaiTapService {

    private final BaiTapRepository baiTapRepository;
    private final BaiNopRepository baiNopRepository;
    private final BuoiHocChiTietRepository buoiHocChiTietRepository;
    private final KetQuaHocTapRepository ketQuaHocTapRepository;
    private final ObjectMapper objectMapper;

    public BaiTapServiceImpl(BaiTapRepository baiTapRepository,
                             BaiNopRepository baiNopRepository,
                             BuoiHocChiTietRepository buoiHocChiTietRepository,
                             KetQuaHocTapRepository ketQuaHocTapRepository,
                             ObjectMapper objectMapper) {
        this.baiTapRepository = baiTapRepository;
        this.baiNopRepository = baiNopRepository;
        this.buoiHocChiTietRepository = buoiHocChiTietRepository;
        this.ketQuaHocTapRepository = ketQuaHocTapRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public List<BaiTapDTO> getBaiTapByLopHoc(String idLh) {
        List<BaiTap> baiTaps = baiTapRepository.findByLopHocId(idLh);
        return baiTaps.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BaiTapDTO> getBaiTapByGiaoVien(String idNv) {
        System.out.println("=== getBaiTapByGiaoVien called with idNv: " + idNv + " ===");
        try {
            List<BaiTap> baiTaps = baiTapRepository.findByGiaoVienId(idNv);
            System.out.println("Found " + (baiTaps != null ? baiTaps.size() : 0) + " assignments");
            
            if (baiTaps == null || baiTaps.isEmpty()) {
                System.out.println("No assignments found for teacher: " + idNv);
                return Collections.emptyList();
            }
            
            List<BaiTapDTO> dtos = baiTaps.stream()
                    .map(bt -> {
                        try {
                            return convertToDTO(bt);
                        } catch (Exception e) {
                            System.err.println("Error converting BaiTap to DTO (idBt: " + bt.getIdBt() + "): " + e.getMessage());
                            e.printStackTrace();
                            return null;
                        }
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
            
            System.out.println("Successfully converted " + dtos.size() + " assignments to DTOs");
            return dtos;
        } catch (Exception e) {
            System.err.println("ERROR in getBaiTapByGiaoVien: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    @Override
    public List<BaiTapDTO> getBaiTapByBuoiHoc(String idBh) {
        List<BaiTap> baiTaps = baiTapRepository.findByBuoiHocId(idBh);
        return baiTaps.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BaiTapDTO createBaiTap(BaiTapDTO baiTapDTO) {
        BaiTap baiTap = new BaiTap();
        
        // Generate ID
        String idBt = "BT" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        baiTap.setIdBt(idBt);
        
        // Set properties
        baiTap.setTieuDe(baiTapDTO.getTieuDe());
        baiTap.setMoTa(baiTapDTO.getMoTa());
        baiTap.setLoaiBt(baiTapDTO.getLoaiBt());
        baiTap.setChoPhepLamBai(baiTapDTO.getChoPhepLamBai());
        baiTap.setHocSinhDuocPhep(baiTapDTO.getHocSinhDuocPhep());
        baiTap.setNgayBatDau(baiTapDTO.getNgayBatDau());
        baiTap.setNgayKetThuc(baiTapDTO.getNgayKetThuc());
        baiTap.setGhiChu(baiTapDTO.getGhiChu());
        applyContentFromDto(baiTap, baiTapDTO);
        
        BuoiHocChiTiet buoiHoc = resolveBuoiHocReference(baiTapDTO);
        if (buoiHoc != null) {
            baiTap.setBuoiHocChiTiet(buoiHoc);
            baiTap.setIdBh(buoiHoc.getIdBh());
        }
        
        BaiTap saved = baiTapRepository.save(baiTap);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public BaiTapDTO updateBaiTap(String idBt, BaiTapDTO baiTapDTO) {
        BaiTap baiTap = baiTapRepository.findById(idBt)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập"));
        
        baiTap.setTieuDe(baiTapDTO.getTieuDe());
        baiTap.setMoTa(baiTapDTO.getMoTa());
        baiTap.setLoaiBt(baiTapDTO.getLoaiBt());
        baiTap.setChoPhepLamBai(baiTapDTO.getChoPhepLamBai());
        baiTap.setHocSinhDuocPhep(baiTapDTO.getHocSinhDuocPhep());
        baiTap.setNgayBatDau(baiTapDTO.getNgayBatDau());
        baiTap.setNgayKetThuc(baiTapDTO.getNgayKetThuc());
        baiTap.setGhiChu(baiTapDTO.getGhiChu());
        applyContentFromDto(baiTap, baiTapDTO);
        
        BuoiHocChiTiet buoiHoc = resolveBuoiHocReference(baiTapDTO);
        if (buoiHoc != null) {
            baiTap.setBuoiHocChiTiet(buoiHoc);
            baiTap.setIdBh(buoiHoc.getIdBh());
        }
        
        BaiTap saved = baiTapRepository.save(baiTap);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteBaiTap(String idBt) {
        baiTapRepository.deleteById(idBt);
    }

    @Override
    public List<BaiNopDTO> getBaiNopByBaiTap(String idBt) {
        List<BaiNop> baiNops = baiNopRepository.findByBaiTapId(idBt);
        return baiNops.stream()
                .map(this::convertBaiNopToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BaiNopDTO chamDiemBaiNop(String idBn, BigDecimal diemSo, String nhanXet) {
        BaiNop baiNop = baiNopRepository.findById(idBn)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài nộp"));
        
        // Always update nhận xét if provided (ưu tiên cao nhất)
        if (nhanXet != null && !nhanXet.trim().isEmpty()) {
            // Trim và lưu nhận xét
            baiNop.setNhanXet(nhanXet.trim());
        } else if (nhanXet != null && nhanXet.trim().isEmpty()) {
            // Nếu gửi chuỗi rỗng, cho phép xóa nhận xét
            baiNop.setNhanXet(null);
        }
        // Nếu nhanXet == null, giữ nguyên giá trị hiện tại
        
        // Update điểm số if provided
        if (diemSo != null) {
            baiNop.setDiemSo(diemSo);
            baiNop.setTrangThai("DA_CHAM");
        } else {
            // If only updating comment, keep existing status or set to appropriate status
            // Don't change status if only updating comment
            if (baiNop.getTrangThai() == null || baiNop.getTrangThai().isEmpty()) {
                baiNop.setTrangThai("IN_PROGRESS");
            }
        }
        
        BaiNop saved = baiNopRepository.save(baiNop);
        
        // Update KetQuaHocTap when score is provided
        if (diemSo != null) {
            try {
                String idHs = saved.getHocSinh().getIdHs();
                
                // Find or create KetQuaHocTap
                List<KetQuaHocTap> existing = ketQuaHocTapRepository.findByHocSinhId(idHs);
                KetQuaHocTap ketQua = existing.isEmpty() ? null : existing.get(0);
                
                if (ketQua == null) {
                    ketQua = new KetQuaHocTap();
                    // Generate ID based on student ID: HS001 -> KQ001, HS114 -> KQ114
                    String idKq;
                    if (idHs != null && idHs.length() >= 2) {
                        // Extract numeric part from student ID (e.g., "HS001" -> "001", "HS114" -> "114")
                        String numericPart = idHs.substring(2); // Skip "HS" prefix
                        // Ensure numeric part is at least 3 digits, pad with zeros if needed
                        while (numericPart.length() < 3) {
                            numericPart = "0" + numericPart;
                        }
                        // Create ID: KQ + numeric part (e.g., "KQ001", "KQ114")
                        idKq = "KQ" + numericPart;
                        // Ensure ID is exactly 10 characters (pad with zeros if needed)
                        if (idKq.length() < 10) {
                            while (idKq.length() < 10) {
                                idKq += "0";
                            }
                        } else if (idKq.length() > 10) {
                            idKq = idKq.substring(0, 10);
                        }
                    } else {
                        // Fallback: use UUID if idHs format is unexpected
                        String randomId = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
                        idKq = "KQ" + randomId;
                        if (idKq.length() > 10) {
                            idKq = idKq.substring(0, 10);
                        } else if (idKq.length() < 10) {
                            while (idKq.length() < 10) {
                                idKq += "0";
                            }
                        }
                    }
                    ketQua.setIdKq(idKq);
                    ketQua.setIdHs(idHs);
                    ketQua.setDiemTrungBinh(BigDecimal.ZERO);
                    ketQua.setDiemTongKet(BigDecimal.ZERO);
                    ketQua.setXepLoai("N");
                }
                
                // Get all BaiNop for this student, grouped by loaiBt
                List<BaiNop> allBaiNop = baiNopRepository.findByHocSinhId(idHs);
                
                // Filter and calculate average for each type
                BigDecimal diem15Phut = tinhDiemTheoLoai(allBaiNop, "KIEM_TRA_15P");
                BigDecimal diem45Phut = tinhDiemTheoLoai(allBaiNop, "KIEM_TRA_45P");
                BigDecimal diemThiHK = tinhDiemTheoLoai(allBaiNop, "THI_HK");
                
                // Calculate DiemTrungBinh = (15p + 45p + thi) / 3 (simple average)
                BigDecimal diemTrungBinh = tinhDiemTrungBinhCong(diem15Phut, diem45Phut, diemThiHK);
                
                // Calculate DiemTongKet = 20%*15p + 30%*45p + 50%*thi (weighted average)
                BigDecimal diemTongKet = tinhDiemTongKet(diem15Phut, diem45Phut, diemThiHK);
                
                // Update KetQuaHocTap
                if (diemTrungBinh != null) {
                    ketQua.setDiemTrungBinh(diemTrungBinh);
                }
                if (diemTongKet != null) {
                    ketQua.setDiemTongKet(diemTongKet);
                }
                
                // Update XepLoai based on DiemTrungBinh
                if (diemTrungBinh != null) {
                    ketQua.setXepLoai(xepLoai(diemTrungBinh));
                } else {
                    ketQua.setXepLoai("N");
                }
                
                ketQuaHocTapRepository.save(ketQua);
            } catch (Exception e) {
                System.err.println("Error saving to KetQuaHocTap: " + e.getMessage());
                e.printStackTrace();
                // Don't fail the entire operation if KetQuaHocTap save fails
            }
        }
        
        return convertBaiNopToDTO(saved);
    }
    
    /**
     * Tính điểm trung bình cho một loại bài tập (15P, 45P, HK)
     * Lấy tất cả bài nộp đã chấm của loại đó và tính trung bình
     */
    private BigDecimal tinhDiemTheoLoai(List<BaiNop> baiNops, String loaiBt) {
        List<BaiNop> filtered = baiNops.stream()
                .filter(bn -> bn.getBaiTap() != null &&
                        bn.getBaiTap().getLoaiBt() != null &&
                        bn.getBaiTap().getLoaiBt().equals(loaiBt) &&
                        bn.getDiemSo() != null &&
                        (bn.getTrangThai() != null &&
                                (bn.getTrangThai().equals("DA_CHAM") || bn.getTrangThai().equals("GRADED_AUTO"))))
                .collect(Collectors.toList());

        if (filtered.isEmpty()) {
            return null;
        }

        BigDecimal tong = filtered.stream()
                .map(BaiNop::getDiemSo)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return tong.divide(BigDecimal.valueOf(filtered.size()), 2, java.math.RoundingMode.HALF_UP);
    }
    
    /**
     * Tính điểm trung bình cộng đơn giản: (15p + 45p + thi) / 3
     * Chỉ tính khi có đủ cả 3 loại điểm
     */
    private BigDecimal tinhDiemTrungBinhCong(BigDecimal diem15Phut, BigDecimal diem45Phut, BigDecimal diemThiHK) {
        // Chỉ tính điểm TB khi có đủ cả 3 loại điểm
        if (diem15Phut == null || diem45Phut == null || diemThiHK == null) {
            return null; // Chưa đủ điểm để tính
        }
        
        // Tính điểm trung bình cộng: (15p + 45p + thi) / 3
        BigDecimal tong = diem15Phut.add(diem45Phut).add(diemThiHK);
        BigDecimal diemTB = tong.divide(BigDecimal.valueOf(3), 2, java.math.RoundingMode.HALF_UP);
        
        return diemTB;
    }
    
    /**
     * Tính điểm tổng kết theo quy tắc:
     * - 20% điểm 15 phút
     * - 30% điểm 45 phút
     * - 50% điểm thi học kỳ
     *
     * Chỉ tính khi có đủ cả 3 loại điểm để đảm bảo tổng trọng số = 100%
     * Nếu thiếu bất kỳ điểm nào, trả về null (chưa đủ điểm để tính)
     */
    private BigDecimal tinhDiemTongKet(BigDecimal diem15Phut, BigDecimal diem45Phut, BigDecimal diemThiHK) {
        // Chỉ tính điểm tổng kết khi có đủ cả 3 loại điểm
        // Đảm bảo tổng trọng số = 20% + 30% + 50% = 100%
        if (diem15Phut == null || diem45Phut == null || diemThiHK == null) {
            return null; // Chưa đủ điểm để tính
        }
        
        // Tính điểm tổng kết có trọng số
        BigDecimal tong = BigDecimal.ZERO;
        tong = tong.add(diem15Phut.multiply(BigDecimal.valueOf(0.2)));  // 20%
        tong = tong.add(diem45Phut.multiply(BigDecimal.valueOf(0.3)));  // 30%
        tong = tong.add(diemThiHK.multiply(BigDecimal.valueOf(0.5)));   // 50%
        
        return tong.setScale(2, java.math.RoundingMode.HALF_UP);
    }
    
    private String xepLoai(BigDecimal diemTB) {
        if (diemTB == null || diemTB.compareTo(BigDecimal.ZERO) == 0) {
            return "N";
        }
        
        if (diemTB.compareTo(BigDecimal.valueOf(8.0)) >= 0) {
            return "Giỏi"; // Unicode: Giỏi (not "Gi?i")
        } else if (diemTB.compareTo(BigDecimal.valueOf(6.5)) >= 0) {
            return "Khá";
        } else if (diemTB.compareTo(BigDecimal.valueOf(5.0)) >= 0) {
            return "TB"; // Trung bình -> TB
        } else {
            return "Yếu";
        }
    }

    private BaiTapDTO convertToDTO(BaiTap baiTap) {
        if (baiTap == null) {
            System.err.println("ERROR: convertToDTO called with null BaiTap");
            return null;
        }
        
        BaiTapDTO dto = new BaiTapDTO();
        dto.setIdBt(baiTap.getIdBt());
        dto.setTieuDe(baiTap.getTieuDe());
        dto.setMoTa(baiTap.getMoTa());
        dto.setLoaiBt(baiTap.getLoaiBt());
        
        // Handle new fields - may be null if database columns don't exist yet
        try {
            dto.setChoPhepLamBai(baiTap.getChoPhepLamBai());
        } catch (Exception e) {
            System.out.println("Warning: Could not get choPhepLamBai for BaiTap " + baiTap.getIdBt() + ": " + e.getMessage());
            dto.setChoPhepLamBai(false);
        }
        
        try {
            dto.setHocSinhDuocPhep(baiTap.getHocSinhDuocPhep());
        } catch (Exception e) {
            System.out.println("Warning: Could not get hocSinhDuocPhep for BaiTap " + baiTap.getIdBt() + ": " + e.getMessage());
            dto.setHocSinhDuocPhep(null);
        }
        
        dto.setNgayBatDau(baiTap.getNgayBatDau());
        dto.setNgayKetThuc(baiTap.getNgayKetThuc());
        dto.setGhiChu(baiTap.getGhiChu());
        
        if (baiTap.getBuoiHocChiTiet() != null) {
            dto.setIdBh(baiTap.getBuoiHocChiTiet().getIdBh());
            dto.setTenCaHoc(baiTap.getBuoiHocChiTiet().getTenCaHoc());
            
            if (baiTap.getBuoiHocChiTiet().getLopHoc() != null) {
                dto.setIdLh(baiTap.getBuoiHocChiTiet().getLopHoc().getIdLh());
                dto.setTenLop(baiTap.getBuoiHocChiTiet().getLopHoc().getTenLop());
            }
        }

        // Read directly from BaiTap entity (moved from BaiTapNoiDung)
        dto.setThoiLuongPhut(baiTap.getThoiLuongPhut());
        // Removed: TuDongNop and CheDoChamDiem - these fields exist in BaiNop table
        // dto.setTuDongNop(baiTap.getTuDongNop());
        // dto.setCheDoChamDiem(baiTap.getCheDoChamDiem());
        dto.setCanhBao(baiTap.getCanhBao());
        if (baiTap.getNoiDungJson() != null && !baiTap.getNoiDungJson().trim().isEmpty()) {
            dto.setQuestions(deserializeQuestions(baiTap.getNoiDungJson()));
        } else {
            dto.setQuestions(Collections.emptyList());
        }
        
        // Count submissions
        long soBaiNop = baiNopRepository.countByBaiTapId(baiTap.getIdBt());
        long soBaiDaCham = baiNopRepository.countBaiDaChamByBaiTapId(baiTap.getIdBt());
        
        dto.setSoBaiNop((int) soBaiNop);
        dto.setSoBaiDaCham((int) soBaiDaCham);
        
        return dto;
    }

    private BaiNopDTO convertBaiNopToDTO(BaiNop baiNop) {
        BaiNopDTO dto = new BaiNopDTO();
        dto.setIdBn(baiNop.getIdBn());
        dto.setIdBt(baiNop.getBaiTap().getIdBt());
        dto.setIdHs(baiNop.getHocSinh().getIdHs());
        
        HocSinh hs = baiNop.getHocSinh();
        String hoTen = (hs.getHo() != null ? hs.getHo() : "") + 
                       (hs.getTenDem() != null ? " " + hs.getTenDem() : "") + 
                       (hs.getTen() != null ? " " + hs.getTen() : "");
        dto.setHoTen(hoTen.trim());
        
        dto.setFileUrl(baiNop.getFileUrl());
        dto.setDiemSo(baiNop.getDiemSo());
        dto.setNhanXet(baiNop.getNhanXet());
        dto.setTrangThai(baiNop.getTrangThai());
        dto.setGhiChu(baiNop.getGhiChu());
        dto.setNgayNop(baiNop.getThoiGianNop());
        dto.setThoiGianNop(baiNop.getThoiGianNop());
        dto.setTongSoCau(baiNop.getTongSoCau());
        dto.setSoCauDung(baiNop.getSoCauDung());
        
        // Set ngayKetThuc from BaiTap
        if (baiNop.getBaiTap() != null) {
            dto.setNgayKetThuc(baiNop.getBaiTap().getNgayKetThuc());
        }
        
        return dto;
    }

    private void applyContentFromDto(BaiTap baiTap, BaiTapDTO dto) {
        if (dto == null) {
            return;
        }

        // Write directly to BaiTap entity (moved from BaiTapNoiDung)
        baiTap.setThoiLuongPhut(dto.getThoiLuongPhut());
        // Removed: TuDongNop and CheDoChamDiem - these fields exist in BaiNop table
        // baiTap.setTuDongNop(dto.getTuDongNop());
        // baiTap.setCheDoChamDiem(dto.getCheDoChamDiem());
        baiTap.setCanhBao(dto.getCanhBao());
        baiTap.setNoiDungJson(serializeQuestions(dto.getQuestions()));
    }

    private String serializeQuestions(List<AssignmentQuestionDTO> questions) {
        if (questions == null || questions.isEmpty()) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(questions);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Không thể lưu danh sách câu hỏi: " + e.getOriginalMessage(), e);
        }
    }

    private List<AssignmentQuestionDTO> deserializeQuestions(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<List<AssignmentQuestionDTO>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Không thể đọc dữ liệu câu hỏi: " + e.getMessage(), e);
        }
    }
    private BuoiHocChiTiet resolveBuoiHocReference(BaiTapDTO dto) {
        if (dto.getIdBh() != null) {
            return buoiHocChiTietRepository.findById(dto.getIdBh())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy buổi học với mã " + dto.getIdBh()));
        }

        if (dto.getIdLh() != null) {
            return buoiHocChiTietRepository.findFirstByLopHoc_IdLhOrderByNgayHocAsc(dto.getIdLh())
                    .orElseThrow(() -> new RuntimeException("Lớp học chưa có lịch buổi học. Vui lòng tạo buổi học trước khi giao bài."));
        }

        return null;
    }
}

