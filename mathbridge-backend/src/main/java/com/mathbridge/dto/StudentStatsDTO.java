package com.mathbridge.dto;

public class StudentStatsDTO {
    private int totalClasses;
    private int pendingAssignments;
    private double averageGrade;
    private int todayClasses;
    private int totalAssignments;
    private int completedAssignments;
    private int totalGrades;
    private int attendanceRate;
    private double gradeTrend;
    private double recentAverage;

    // Constructors
    public StudentStatsDTO() {}

    public StudentStatsDTO(int totalClasses, int pendingAssignments, double averageGrade,
                          int todayClasses, int totalAssignments, int completedAssignments,
                          int totalGrades, int attendanceRate, double gradeTrend, double recentAverage) {
        this.totalClasses = totalClasses;
        this.pendingAssignments = pendingAssignments;
        this.averageGrade = averageGrade;
        this.todayClasses = todayClasses;
        this.totalAssignments = totalAssignments;
        this.completedAssignments = completedAssignments;
        this.totalGrades = totalGrades;
        this.attendanceRate = attendanceRate;
        this.gradeTrend = gradeTrend;
        this.recentAverage = recentAverage;
    }

    // Getters and Setters
    public int getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(int totalClasses) {
        this.totalClasses = totalClasses;
    }

    public int getPendingAssignments() {
        return pendingAssignments;
    }

    public void setPendingAssignments(int pendingAssignments) {
        this.pendingAssignments = pendingAssignments;
    }

    public double getAverageGrade() {
        return averageGrade;
    }

    public void setAverageGrade(double averageGrade) {
        this.averageGrade = averageGrade;
    }

    public int getTodayClasses() {
        return todayClasses;
    }

    public void setTodayClasses(int todayClasses) {
        this.todayClasses = todayClasses;
    }

    public int getTotalAssignments() {
        return totalAssignments;
    }

    public void setTotalAssignments(int totalAssignments) {
        this.totalAssignments = totalAssignments;
    }

    public int getCompletedAssignments() {
        return completedAssignments;
    }

    public void setCompletedAssignments(int completedAssignments) {
        this.completedAssignments = completedAssignments;
    }

    public int getTotalGrades() {
        return totalGrades;
    }

    public void setTotalGrades(int totalGrades) {
        this.totalGrades = totalGrades;
    }

    public int getAttendanceRate() {
        return attendanceRate;
    }

    public void setAttendanceRate(int attendanceRate) {
        this.attendanceRate = attendanceRate;
    }

    public double getGradeTrend() {
        return gradeTrend;
    }

    public void setGradeTrend(double gradeTrend) {
        this.gradeTrend = gradeTrend;
    }

    public double getRecentAverage() {
        return recentAverage;
    }

    public void setRecentAverage(double recentAverage) {
        this.recentAverage = recentAverage;
    }
}