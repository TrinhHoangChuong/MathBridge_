package com.mathbridge.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "parent_name")
    private String parentName;
    
    @Column(name = "parent_phone")
    private String parentPhone;
    
    @Column(name = "grade_level")
    private String gradeLevel;
    
    @Column(name = "curriculum")
    private String curriculum; // Cambridge, IB, AP, etc.
    
    @Column(name = "learning_preferences", columnDefinition = "TEXT")
    private String learningPreferences;
    
    // Constructors
    public Student() {}
    
    public Student(User user, String parentName, String parentPhone, String gradeLevel, String curriculum) {
        this.user = user;
        this.parentName = parentName;
        this.parentPhone = parentPhone;
        this.gradeLevel = gradeLevel;
        this.curriculum = curriculum;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getParentName() {
        return parentName;
    }
    
    public void setParentName(String parentName) {
        this.parentName = parentName;
    }
    
    public String getParentPhone() {
        return parentPhone;
    }
    
    public void setParentPhone(String parentPhone) {
        this.parentPhone = parentPhone;
    }
    
    public String getGradeLevel() {
        return gradeLevel;
    }
    
    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }
    
    public String getCurriculum() {
        return curriculum;
    }
    
    public void setCurriculum(String curriculum) {
        this.curriculum = curriculum;
    }
    
    public String getLearningPreferences() {
        return learningPreferences;
    }
    
    public void setLearningPreferences(String learningPreferences) {
        this.learningPreferences = learningPreferences;
    }
}
