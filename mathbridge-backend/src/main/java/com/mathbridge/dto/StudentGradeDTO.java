package com.mathbridge.dto;

public class StudentGradeDTO {
    private String gradeId;
    private String subject;
    private String className;
    private String gradeType;
    private double score;
    private String gradedAt;
    private String teacherName;
    private String feedback;

    // Getters and Setters
    public String getGradeId() { return gradeId; }
    public void setGradeId(String gradeId) { this.gradeId = gradeId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getGradeType() { return gradeType; }
    public void setGradeType(String gradeType) { this.gradeType = gradeType; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public String getGradedAt() { return gradedAt; }
    public void setGradedAt(String gradedAt) { this.gradedAt = gradedAt; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}