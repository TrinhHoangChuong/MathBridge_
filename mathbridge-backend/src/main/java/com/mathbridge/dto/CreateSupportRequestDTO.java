package com.mathbridge.dto;

public class CreateSupportRequestDTO {
    private String type;
    private String title;
    private String description;
    private String classId;
    private String fileUrl;

    // Constructors
    public CreateSupportRequestDTO() {}

    public CreateSupportRequestDTO(String type, String title, String description, String classId, String fileUrl) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.classId = classId;
        this.fileUrl = fileUrl;
    }

    // Getters and Setters
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

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
}