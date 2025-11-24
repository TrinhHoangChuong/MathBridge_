package com.mathbridge.dto.portalteacher;

import com.mathbridge.dto.BaiTapDTO;

import java.util.ArrayList;
import java.util.List;

public class TeacherSessionDetailDTO {
    private TeacherScheduleItemDTO session;
    private List<TeacherSessionEvaluationDTO> sessionEvaluations = new ArrayList<>();
    private List<BaiTapDTO> assignments = new ArrayList<>();
    private List<TeacherClassEvaluationDTO> classEvaluations = new ArrayList<>();

    public TeacherScheduleItemDTO getSession() {
        return session;
    }

    public void setSession(TeacherScheduleItemDTO session) {
        this.session = session;
    }

    public List<TeacherSessionEvaluationDTO> getSessionEvaluations() {
        return sessionEvaluations;
    }

    public void setSessionEvaluations(List<TeacherSessionEvaluationDTO> sessionEvaluations) {
        this.sessionEvaluations = sessionEvaluations;
    }

    public List<BaiTapDTO> getAssignments() {
        return assignments;
    }

    public void setAssignments(List<BaiTapDTO> assignments) {
        this.assignments = assignments;
    }

    public List<TeacherClassEvaluationDTO> getClassEvaluations() {
        return classEvaluations;
    }

    public void setClassEvaluations(List<TeacherClassEvaluationDTO> classEvaluations) {
        this.classEvaluations = classEvaluations;
    }
}

