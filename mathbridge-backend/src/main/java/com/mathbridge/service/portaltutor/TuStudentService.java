package com.mathbridge.service.portaltutor;

import com.mathbridge.dto.PortalStudentDTO.StudentDashboardDTO;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.repository.HocSinhRepository;
import com.mathbridge.service.PortalStudent.StudentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class TuStudentService {

    private final TuAssignedStudentService assignedStudentService;
    private final StudentService studentService;
    private final HocSinhRepository hocSinhRepository;

    public TuStudentService(TuAssignedStudentService assignedStudentService,
            StudentService studentService,
            HocSinhRepository hocSinhRepository) {
        this.assignedStudentService = assignedStudentService;
        this.studentService = studentService;
        this.hocSinhRepository = hocSinhRepository;
    }

    /**
     * Trả về StudentDashboardDTO cho tutor nếu tutor đang phụ trách học sinh
     */
    @Transactional(readOnly = true)
    public StudentDashboardDTO getStudentDashboardForTutor(String idNv, String idHs) {
        if (!assignedStudentService.isTutorAssignedToStudent(idNv, idHs)) {
            throw new SecurityException("Tutor not assigned to this student");
        }

        // Get HocSinh to find account id (idTk) which StudentService expects
        Optional<HocSinh> hsOpt = hocSinhRepository.findById(idHs);
        if (!hsOpt.isPresent()) {
            throw new RuntimeException("Student not found: " + idHs);
        }

        HocSinh hs = hsOpt.get();
        String idTk = hs.getIdTk();

        // Delegate to existing StudentService which builds dashboard by account id
        return studentService.getStudentDashboard(idTk);
    }
}
