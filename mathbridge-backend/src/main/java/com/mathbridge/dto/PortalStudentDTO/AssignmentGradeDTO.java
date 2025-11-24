package com.mathbridge.dto.PortalStudentDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentGradeDTO {
    private String assignmentId;
    private String assignmentTitle;
    private Double grade;
    private String gradedAt;
    private String feedback;
}

