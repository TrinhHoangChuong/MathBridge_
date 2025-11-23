package com.mathbridge.dto.portaltutor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TuWeeklyScheduleResponseDTO {

    private LocalDate weekStart;
    private LocalDate weekEnd;
    private List<TuConsultationScheduleDTO> items = new ArrayList<>();

    public TuWeeklyScheduleResponseDTO() {
    }

    public TuWeeklyScheduleResponseDTO(LocalDate weekStart, LocalDate weekEnd, List<TuConsultationScheduleDTO> items) {
        this.weekStart = weekStart;
        this.weekEnd = weekEnd;
        this.items = items;
    }

    public LocalDate getWeekStart() {
        return weekStart;
    }

    public void setWeekStart(LocalDate weekStart) {
        this.weekStart = weekStart;
    }

    public LocalDate getWeekEnd() {
        return weekEnd;
    }

    public void setWeekEnd(LocalDate weekEnd) {
        this.weekEnd = weekEnd;
    }

    public List<TuConsultationScheduleDTO> getItems() {
        return items;
    }

    public void setItems(List<TuConsultationScheduleDTO> items) {
        this.items = items;
    }
}

