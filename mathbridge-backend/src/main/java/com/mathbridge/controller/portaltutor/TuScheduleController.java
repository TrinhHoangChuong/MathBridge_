package com.mathbridge.controller.portaltutor;

import com.mathbridge.dto.portaltutor.TuWeeklyScheduleResponseDTO;
import com.mathbridge.service.portaltutor.TuConsultationScheduleService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

@RestController
@RequestMapping("/api/portal/tutor/schedule")
@CrossOrigin(origins = "*")
public class TuScheduleController {

    private final TuConsultationScheduleService tuConsultationScheduleService;

    public TuScheduleController(TuConsultationScheduleService tuConsultationScheduleService) {
        this.tuConsultationScheduleService = tuConsultationScheduleService;
    }

    @GetMapping("/weekly")
    public ResponseEntity<TuWeeklyScheduleResponseDTO> getWeeklySchedule(
            @RequestParam(name = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {

        LocalDate baseDate = startDate != null ? startDate : LocalDate.now();
        LocalDate weekStart = baseDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);

        TuWeeklyScheduleResponseDTO response = tuConsultationScheduleService.getWeeklySchedule(weekStart, weekEnd);
        return ResponseEntity.ok(response);
    }
}

