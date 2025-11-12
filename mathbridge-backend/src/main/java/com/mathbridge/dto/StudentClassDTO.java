package com.mathbridge.dto;

public class StudentClassDTO {
    private String classId;
    private String className;
    private String teacherName;
    private String schedule;
    private String room;
    private int studentCount;
    private double averageGrade;
    private int attendancePercentage;
    private String status;

    // Constructors
    public StudentClassDTO() {}

    public StudentClassDTO(String classId, String className, String teacherName, String schedule,
                          String room, int studentCount, double averageGrade, int attendancePercentage, String status) {
        this.classId = classId;
        this.className = className;
        this.teacherName = teacherName;
        this.schedule = schedule;
        this.room = room;
        this.studentCount = studentCount;
        this.averageGrade = averageGrade;
        this.attendancePercentage = attendancePercentage;
        this.status = status;
    }

    // Getters and Setters
    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public String getSchedule() { return schedule; }
    public void setSchedule(String schedule) { this.schedule = schedule; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public int getStudentCount() { return studentCount; }
    public void setStudentCount(int studentCount) { this.studentCount = studentCount; }

    public double getAverageGrade() { return averageGrade; }
    public void setAverageGrade(double averageGrade) { this.averageGrade = averageGrade; }

    public int getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(int attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}