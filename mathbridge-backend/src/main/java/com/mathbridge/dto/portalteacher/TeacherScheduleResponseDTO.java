package com.mathbridge.dto.portalteacher;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TeacherScheduleResponseDTO {
    private LocalDate date;
    private int totalSessions;
    private int upcomingSessions;
    private int liveSessions;
    private int completedSessions;
    private List<TeacherScheduleItemDTO> sessions = new ArrayList<>();

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public int getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(int totalSessions) {
        this.totalSessions = totalSessions;
    }

    public int getUpcomingSessions() {
        return upcomingSessions;
    }

    public void setUpcomingSessions(int upcomingSessions) {
        this.upcomingSessions = upcomingSessions;
    }

    public int getLiveSessions() {
        return liveSessions;
    }

    public void setLiveSessions(int liveSessions) {
        this.liveSessions = liveSessions;
    }

    public int getCompletedSessions() {
        return completedSessions;
    }

    public void setCompletedSessions(int completedSessions) {
        this.completedSessions = completedSessions;
    }

    public List<TeacherScheduleItemDTO> getSessions() {
        return sessions;
    }

    public void setSessions(List<TeacherScheduleItemDTO> sessions) {
        this.sessions = sessions;
    }
}

