package com.mathbridge.dto;

import java.util.List;

public class StudentDashboardDTO {
    private String studentId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private Boolean gender;
    private List<StudentClassDTO> classes;
    private List<StudentAssignmentDTO> assignments;
    private List<StudentGradeDTO> grades;
    private List<StudentMessageDTO> messages;
    private StudentStatsDTO stats;
    private List<StudentRegistrationDTO> registrations;
    private List<StudentAttendedClassDTO> attendedClasses;
    private List<StudentSupportRequestDTO> supportRequests;

    // Constructors
    public StudentDashboardDTO() {}

    public StudentDashboardDTO(String studentId, String fullName, String email, String phone,
                              String address, Boolean gender, List<StudentClassDTO> classes,
                              List<StudentAssignmentDTO> assignments, List<StudentGradeDTO> grades,
                              List<StudentMessageDTO> messages, StudentStatsDTO stats,
                              List<StudentRegistrationDTO> registrations,
                              List<StudentAttendedClassDTO> attendedClasses,
                              List<StudentSupportRequestDTO> supportRequests) {
        this.studentId = studentId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.gender = gender;
        this.classes = classes;
        this.assignments = assignments;
        this.grades = grades;
        this.messages = messages;
        this.stats = stats;
        this.registrations = registrations;
        this.attendedClasses = attendedClasses;
        this.supportRequests = supportRequests;
    }

    // Getters and Setters
    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Boolean getGender() {
        return gender;
    }

    public void setGender(Boolean gender) {
        this.gender = gender;
    }

    public List<StudentClassDTO> getClasses() {
        return classes;
    }

    public void setClasses(List<StudentClassDTO> classes) {
        this.classes = classes;
    }

    public List<StudentAssignmentDTO> getAssignments() {
        return assignments;
    }

    public void setAssignments(List<StudentAssignmentDTO> assignments) {
        this.assignments = assignments;
    }

    public List<StudentGradeDTO> getGrades() {
        return grades;
    }

    public void setGrades(List<StudentGradeDTO> grades) {
        this.grades = grades;
    }

    public List<StudentMessageDTO> getMessages() {
        return messages;
    }

    public void setMessages(List<StudentMessageDTO> messages) {
        this.messages = messages;
    }

    public StudentStatsDTO getStats() {
        return stats;
    }

    public void setStats(StudentStatsDTO stats) {
        this.stats = stats;
    }

    public List<StudentRegistrationDTO> getRegistrations() {
        return registrations;
    }

    public void setRegistrations(List<StudentRegistrationDTO> registrations) {
        this.registrations = registrations;
    }

    public List<StudentAttendedClassDTO> getAttendedClasses() {
        return attendedClasses;
    }

    public void setAttendedClasses(List<StudentAttendedClassDTO> attendedClasses) {
        this.attendedClasses = attendedClasses;
    }

    public List<StudentSupportRequestDTO> getSupportRequests() {
        return supportRequests;
    }

    public void setSupportRequests(List<StudentSupportRequestDTO> supportRequests) {
        this.supportRequests = supportRequests;
    }
}