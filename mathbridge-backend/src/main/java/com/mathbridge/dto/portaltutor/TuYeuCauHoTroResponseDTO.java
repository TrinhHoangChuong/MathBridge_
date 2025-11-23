package com.mathbridge.dto.portaltutor;

import java.time.LocalDateTime;

public class TuYeuCauHoTroResponseDTO {
    private String idYc;
    private String idHs;
    private String studentName;
    private String studentEmail;
    private String studentPhone;
    private String idLh;
    private String tenLop;
    private String chuongTrinh;
    private String tieuDe;
    private String noiDung;
    private String fileUrl;
    private String loaiYeuCau;
    private String trangThai;
    private LocalDateTime thoiDiemTao;
    private LocalDateTime thoiDiemDong;

    public TuYeuCauHoTroResponseDTO() {
    }

    public String getIdYc() {
        return idYc;
    }

    public void setIdYc(String idYc) {
        this.idYc = idYc;
    }

    public String getIdHs() {
        return idHs;
    }

    public void setIdHs(String idHs) {
        this.idHs = idHs;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getStudentPhone() {
        return studentPhone;
    }

    public void setStudentPhone(String studentPhone) {
        this.studentPhone = studentPhone;
    }

    public String getIdLh() {
        return idLh;
    }

    public void setIdLh(String idLh) {
        this.idLh = idLh;
    }

    public String getTenLop() {
        return tenLop;
    }

    public void setTenLop(String tenLop) {
        this.tenLop = tenLop;
    }

    public String getChuongTrinh() {
        return chuongTrinh;
    }

    public void setChuongTrinh(String chuongTrinh) {
        this.chuongTrinh = chuongTrinh;
    }

    public String getTieuDe() {
        return tieuDe;
    }

    public void setTieuDe(String tieuDe) {
        this.tieuDe = tieuDe;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getLoaiYeuCau() {
        return loaiYeuCau;
    }

    public void setLoaiYeuCau(String loaiYeuCau) {
        this.loaiYeuCau = loaiYeuCau;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public LocalDateTime getThoiDiemTao() {
        return thoiDiemTao;
    }

    public void setThoiDiemTao(LocalDateTime thoiDiemTao) {
        this.thoiDiemTao = thoiDiemTao;
    }

    public LocalDateTime getThoiDiemDong() {
        return thoiDiemDong;
    }

    public void setThoiDiemDong(LocalDateTime thoiDiemDong) {
        this.thoiDiemDong = thoiDiemDong;
    }
}

