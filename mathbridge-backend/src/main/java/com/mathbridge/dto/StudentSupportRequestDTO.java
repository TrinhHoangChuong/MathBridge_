package com.mathbridge.dto;

public class StudentSupportRequestDTO {
    private String id;
    private String type;
    private String title;
    private String description;
    private String className;
    private String status;
    private String createdAt;
    private String response;
    private String respondedAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public String getRespondedAt() { return respondedAt; }
    public void setRespondedAt(String respondedAt) { this.respondedAt = respondedAt; }
}