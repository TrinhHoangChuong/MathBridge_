// package com.mathbridge.controller.portaltutor;

// import com.mathbridge.dto.portaltutor.TuAssignedStudentResponseDTO;
// import com.mathbridge.entity.NhanVien;
// import com.mathbridge.repository.NhanVienRepository;
// import com.mathbridge.service.portaltutor.TuAssignedStudentService;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;
// import java.util.Optional;

// @RestController
// @RequestMapping("/api/portal/tutor/assigned-students")
// @CrossOrigin(origins = "*")
// public class TuAssignedStudentController {
    
//     private final TuAssignedStudentService assignedStudentService;
//     private final NhanVienRepository nhanVienRepository;
    
//     public TuAssignedStudentController(TuAssignedStudentService assignedStudentService,
//                                        NhanVienRepository nhanVienRepository) {
//         this.assignedStudentService = assignedStudentService;
//         this.nhanVienRepository = nhanVienRepository;
//     }
    
//     /**
//      * Lấy ID_NV từ ID_TK (TaiKhoan)
//      */
//     @GetMapping("/tutor-id")
//     public ResponseEntity<Map<String, String>> getTutorId(@RequestParam(required = false) String idTk) {
//         try {
//             Map<String, String> response = new HashMap<>();
            
//             if (idTk == null || idTk.trim().isEmpty()) {
//                 response.put("idNv", null);
//                 response.put("error", "ID_TK không được để trống");
//                 return ResponseEntity.badRequest().body(response);
//             }
            
//             Optional<NhanVien> nhanVienOpt = nhanVienRepository.findByTaiKhoan_IdTk(idTk);
//             if (nhanVienOpt.isPresent()) {
//                 response.put("idNv", nhanVienOpt.get().getIdNv());
//                 return ResponseEntity.ok(response);
//             } else {
//                 response.put("idNv", null);
//                 response.put("error", "Không tìm thấy nhân viên với ID_TK: " + idTk);
//                 return ResponseEntity.notFound().build();
//             }
//         } catch (Exception e) {
//             e.printStackTrace();
//             Map<String, String> response = new HashMap<>();
//             response.put("error", "Lỗi khi lấy ID_NV: " + e.getMessage());
//             return ResponseEntity.internalServerError().body(response);
//         }
//     }
    
//     /**
//      * Lấy danh sách học sinh đang được phân công cho cố vấn
//      * Query param: idNv (ID của cố vấn)
//      * Nếu không có idNv, trả về tất cả (hoặc có thể lấy từ token/session)
//      */
//     @GetMapping
//     public ResponseEntity<List<TuAssignedStudentResponseDTO>> getAssignedStudents(
//             @RequestParam(required = false) String idNv,
//             @RequestParam(required = false, defaultValue = "active") String filter) {
//         try {
//             List<TuAssignedStudentResponseDTO> students;
            
//             if (idNv == null || idNv.trim().isEmpty()) {
//                 // Nếu không có idNv, có thể trả về empty list hoặc lấy từ token
//                 // Tạm thời trả về empty list
//                 return ResponseEntity.ok(List.of());
//             }
            
//             // Lọc theo filter
//             if ("all".equalsIgnoreCase(filter)) {
//                 students = assignedStudentService.getAllAssignedStudents(idNv);
//             } else if ("active".equalsIgnoreCase(filter)) {
//                 students = assignedStudentService.getActiveAssignedStudents(idNv);
//             } else {
//                 // Lọc theo trạng thái cụ thể
//                 students = assignedStudentService.getAssignedStudentsByStatus(idNv, filter);
//             }
            
//             return ResponseEntity.ok(students);
//         } catch (Exception e) {
//             e.printStackTrace();
//             return ResponseEntity.internalServerError().build();
//         }
//     }
    
//     /**
//      * Lấy số lượng học sinh đang được phân công
//      */
//     @GetMapping("/count")
//     public ResponseEntity<Long> getAssignedStudentsCount(@RequestParam(required = false) String idNv) {
//         try {
//             if (idNv == null || idNv.trim().isEmpty()) {
//                 return ResponseEntity.ok(0L);
//             }
            
//             Long count = assignedStudentService.countActiveAssignedStudents(idNv);
//             return ResponseEntity.ok(count);
//         } catch (Exception e) {
//             e.printStackTrace();
//             return ResponseEntity.internalServerError().build();
//         }
//     }
// }

