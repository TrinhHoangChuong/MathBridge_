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
    private Integer durationMinutes;
    private Boolean autoSubmit;
    private String warningMessage;
    private Boolean requiresManualReview;
    private String submissionId;
    private String startedAt;
    private String expiresAt;
    private Boolean allowRetry;
    private Boolean canRetry;
    private Integer attemptCount;

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

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Boolean getAutoSubmit() {
        return autoSubmit;
    }

    public void setAutoSubmit(Boolean autoSubmit) {
        this.autoSubmit = autoSubmit;
    }

    public String getWarningMessage() {
        return warningMessage;
    }

    public void setWarningMessage(String warningMessage) {
        this.warningMessage = warningMessage;
    }

    public Boolean getRequiresManualReview() {
        return requiresManualReview;
    }

    public void setRequiresManualReview(Boolean requiresManualReview) {
        this.requiresManualReview = requiresManualReview;
    }

    public String getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(String submissionId) {
        this.submissionId = submissionId;
    }

    public String getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(String startedAt) {
        this.startedAt = startedAt;
    }

    public String getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(String expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Boolean getAllowRetry() {
        return allowRetry;
    }

    public void setAllowRetry(Boolean allowRetry) {
        this.allowRetry = allowRetry;
    }

    public Boolean getCanRetry() {
        return canRetry;
    }

    public void setCanRetry(Boolean canRetry) {
        this.canRetry = canRetry;
    }

    public Integer getAttemptCount() {
        return attemptCount;
    }

    public void setAttemptCount(Integer attemptCount) {
        this.attemptCount = attemptCount;
    }
}