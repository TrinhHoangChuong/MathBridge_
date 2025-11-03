package com.mathbridge.dto;

import java.util.List;

public class StudentDashboardDTO {
    private String studentId;
    private String fullName;
    private String email;
    private List<StudentClassDTO> classes;
    private List<StudentAssignmentDTO> assignments;
    private List<StudentGradeDTO> grades;
    private StudentStatsDTO stats;

    public StudentDashboardDTO() {}

    public StudentDashboardDTO(String studentId, String fullName, String email,
                              List<StudentClassDTO> classes, List<StudentAssignmentDTO> assignments,
                              List<StudentGradeDTO> grades, StudentStatsDTO stats) {
        this.studentId = studentId;
        this.fullName = fullName;
        this.email = email;
        this.classes = classes;
        this.assignments = assignments;
        this.grades = grades;
        this.stats = stats;
    }

    // Getters and Setters
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<StudentClassDTO> getClasses() { return classes; }
    public void setClasses(List<StudentClassDTO> classes) { this.classes = classes; }

    public List<StudentAssignmentDTO> getAssignments() { return assignments; }
    public void setAssignments(List<StudentAssignmentDTO> assignments) { this.assignments = assignments; }

    public List<StudentGradeDTO> getGrades() { return grades; }
    public void setGrades(List<StudentGradeDTO> grades) { this.grades = grades; }

    public StudentStatsDTO getStats() { return stats; }
    public void setStats(StudentStatsDTO stats) { this.stats = stats; }
}