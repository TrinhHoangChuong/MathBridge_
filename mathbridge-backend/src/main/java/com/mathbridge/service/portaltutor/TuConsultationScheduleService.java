package com.mathbridge.service.portaltutor;

import com.mathbridge.dto.portaltutor.TuConsultationScheduleDTO;
import com.mathbridge.dto.portaltutor.TuWeeklyScheduleResponseDTO;
import com.mathbridge.entity.LienHeTuVan;
import com.mathbridge.repository.portaltutor.TuLienHeTuVanRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TuConsultationScheduleService {

    private final TuLienHeTuVanRepository tuLienHeTuVanRepository;

    public TuConsultationScheduleService(TuLienHeTuVanRepository tuLienHeTuVanRepository) {
        this.tuLienHeTuVanRepository = tuLienHeTuVanRepository;
    }

    public TuWeeklyScheduleResponseDTO getWeeklySchedule(LocalDate weekStart, LocalDate weekEnd) {
        LocalDateTime from = weekStart.atStartOfDay();
        LocalDateTime to = weekEnd.atTime(LocalTime.MAX);

        // Query by ThoiGianTuVan (consultation time) - only get records with ThoiGianTuVan not null
        List<LienHeTuVan> requests = tuLienHeTuVanRepository.findByThoiGianTuVanBetween(from, to);

        // Filter to only include records with ThoiGianTuVan not null
        List<TuConsultationScheduleDTO> items = requests.stream()
                .filter(entity -> entity.getThoiGianTuVan() != null) // Only include records with consultation time
                .map(this::convertToScheduleDTO)
                .sorted(Comparator.comparing(TuConsultationScheduleDTO::getStartTime))
                .collect(Collectors.toList());

        return new TuWeeklyScheduleResponseDTO(weekStart, weekEnd, items);
    }

    private TuConsultationScheduleDTO convertToScheduleDTO(LienHeTuVan entity) {
        TuConsultationScheduleDTO dto = new TuConsultationScheduleDTO();
        dto.setId(entity.getIdTv());
        dto.setStudentName(entity.getHoTen());
        dto.setTitle(entity.getTieuDe());
        dto.setDescription(entity.getNoiDung());
        dto.setChannel(entity.getHinhThucTuVan());
        dto.setStatus(entity.getTrangThai());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getSdt());

        // Use ThoiGianTuVan (consultation time) as startTime
        // EndTime = StartTime + 1 hour (60 minutes)
        LocalDateTime start = entity.getThoiGianTuVan();
        if (start == null) {
            // This should not happen as we filter null values, but handle it just in case
            start = LocalDateTime.now();
        }
        dto.setStartTime(start);
        // EndTime = StartTime + 1 hour
        dto.setEndTime(start.plusHours(1));

        boolean online = isOnlineChannel(entity.getHinhThucTuVan());
        dto.setOnline(online);
        dto.setLocation(online ? "LMS" : "Trung tâm MathBridge");
        dto.setReferenceCode(buildReferenceCode(entity));

        return dto;
    }

    private boolean isOnlineChannel(String channel) {
        if (channel == null) {
            return false;
        }
        String normalized = channel.toLowerCase();
        return normalized.contains("online")
                || normalized.contains("zoom")
                || normalized.contains("lms")
                || normalized.contains("teams");
    }

    private String buildReferenceCode(LienHeTuVan entity) {
        if (entity.getSdt() != null && entity.getSdt().length() >= 4) {
            String suffix = entity.getSdt().substring(entity.getSdt().length() - 4);
            return String.format("%s-%s", entity.getIdTv(), suffix);
        }
        return entity.getIdTv();
    }
}

