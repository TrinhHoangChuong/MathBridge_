package com.mathbridge.service;

import com.mathbridge.dto.portalteacher.TeacherClassEvaluationDTO;
import com.mathbridge.dto.portalteacher.TeacherScheduleResponseDTO;
import com.mathbridge.dto.portalteacher.TeacherSessionDetailDTO;

import java.time.LocalDate;
import java.util.List;

public interface PortalTeacherService {

    TeacherScheduleResponseDTO getTeacherSchedule(String idNv, LocalDate date, int days);

    TeacherSessionDetailDTO getSessionDetail(String idBh);

    List<TeacherClassEvaluationDTO> getClassEvaluations(String idLh);
}

