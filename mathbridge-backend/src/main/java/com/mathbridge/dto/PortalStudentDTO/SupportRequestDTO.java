package com.mathbridge.dto.PortalStudentDTO;

import java.time.LocalDateTime;

public class SupportRequestDTO {
    private String id;
    private String type;
    private String title;
    private String description;
    private String classId;
    private String className;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private String response;
    private String fileUrl;

    // Constructors
    public SupportRequestDTO() {}

    public SupportRequestDTO(String id, String type, String title, String description,
                           String classId, String className, String status,
                           LocalDateTime createdAt, LocalDateTime respondedAt,
                           String response, String fileUrl) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.classId = classId;
        this.className = className;
        this.status = status;
        this.createdAt = createdAt;
        this.respondedAt = respondedAt;
        this.response = response;
        this.fileUrl = fileUrl;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
}