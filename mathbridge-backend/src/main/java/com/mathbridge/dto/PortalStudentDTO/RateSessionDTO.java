package com.mathbridge.dto.PortalStudentDTO;

public class RateSessionDTO {
    private String sessionId;
    private Integer rating; // 1-5 sao, 5 sao = 5 điểm
    private String comment; // Nhận xét đánh giá

    // Getters and Setters
    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
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

