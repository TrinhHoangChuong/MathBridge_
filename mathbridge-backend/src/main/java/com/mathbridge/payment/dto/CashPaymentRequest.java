package com.mathbridge.payment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class CashPaymentRequest {

    @NotBlank(message = "courseId là bắt buộc")
    private String courseId;

    @Min(value = 1, message = "Số tháng phải >= 1")
    private int months = 1;

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public int getMonths() {
        return months;
    }

    public void setMonths(int months) {
        this.months = months;
    }
}

