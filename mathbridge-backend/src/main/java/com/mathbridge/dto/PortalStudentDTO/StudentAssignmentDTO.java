package com.mathbridge.dto.PortalStudentDTO;

public class StudentAssignmentDTO {
    private String assignmentId;
    private String title;
    private String description;
    private String className;
    private String dueDate;
    private String status;
    private Double grade;
    private String submittedAt;
    private String gradedAt;
    private String feedback;

    // Constructors
    public StudentAssignmentDTO() {}

    // Getters and Setters
    public String getAssignmentId() { return assignmentId; }
    public void setAssignmentId(String assignmentId) { this.assignmentId = assignmentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getGrade() { return grade; }
    public void setGrade(Double grade) { this.grade = grade; }

    public String getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }

    public String getGradedAt() { return gradedAt; }
    public void setGradedAt(String gradedAt) { this.gradedAt = gradedAt; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}