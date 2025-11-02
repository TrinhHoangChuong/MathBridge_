package com.mathbridge.dto;

/**
 * DTO cho response đăng ký khóa học
 */
public class DangKyLHResponse {
    private String registrationId;
    private String studentId;
    private String email;
    private String password;

    public DangKyLHResponse() {}

    public DangKyLHResponse(String registrationId, String studentId, String email) {
        this.registrationId = registrationId;
        this.studentId = studentId;
        this.email = email;
    }

    public DangKyLHResponse(String registrationId, String studentId, String email, String password) {
        this.registrationId = registrationId;
        this.studentId = studentId;
        this.email = email;
        this.password = password;
    }

    public String getRegistrationId() { return registrationId; }
    public void setRegistrationId(String registrationId) { this.registrationId = registrationId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

