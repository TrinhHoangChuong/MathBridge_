package com.mathbridge.service;

import com.mathbridge.dto.BaiTapDTO;
import com.mathbridge.dto.portalteacher.TeacherClassEvaluationDTO;
import com.mathbridge.dto.portalteacher.TeacherScheduleItemDTO;
import com.mathbridge.dto.portalteacher.TeacherScheduleResponseDTO;
import com.mathbridge.dto.portalteacher.TeacherSessionDetailDTO;
import com.mathbridge.dto.portalteacher.TeacherSessionEvaluationDTO;
import com.mathbridge.entity.BuoiHocChiTiet;
import com.mathbridge.entity.DanhGiaBuoiHoc;
import com.mathbridge.entity.DanhGiaLopHoc;
import com.mathbridge.repository.BuoiHocChiTietRepository;
import com.mathbridge.repository.DanhGiaBuoiHocRepository;
import com.mathbridge.repository.DanhGiaLopHocRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PortalTeacherServiceImpl implements PortalTeacherService {

    private final BuoiHocChiTietRepository buoiHocChiTietRepository;
    private final DanhGiaBuoiHocRepository danhGiaBuoiHocRepository;
    private final DanhGiaLopHocRepository danhGiaLopHocRepository;
    private final BaiTapService baiTapService;

    public PortalTeacherServiceImpl(BuoiHocChiTietRepository buoiHocChiTietRepository,
                                    DanhGiaBuoiHocRepository danhGiaBuoiHocRepository,
                                    DanhGiaLopHocRepository danhGiaLopHocRepository,
                                    BaiTapService baiTapService) {
        this.buoiHocChiTietRepository = buoiHocChiTietRepository;
        this.danhGiaBuoiHocRepository = danhGiaBuoiHocRepository;
        this.danhGiaLopHocRepository = danhGiaLopHocRepository;
        this.baiTapService = baiTapService;
    }

    @Override
    @Transactional(readOnly = true)
    public TeacherScheduleResponseDTO getTeacherSchedule(String idNv, LocalDate date, int days) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        int safeDays = Math.max(days, 1);
        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = start.plusDays(safeDays).minusSeconds(1);

        List<BuoiHocChiTiet> sessions = buoiHocChiTietRepository
                .findByGiaoVienAndDateRange(idNv, start, end);

        sessions.sort(Comparator.comparing(BuoiHocChiTiet::getGioBatDau,
                Comparator.nullsLast(Comparator.naturalOrder())));

        Map<String, RatingStats> sessionRatings = buildSessionRatings(sessions);
        Map<String, RatingStats> classRatings = buildClassRatings(sessions);
        Map<String, Set<String>> conflictMapping = detectConflicts(sessions);

        List<TeacherScheduleItemDTO> dtoList = sessions.stream()
                .map(session -> toScheduleItem(session, sessionRatings, classRatings, conflictMapping))
                .collect(Collectors.toList());

        TeacherScheduleResponseDTO response = new TeacherScheduleResponseDTO();
        response.setDate(targetDate);
        response.setSessions(dtoList);
        response.setTotalSessions(dtoList.size());

        long live = dtoList.stream().filter(item -> "LIVE".equals(item.getStatus())).count();
        long upcoming = dtoList.stream().filter(item -> "UPCOMING".equals(item.getStatus())).count();
        long completed = dtoList.stream().filter(item -> "COMPLETED".equals(item.getStatus())).count();

        response.setLiveSessions((int) live);
        response.setUpcomingSessions((int) upcoming);
        response.setCompletedSessions((int) completed);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public TeacherSessionDetailDTO getSessionDetail(String idBh) {
        BuoiHocChiTiet session = buoiHocChiTietRepository.findById(idBh)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy buổi học " + idBh));

        List<BuoiHocChiTiet> singleSessionList = Collections.singletonList(session);
        Map<String, RatingStats> sessionRatings = buildSessionRatings(singleSessionList);
        Map<String, RatingStats> classRatings = buildClassRatings(singleSessionList);

        Map<String, Set<String>> conflicts = new HashMap<>();
        conflicts.put(session.getIdBh(), Collections.emptySet());
        TeacherScheduleItemDTO sessionDto = toScheduleItem(session, sessionRatings, classRatings, conflicts);

        List<TeacherSessionEvaluationDTO> sessionEvaluations = danhGiaBuoiHocRepository
                .findByIdBhOrderByThoiDiemDanhGiaDesc(idBh)
                .stream()
                .map(this::toSessionEvaluation)
                .collect(Collectors.toList());

        List<BaiTapDTO> assignments = baiTapService.getBaiTapByBuoiHoc(idBh);

        List<TeacherClassEvaluationDTO> classEvaluations = session.getLopHoc() != null
                ? getClassEvaluations(session.getLopHoc().getIdLh())
                : Collections.emptyList();

        TeacherSessionDetailDTO detailDTO = new TeacherSessionDetailDTO();
        detailDTO.setSession(sessionDto);
        detailDTO.setSessionEvaluations(sessionEvaluations);
        detailDTO.setAssignments(assignments);
        detailDTO.setClassEvaluations(classEvaluations);
        return detailDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeacherClassEvaluationDTO> getClassEvaluations(String idLh) {
        return danhGiaLopHocRepository.findByIdLhOrderByThoiDiemDanhGiaDesc(idLh)
                .stream()
                .map(this::toClassEvaluation)
                .collect(Collectors.toList());
    }

    private TeacherScheduleItemDTO toScheduleItem(BuoiHocChiTiet session,
                                                  Map<String, RatingStats> sessionRatings,
                                                  Map<String, RatingStats> classRatings,
                                                  Map<String, Set<String>> conflictMapping) {
        TeacherScheduleItemDTO dto = new TeacherScheduleItemDTO();
        dto.setIdBh(session.getIdBh());
        dto.setIdLh(session.getIdLh());
        dto.setTenCaHoc(session.getTenCaHoc());
        dto.setNoiDung(session.getNoiDung());

        if (session.getLopHoc() != null) {
            dto.setClassName(session.getLopHoc().getTenLop());
            dto.setSoHocSinh(session.getLopHoc().getDangKyLhs() != null
                    ? session.getLopHoc().getDangKyLhs().size() : null);
        }

        dto.setRoomId(session.getIdPhong());
        dto.setRoomName(session.getPhong() != null ? session.getPhong().getTenPhong() : null);
        dto.setNgayHoc(session.getNgayHoc());
        dto.setGioBatDau(session.getGioBatDau());
        dto.setGioKetThuc(session.getGioKetThuc());

        if (session.getGioBatDau() != null && session.getGioKetThuc() != null) {
            dto.setDurationMinutes(Duration.between(session.getGioBatDau(), session.getGioKetThuc()).toMinutes());
        }

        dto.setStatus(resolveStatus(session.getGioBatDau(), session.getGioKetThuc()));

        RatingStats sessionStat = sessionRatings.get(session.getIdBh());
        if (sessionStat != null) {
            dto.setSessionAverageScore(sessionStat.averageScore());
            dto.setSessionReviewCount(sessionStat.count());
        }

        RatingStats classStat = classRatings.get(session.getIdLh());
        if (classStat != null) {
            dto.setClassAverageScore(classStat.averageScore());
            dto.setClassReviewCount(classStat.count());
        }

        Set<String> conflicts = conflictMapping.getOrDefault(session.getIdBh(), Collections.emptySet());
        dto.setConflict(!conflicts.isEmpty());
        dto.setConflictSessionIds(new ArrayList<>(conflicts));

        return dto;
    }

    private Map<String, RatingStats> buildSessionRatings(List<BuoiHocChiTiet> sessions) {
        List<String> sessionIds = sessions.stream()
                .map(BuoiHocChiTiet::getIdBh)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        if (sessionIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return danhGiaBuoiHocRepository.findStatsBySessionIds(sessionIds).stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> new RatingStats((Double) row[1], ((Number) row[2]).intValue())
                ));
    }

    private Map<String, RatingStats> buildClassRatings(List<BuoiHocChiTiet> sessions) {
        List<String> classIds = sessions.stream()
                .map(BuoiHocChiTiet::getIdLh)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        if (classIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return danhGiaLopHocRepository.findStatsByClassIds(classIds).stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> new RatingStats((Double) row[1], ((Number) row[2]).intValue())
                ));
    }

    private Map<String, Set<String>> detectConflicts(List<BuoiHocChiTiet> sessions) {
        Map<String, List<BuoiHocChiTiet>> byRoom = sessions.stream()
                .filter(session -> session.getIdPhong() != null)
                .collect(Collectors.groupingBy(BuoiHocChiTiet::getIdPhong));

        Map<String, Set<String>> conflicts = new HashMap<>();

        for (List<BuoiHocChiTiet> roomSessions : byRoom.values()) {
            roomSessions.sort(Comparator.comparing(BuoiHocChiTiet::getGioBatDau,
                    Comparator.nullsLast(Comparator.naturalOrder())));

            for (int i = 0; i < roomSessions.size(); i++) {
                for (int j = i + 1; j < roomSessions.size(); j++) {
                    BuoiHocChiTiet first = roomSessions.get(i);
                    BuoiHocChiTiet second = roomSessions.get(j);

                    if (isOverlap(first, second)) {
                        conflicts.computeIfAbsent(first.getIdBh(), key -> new HashSet<>()).add(second.getIdBh());
                        conflicts.computeIfAbsent(second.getIdBh(), key -> new HashSet<>()).add(first.getIdBh());
                    } else {
                        break;
                    }
                }
            }
        }

        return conflicts;
    }

    private boolean isOverlap(BuoiHocChiTiet a, BuoiHocChiTiet b) {
        if (a.getGioBatDau() == null || a.getGioKetThuc() == null
                || b.getGioBatDau() == null || b.getGioKetThuc() == null) {
            return false;
        }
        return !a.getGioKetThuc().isBefore(b.getGioBatDau())
                && !b.getGioKetThuc().isBefore(a.getGioBatDau());
    }

    private String resolveStatus(LocalDateTime start, LocalDateTime end) {
        LocalDateTime now = LocalDateTime.now();
        if (start == null || end == null) {
            return "UPCOMING";
        }
        if (now.isBefore(start)) {
            return "UPCOMING";
        }
        if (now.isAfter(end)) {
            return "COMPLETED";
        }
        return "LIVE";
    }

    private TeacherSessionEvaluationDTO toSessionEvaluation(DanhGiaBuoiHoc entity) {
        TeacherSessionEvaluationDTO dto = new TeacherSessionEvaluationDTO();
        dto.setId(entity.getIdDgbh());
        dto.setStudentId(entity.getIdHs());
        if (entity.getHocSinh() != null) {
            String ho = Optional.ofNullable(entity.getHocSinh().getHo()).orElse("");
            String tenDem = Optional.ofNullable(entity.getHocSinh().getTenDem()).orElse("");
            String ten = Optional.ofNullable(entity.getHocSinh().getTen()).orElse("");
            dto.setStudentName(String.format("%s %s %s", ho, tenDem, ten).trim().replaceAll(" +", " "));
        }
        dto.setScore(entity.getDiemDanhGia());
        dto.setComment(entity.getNhanXet());
        dto.setCreatedAt(entity.getThoiDiemDanhGia());
        return dto;
    }

    private TeacherClassEvaluationDTO toClassEvaluation(DanhGiaLopHoc entity) {
        TeacherClassEvaluationDTO dto = new TeacherClassEvaluationDTO();
        dto.setId(entity.getIdDglh());
        dto.setStudentId(entity.getIdHs());
        if (entity.getHocSinh() != null) {
            String ho = Optional.ofNullable(entity.getHocSinh().getHo()).orElse("");
            String tenDem = Optional.ofNullable(entity.getHocSinh().getTenDem()).orElse("");
            String ten = Optional.ofNullable(entity.getHocSinh().getTen()).orElse("");
            dto.setStudentName(String.format("%s %s %s", ho, tenDem, ten).trim().replaceAll(" +", " "));
        }
        dto.setScore(entity.getDiemDanhGia());
        dto.setComment(entity.getNhanXet());
        dto.setCreatedAt(entity.getThoiDiemDanhGia());
        return dto;
    }

    private record RatingStats(Double averageScore, Integer count) {
    }

}

