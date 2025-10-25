package com.mathbridge.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tutors")
public class Tutor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "qualifications", columnDefinition = "TEXT")
    private String qualifications;
    
    @Column(name = "experience_years")
    private Integer experienceYears;
    
    @Column(name = "specializations", columnDefinition = "TEXT")
    private String specializations; // JSON string of specializations
    
    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;
    
    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "rating")
    private Double rating = 0.0;
    
    @Column(name = "total_reviews")
    private Integer totalReviews = 0;
    
    @Column(name = "available_online")
    private Boolean availableOnline = true;
    
    @Column(name = "available_offline")
    private Boolean availableOffline = true;
    
    // Constructors
    public Tutor() {}
    
    public Tutor(User user, String qualifications, Integer experienceYears, BigDecimal hourlyRate) {
        this.user = user;
        this.qualifications = qualifications;
        this.experienceYears = experienceYears;
        this.hourlyRate = hourlyRate;
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
    
    public String getQualifications() {
        return qualifications;
    }
    
    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }
    
    public Integer getExperienceYears() {
        return experienceYears;
    }
    
    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }
    
    public String getSpecializations() {
        return specializations;
    }
    
    public void setSpecializations(String specializations) {
        this.specializations = specializations;
    }
    
    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }
    
    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public Double getRating() {
        return rating;
    }
    
    public void setRating(Double rating) {
        this.rating = rating;
    }
    
    public Integer getTotalReviews() {
        return totalReviews;
    }
    
    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }
    
    public Boolean getAvailableOnline() {
        return availableOnline;
    }
    
    public void setAvailableOnline(Boolean availableOnline) {
        this.availableOnline = availableOnline;
    }
    
    public Boolean getAvailableOffline() {
        return availableOffline;
    }
    
    public void setAvailableOffline(Boolean availableOffline) {
        this.availableOffline = availableOffline;
    }
}
