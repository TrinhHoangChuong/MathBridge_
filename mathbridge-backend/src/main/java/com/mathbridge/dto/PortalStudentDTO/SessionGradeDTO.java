package com.mathbridge.dto.PortalStudentDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SessionGradeDTO {
    private String sessionId;
    private String sessionNumber;
    private String sessionDate;
    private String className;
    private String classId;
    private List<AssignmentGradeDTO> assignmentGrades;
    private Double averageAssignmentGrade;
    private Double teacherGrade;
    private Double finalGrade;
}

