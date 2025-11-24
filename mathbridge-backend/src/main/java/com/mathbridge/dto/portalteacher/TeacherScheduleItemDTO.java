package com.mathbridge.dto.portalteacher;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TeacherScheduleItemDTO {
    private String idBh;
    private String idLh;
    private String className;
    private String tenCaHoc;
    private String noiDung;
    private String roomId;
    private String roomName;
    private LocalDateTime ngayHoc;
    private LocalDateTime gioBatDau;
    private LocalDateTime gioKetThuc;
    private long durationMinutes;
    private String status;
    private boolean conflict;
    private List<String> conflictSessionIds = new ArrayList<>();
    private Integer soHocSinh;
    private Double sessionAverageScore;
    private Integer sessionReviewCount;
    private Double classAverageScore;
    private Integer classReviewCount;

    public String getIdBh() {
        return idBh;
    }

    public void setIdBh(String idBh) {
        this.idBh = idBh;
    }

    public String getIdLh() {
        return idLh;
    }

    public void setIdLh(String idLh) {
        this.idLh = idLh;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getTenCaHoc() {
        return tenCaHoc;
    }

    public void setTenCaHoc(String tenCaHoc) {
        this.tenCaHoc = tenCaHoc;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public LocalDateTime getNgayHoc() {
        return ngayHoc;
    }

    public void setNgayHoc(LocalDateTime ngayHoc) {
        this.ngayHoc = ngayHoc;
    }

    public LocalDateTime getGioBatDau() {
        return gioBatDau;
    }

    public void setGioBatDau(LocalDateTime gioBatDau) {
        this.gioBatDau = gioBatDau;
    }

    public LocalDateTime getGioKetThuc() {
        return gioKetThuc;
    }

    public void setGioKetThuc(LocalDateTime gioKetThuc) {
        this.gioKetThuc = gioKetThuc;
    }

    public long getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(long durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isConflict() {
        return conflict;
    }

    public void setConflict(boolean conflict) {
        this.conflict = conflict;
    }

    public List<String> getConflictSessionIds() {
        return conflictSessionIds;
    }

    public void setConflictSessionIds(List<String> conflictSessionIds) {
        this.conflictSessionIds = conflictSessionIds;
    }

    public Integer getSoHocSinh() {
        return soHocSinh;
    }

    public void setSoHocSinh(Integer soHocSinh) {
        this.soHocSinh = soHocSinh;
    }

    public Double getSessionAverageScore() {
        return sessionAverageScore;
    }

    public void setSessionAverageScore(Double sessionAverageScore) {
        this.sessionAverageScore = sessionAverageScore;
    }

    public Integer getSessionReviewCount() {
        return sessionReviewCount;
    }

    public void setSessionReviewCount(Integer sessionReviewCount) {
        this.sessionReviewCount = sessionReviewCount;
    }

    public Double getClassAverageScore() {
        return classAverageScore;
    }

    public void setClassAverageScore(Double classAverageScore) {
        this.classAverageScore = classAverageScore;
    }

    public Integer getClassReviewCount() {
        return classReviewCount;
    }

    public void setClassReviewCount(Integer classReviewCount) {
        this.classReviewCount = classReviewCount;
    }
}

