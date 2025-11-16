package com.mathbridge.payment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MomoCreatePaymentRequest {
    
    @NotBlank(message = "courseId không được để trống")
    private String courseId;
    
    @NotNull(message = "months không được để trống")
    @Min(value = 1, message = "months phải >= 1")
    private Integer months;
    
    // orderId sẽ được generate tự động từ service
    // amount sẽ được tính từ course.mucGiaThang * months

    public MomoCreatePaymentRequest() {
    }

    public MomoCreatePaymentRequest(String courseId, Integer months) {
        this.courseId = courseId;
        this.months = months;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public Integer getMonths() {
        return months;
    }

    public void setMonths(Integer months) {
        this.months = months;
    }
}

