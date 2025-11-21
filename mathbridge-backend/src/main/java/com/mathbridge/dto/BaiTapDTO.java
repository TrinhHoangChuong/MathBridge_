package com.mathbridge.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;

public class BaiTapDTO {
    private String idBt;
    private String idBh;
    private String idLh;
    private String tieuDe;
    private String moTa;
    private String loaiBt; // BAI_TAP, KIEM_TRA_15P, KIEM_TRA_45P, THI_HK
    private Boolean choPhepLamBai;
    private String hocSinhDuocPhep; // JSON array of student IDs: ["HS001", "HS002"]
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime ngayBatDau;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime ngayKetThuc;
    private String ghiChu;
    private Integer soBaiNop;
    private Integer soBaiDaCham;
    private String tenLop;
    private String tenCaHoc;
    private Integer thoiLuongPhut;
    private Boolean tuDongNop;
    private String canhBao;
    private String cheDoChamDiem;
    private List<AssignmentQuestionDTO> questions;

    public BaiTapDTO() {
    }

    public String getIdBt() {
        return idBt;
    }

    public void setIdBt(String idBt) {
        this.idBt = idBt;
    }

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

    public String getTieuDe() {
        return tieuDe;
    }

    public void setTieuDe(String tieuDe) {
        this.tieuDe = tieuDe;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public String getLoaiBt() {
        return loaiBt;
    }

    public void setLoaiBt(String loaiBt) {
        this.loaiBt = loaiBt;
    }

    public Boolean getChoPhepLamBai() {
        return choPhepLamBai;
    }

    public void setChoPhepLamBai(Boolean choPhepLamBai) {
        this.choPhepLamBai = choPhepLamBai;
    }

    public String getHocSinhDuocPhep() {
        return hocSinhDuocPhep;
    }

    public void setHocSinhDuocPhep(String hocSinhDuocPhep) {
        this.hocSinhDuocPhep = hocSinhDuocPhep;
    }

    public LocalDateTime getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDateTime ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public LocalDateTime getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(LocalDateTime ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public Integer getSoBaiNop() {
        return soBaiNop;
    }

    public void setSoBaiNop(Integer soBaiNop) {
        this.soBaiNop = soBaiNop;
    }

    public Integer getSoBaiDaCham() {
        return soBaiDaCham;
    }

    public void setSoBaiDaCham(Integer soBaiDaCham) {
        this.soBaiDaCham = soBaiDaCham;
    }

    public String getTenLop() {
        return tenLop;
    }

    public void setTenLop(String tenLop) {
        this.tenLop = tenLop;
    }

    public String getTenCaHoc() {
        return tenCaHoc;
    }

    public void setTenCaHoc(String tenCaHoc) {
        this.tenCaHoc = tenCaHoc;
    }

    public Integer getThoiLuongPhut() {
        return thoiLuongPhut;
    }

    public void setThoiLuongPhut(Integer thoiLuongPhut) {
        this.thoiLuongPhut = thoiLuongPhut;
    }

    public Boolean getTuDongNop() {
        return tuDongNop;
    }

    public void setTuDongNop(Boolean tuDongNop) {
        this.tuDongNop = tuDongNop;
    }

    public String getCanhBao() {
        return canhBao;
    }

    public void setCanhBao(String canhBao) {
        this.canhBao = canhBao;
    }

    public String getCheDoChamDiem() {
        return cheDoChamDiem;
    }

    public void setCheDoChamDiem(String cheDoChamDiem) {
        this.cheDoChamDiem = cheDoChamDiem;
    }

    public List<AssignmentQuestionDTO> getQuestions() {
        return questions;
    }

    public void setQuestions(List<AssignmentQuestionDTO> questions) {
        this.questions = questions;
    }
}

