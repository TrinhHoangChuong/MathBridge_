package com.mathbridge.dto.PortalStudentDTO;

public class RateClassDTO {
    private String registrationId; // ID từ registration (ID_HS_ID_LH format)
    private Integer rating; // 1-5 sao, 5 sao = 5 điểm
    private String comment; // Nhận xét đánh giá

    // Getters and Setters
    public String getRegistrationId() {
        return registrationId;
    }

    public void setRegistrationId(String registrationId) {
        this.registrationId = registrationId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}

