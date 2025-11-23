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
        baiTap.setChoPhepLamLai(baiTapDTO.getChoPhepLamLai());
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
        baiTap.setChoPhepLamLai(baiTapDTO.getChoPhepLamLai());
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
                String idBt = saved.getBaiTap() != null ? saved.getBaiTap().getIdBt() : null;
                String loaiBt = saved.getBaiTap() != null ? saved.getBaiTap().getLoaiBt() : null;
                
                if (loaiBt == null) {
                    return convertBaiNopToDTO(saved);
                }
                
                // Find all submissions of this student for this assignment
                List<BaiNop> allSubmissions = idBt != null 
                    ? baiNopRepository.findAllByBaiTapAndHocSinh(idBt, idHs)
                    : Collections.emptyList();
                
                // Filter only graded submissions (have score and status is DA_CHAM or GRADED_AUTO)
                List<BaiNop> gradedSubmissions = allSubmissions.stream()
                    .filter(bn -> bn.getDiemSo() != null 
                        && (bn.getTrangThai() != null && 
                            (bn.getTrangThai().equals("DA_CHAM") || bn.getTrangThai().equals("GRADED_AUTO"))))
                    .collect(Collectors.toList());
                
                // Calculate average score if multiple submissions, otherwise use single score
                BigDecimal finalScore;
                if (gradedSubmissions.size() > 1) {
                    // Calculate average of all graded submissions
                    BigDecimal sum = gradedSubmissions.stream()
                        .map(BaiNop::getDiemSo)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                    finalScore = sum.divide(BigDecimal.valueOf(gradedSubmissions.size()), 2, java.math.RoundingMode.HALF_UP);
                } else if (gradedSubmissions.size() == 1) {
                    // Use the single score
                    finalScore = gradedSubmissions.get(0).getDiemSo();
                } else {
                    // Fallback to current score if no graded submissions found (shouldn't happen)
                    finalScore = diemSo;
                }
                
                // Find or create KetQuaHocTap
                List<KetQuaHocTap> existing = ketQuaHocTapRepository.findByHocSinhId(idHs);
                KetQuaHocTap ketQua = existing.isEmpty() ? null : existing.get(0);
                
                if (ketQua == null) {
                    ketQua = new KetQuaHocTap();
                    ketQua.setIdKq("KQ" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    ketQua.setIdHs(idHs);
                    ketQua.setDiemSo("0,0,0");
                    ketQua.setXepLoai("Chưa có");
                }
                
                // Parse current DiemSo string (format: "8.5,8,9")
                String[] diemParts = ketQua.getDiemSo() != null ? ketQua.getDiemSo().split(",") : new String[]{"0", "0", "0"};
                if (diemParts.length != 3) {
                    diemParts = new String[]{"0", "0", "0"};
                }
                
                // Update based on loaiBt using the calculated final score
                // KIEM_TRA_15P -> index 0, KIEM_TRA_45P -> index 1, THI_HK -> index 2
                if (loaiBt.equals("KIEM_TRA_15P")) {
                    diemParts[0] = finalScore.toString();
                } else if (loaiBt.equals("KIEM_TRA_45P")) {
                    diemParts[1] = finalScore.toString();
                } else if (loaiBt.equals("THI_HK")) {
                    diemParts[2] = finalScore.toString();
                }
                
                // Reconstruct DiemSo string
                ketQua.setDiemSo(String.join(",", diemParts));
                
                // Calculate average and classification
                BigDecimal diem15 = parseScore(diemParts[0]);
                BigDecimal diem45 = parseScore(diemParts[1]);
                BigDecimal diemHK = parseScore(diemParts[2]);
                BigDecimal diemTB = tinhDiemTrungBinh(diem15, diem45, diemHK);
                ketQua.setDiemTB(diemTB);
                ketQua.setXepLoai(xepLoai(diemTB));
                
                ketQuaHocTapRepository.save(ketQua);
            } catch (Exception e) {
                System.err.println("Error saving to KetQuaHocTap: " + e.getMessage());
                e.printStackTrace();
                // Don't fail the entire operation if KetQuaHocTap save fails
            }
        }
        
        return convertBaiNopToDTO(saved);
    }
    
    private BigDecimal parseScore(String scoreStr) {
        try {
            if (scoreStr == null || scoreStr.trim().isEmpty() || scoreStr.equals("0")) {
                return null;
            }
            return new BigDecimal(scoreStr.trim());
        } catch (Exception e) {
            return null;
        }
    }
    
    private BigDecimal tinhDiemTrungBinh(BigDecimal diem15Phut, BigDecimal diem45Phut, BigDecimal diemThiHK) {
        int count = 0;
        BigDecimal tong = BigDecimal.ZERO;
        
        if (diem15Phut != null) {
            tong = tong.add(diem15Phut.multiply(BigDecimal.valueOf(0.2)));
            count++;
        }
        if (diem45Phut != null) {
            tong = tong.add(diem45Phut.multiply(BigDecimal.valueOf(0.3)));
            count++;
        }
        if (diemThiHK != null) {
            tong = tong.add(diemThiHK.multiply(BigDecimal.valueOf(0.5)));
            count++;
        }
        
        if (count == 0) {
            return null;
        }
        
        return tong.setScale(2, java.math.RoundingMode.HALF_UP);
    }
    
    private String xepLoai(BigDecimal diemTB) {
        if (diemTB == null) {
            return "Chưa có";
        }
        
        if (diemTB.compareTo(BigDecimal.valueOf(8.0)) >= 0) {
            return "Giỏi";
        } else if (diemTB.compareTo(BigDecimal.valueOf(6.5)) >= 0) {
            return "Khá";
        } else if (diemTB.compareTo(BigDecimal.valueOf(5.0)) >= 0) {
            return "Trung bình";
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
            dto.setChoPhepLamLai(baiTap.getChoPhepLamLai());
        } catch (Exception e) {
            System.out.println("Warning: Could not get choPhepLamLai for BaiTap " + baiTap.getIdBt() + ": " + e.getMessage());
            dto.setChoPhepLamLai(false);
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

