//package com.mathbridge.controller;
//
//import com.mathbridge.dto.*;
//import com.mathbridge.service.*;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.math.BigDecimal;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/public/giaovien")
//@CrossOrigin(origins = "*")
//public class GiaoVienController {
//
//    private final HocSinhLopHocService hocSinhLopHocService;
//    private final BaiTapService baiTapService;
//    private final DiemSoService diemSoService;
//    private final BuoiHocChiTietService buoiHocChiTietService;
//
//    public GiaoVienController(HocSinhLopHocService hocSinhLopHocService,
//                              BaiTapService baiTapService,
//                              DiemSoService diemSoService,
//                              BuoiHocChiTietService buoiHocChiTietService) {
//        this.hocSinhLopHocService = hocSinhLopHocService;
//        this.baiTapService = baiTapService;
//        this.diemSoService = diemSoService;
//        this.buoiHocChiTietService = buoiHocChiTietService;
//    }
//
//    // ===== HỌC SINH =====
//    @GetMapping("/lophoc/{idLh}/hocsinh")
//    public ResponseEntity<List<HocSinhLopHocDTO>> getHocSinhByLopHoc(@PathVariable String idLh) {
//        List<HocSinhLopHocDTO> hocSinhs = hocSinhLopHocService.getHocSinhByLopHoc(idLh);
//        return ResponseEntity.ok(hocSinhs);
//    }
//
//    // ===== BÀI TẬP =====
//    @GetMapping("/lophoc/{idLh}/baitap")
//    public ResponseEntity<List<BaiTapDTO>> getBaiTapByLopHoc(@PathVariable String idLh) {
//        List<BaiTapDTO> baiTaps = baiTapService.getBaiTapByLopHoc(idLh);
//        return ResponseEntity.ok(baiTaps);
//    }
//
//    @GetMapping("/{idNv}/baitap")
//    public ResponseEntity<List<BaiTapDTO>> getBaiTapByGiaoVien(@PathVariable String idNv) {
//        List<BaiTapDTO> baiTaps = baiTapService.getBaiTapByGiaoVien(idNv);
//        return ResponseEntity.ok(baiTaps);
//    }
//
//    @PostMapping("/baitap")
//    public ResponseEntity<BaiTapDTO> createBaiTap(@RequestBody BaiTapDTO baiTapDTO) {
//        BaiTapDTO created = baiTapService.createBaiTap(baiTapDTO);
//        return ResponseEntity.status(HttpStatus.CREATED).body(created);
//    }
//
//    @PutMapping("/baitap/{idBt}")
//    public ResponseEntity<BaiTapDTO> updateBaiTap(@PathVariable String idBt,
//                                                   @RequestBody BaiTapDTO baiTapDTO) {
//        BaiTapDTO updated = baiTapService.updateBaiTap(idBt, baiTapDTO);
//        return ResponseEntity.ok(updated);
//    }
//
//    @DeleteMapping("/baitap/{idBt}")
//    public ResponseEntity<Void> deleteBaiTap(@PathVariable String idBt) {
//        baiTapService.deleteBaiTap(idBt);
//        return ResponseEntity.noContent().build();
//    }
//
//    @GetMapping("/baitap/{idBt}/bainop")
//    public ResponseEntity<List<BaiNopDTO>> getBaiNopByBaiTap(@PathVariable String idBt) {
//        List<BaiNopDTO> baiNops = baiTapService.getBaiNopByBaiTap(idBt);
//        return ResponseEntity.ok(baiNops);
//    }
//
//    @PutMapping("/bainop/{idBn}/chamdiem")
//    public ResponseEntity<BaiNopDTO> chamDiemBaiNop(@PathVariable String idBn,
//                                                    @RequestParam BigDecimal diemSo,
//                                                    @RequestParam(required = false) String nhanXet) {
//        BaiNopDTO updated = baiTapService.chamDiemBaiNop(idBn, diemSo, nhanXet);
//        return ResponseEntity.ok(updated);
//    }
//
//    // ===== ĐIỂM SỐ =====
//    @GetMapping("/lophoc/{idLh}/diemso")
//    public ResponseEntity<List<DiemSoDTO>> getDiemSoByLopHoc(@PathVariable String idLh) {
//        List<DiemSoDTO> diemSos = diemSoService.getDiemSoByLopHoc(idLh);
//        return ResponseEntity.ok(diemSos);
//    }
//
//    @PutMapping("/lophoc/{idLh}/hocsinh/{idHs}/diemso")
//    public ResponseEntity<DiemSoDTO> updateDiemSo(@PathVariable String idLh,
//                                                   @PathVariable String idHs,
//                                                   @RequestParam String loaiDiem,
//                                                   @RequestParam BigDecimal diemSo) {
//        DiemSoDTO updated = diemSoService.updateDiemSo(idHs, idLh, loaiDiem, diemSo);
//        return ResponseEntity.ok(updated);
//    }
//
//    @GetMapping("/lophoc/{idLh}/diemso/export")
//    public ResponseEntity<String> exportBaoCaoDiemSo(@PathVariable String idLh) {
//        diemSoService.exportBaoCaoDiemSo(idLh);
//        return ResponseEntity.ok("Báo cáo đã được xuất");
//    }
//
//    // ===== LỊCH DẠY =====
//    @GetMapping("/lophoc/{idLh}/buoihoc")
//    public ResponseEntity<List<BuoiHocChiTietDTO>> getBuoiHocByLopHoc(@PathVariable String idLh) {
//        List<BuoiHocChiTietDTO> buoiHocs = buoiHocChiTietService.getBuoiHocByLopHoc(idLh);
//        return ResponseEntity.ok(buoiHocs);
//    }
//
//    @GetMapping("/{idNv}/buoihoc")
//    public ResponseEntity<List<BuoiHocChiTietDTO>> getBuoiHocByGiaoVien(@PathVariable String idNv) {
//        List<BuoiHocChiTietDTO> buoiHocs = buoiHocChiTietService.getBuoiHocByGiaoVien(idNv);
//        return ResponseEntity.ok(buoiHocs);
//    }
//
//    @PostMapping("/buoihoc")
//    public ResponseEntity<BuoiHocChiTietDTO> createBuoiHoc(@RequestBody BuoiHocChiTietDTO dto) {
//        BuoiHocChiTietDTO created = buoiHocChiTietService.createBuoiHoc(dto);
//        return ResponseEntity.status(HttpStatus.CREATED).body(created);
//    }
//
//    @PutMapping("/buoihoc/{idBh}")
//    public ResponseEntity<BuoiHocChiTietDTO> updateBuoiHoc(@PathVariable String idBh,
//                                                            @RequestBody BuoiHocChiTietDTO dto) {
//        BuoiHocChiTietDTO updated = buoiHocChiTietService.updateBuoiHoc(idBh, dto);
//        return ResponseEntity.ok(updated);
//    }
//
//    @DeleteMapping("/buoihoc/{idBh}")
//    public ResponseEntity<Void> deleteBuoiHoc(@PathVariable String idBh) {
//        buoiHocChiTietService.deleteBuoiHoc(idBh);
//        return ResponseEntity.noContent().build();
//    }
//}
//
