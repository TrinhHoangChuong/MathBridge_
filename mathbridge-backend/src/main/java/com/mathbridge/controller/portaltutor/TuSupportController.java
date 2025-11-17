// package com.mathbridge.controller.portaltutor;

// import com.mathbridge.dto.portaltutor.TuUpdateSupportStatusRequestDTO;
// import com.mathbridge.dto.portaltutor.TuYeuCauHoTroResponseDTO;
// import com.mathbridge.service.portaltutor.TuSupportService;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// @RestController
// @RequestMapping("/api/portal/tutor/support")
// @CrossOrigin(origins = "*")
// public class TuSupportController {

//     private final TuSupportService supportService;

//     public TuSupportController(TuSupportService supportService) {
//         this.supportService = supportService;
//     }

//     // Lấy tất cả yêu cầu hỗ trợ
//     @GetMapping
//     public ResponseEntity<List<TuYeuCauHoTroResponseDTO>> getAllSupportRequests() {
//         try {
//             List<TuYeuCauHoTroResponseDTO> requests = supportService.getAllSupportRequests();
//             return ResponseEntity.ok(requests);
//         } catch (Exception e) {
//             e.printStackTrace();
//             return ResponseEntity.internalServerError().build();
//         }
//     }

//     // Lấy yêu cầu hỗ trợ chưa đóng
//     @GetMapping("/open")
//     public ResponseEntity<List<TuYeuCauHoTroResponseDTO>> getOpenSupportRequests() {
//         try {
//             List<TuYeuCauHoTroResponseDTO> requests = supportService.getOpenSupportRequests();
//             return ResponseEntity.ok(requests);
//         } catch (Exception e) {
//             e.printStackTrace();
//             return ResponseEntity.internalServerError().build();
//         }
//     }

//     // Lấy yêu cầu hỗ trợ theo trạng thái
//     @GetMapping("/status/{trangThai}")
//     public ResponseEntity<List<TuYeuCauHoTroResponseDTO>> getSupportRequestsByStatus(
//             @PathVariable String trangThai) {
//         try {
//             List<TuYeuCauHoTroResponseDTO> requests = supportService.getSupportRequestsByStatus(trangThai);
//             return ResponseEntity.ok(requests);
//         } catch (Exception e) {
//             e.printStackTrace();
//             return ResponseEntity.internalServerError().build();
//         }
//     }

//     // Lấy yêu cầu hỗ trợ theo học sinh
//     @GetMapping("/student/{idHs}")
//     public ResponseEntity<List<TuYeuCauHoTroResponseDTO>> getSupportRequestsByStudent(
//             @PathVariable String idHs) {
//         try {
//             List<TuYeuCauHoTroResponseDTO> requests = supportService.getSupportRequestsByStudent(idHs);
//             return ResponseEntity.ok(requests);
//         } catch (Exception e) {
//             e.printStackTrace();
//             return ResponseEntity.internalServerError().build();
//         }
//     }

//     // Lấy chi tiết yêu cầu hỗ trợ theo ID
//     @GetMapping("/{idYc}")
//     public ResponseEntity<TuYeuCauHoTroResponseDTO> getSupportRequestById(@PathVariable String idYc) {
//         try {
//             TuYeuCauHoTroResponseDTO request = supportService.getSupportRequestById(idYc);
//             return ResponseEntity.ok(request);
//         } catch (RuntimeException e) {
//             return ResponseEntity.notFound().build();
//         } catch (Exception e) {
//             e.printStackTrace();
//             return ResponseEntity.internalServerError().build();
//         }
//     }

//     // Cập nhật trạng thái yêu cầu hỗ trợ
//     @PutMapping("/{idYc}/status")
//     public ResponseEntity<TuYeuCauHoTroResponseDTO> updateSupportStatus(
//             @PathVariable String idYc,
//             @RequestBody TuUpdateSupportStatusRequestDTO request) {
//         try {
//             TuYeuCauHoTroResponseDTO updated = supportService.updateSupportStatus(idYc, request);
//             return ResponseEntity.ok(updated);
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest().build();
//         } catch (Exception e) {
//             e.printStackTrace();
//             return ResponseEntity.internalServerError().build();
//         }
//     }
// }

