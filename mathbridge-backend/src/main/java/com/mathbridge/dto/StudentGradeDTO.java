package com.mathbridge.dto;

import java.time.LocalDateTime;

public class StudentGradeDTO {
    private String gradeId;
    private String subject;
    private String className;
    private String gradeType; // "15 phút", "1 tiết", "Thi học kỳ", etc.
    private Double score;
    private String gradeLetter; // "A", "B", "C", etc.
    private LocalDateTime gradedAt;
    private String teacherName;
    private String feedback;

    public StudentGradeDTO() {}

    public StudentGradeDTO(String gradeId, String subject, String className,
                          String gradeType, Double score, String gradeLetter,
                          LocalDateTime gradedAt, String teacherName, String feedback) {
        this.gradeId = gradeId;
        this.subject = subject;
        this.className = className;
        this.gradeType = gradeType;
        this.score = score;
        this.gradeLetter = gradeLetter;
        this.gradedAt = gradedAt;
        this.teacherName = teacherName;
        this.feedback = feedback;
    }

    // Getters and Setters
    public String getGradeId() { return gradeId; }
    public void setGradeId(String gradeId) { this.gradeId = gradeId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getGradeType() { return gradeType; }
    public void setGradeType(String gradeType) { this.gradeType = gradeType; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getGradeLetter() { return gradeLetter; }
    public void setGradeLetter(String gradeLetter) { this.gradeLetter = gradeLetter; }

    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}