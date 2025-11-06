package com.mathbridge.dto;

import java.time.LocalDateTime;

public class StudentAssignmentDTO {
    private String assignmentId;
    private String title;
    private String description;
    private String className;
    private LocalDateTime dueDate;
    private String status; // "pending", "submitted", "graded"
    private Double grade;
    private String feedback;
    private LocalDateTime submittedAt;
    private LocalDateTime gradedAt;

    public StudentAssignmentDTO() {}

    public StudentAssignmentDTO(String assignmentId, String title, String description,
                               String className, LocalDateTime dueDate, String status,
                               Double grade, String feedback, LocalDateTime submittedAt,
                               LocalDateTime gradedAt) {
        this.assignmentId = assignmentId;
        this.title = title;
        this.description = description;
        this.className = className;
        this.dueDate = dueDate;
        this.status = status;
        this.grade = grade;
        this.feedback = feedback;
        this.submittedAt = submittedAt;
        this.gradedAt = gradedAt;
    }

    // Getters and Setters
    public String getAssignmentId() { return assignmentId; }
    public void setAssignmentId(String assignmentId) { this.assignmentId = assignmentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getGrade() { return grade; }
    public void setGrade(Double grade) { this.grade = grade; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }
}