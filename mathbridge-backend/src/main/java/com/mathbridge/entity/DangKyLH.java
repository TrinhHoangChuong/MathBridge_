package com.mathbridge.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "DangKyLH")
public class DangKyLH {

    @EmbeddedId
    private DangKyLHId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idHs")
    @JoinColumn(name = "ID_HS", nullable = false, referencedColumnName = "ID_HS")
    private HocSinh hocSinh;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idLh")
    @JoinColumn(name = "ID_LH", nullable = false, referencedColumnName = "ID_LH")
    private LopHoc lopHoc;

    // IMPORTANT: TrangThai column doesn't exist in database yet
    // Option 1: Run the SQL script: add_trangthai_column.sql in SSMS to add the column
    // Option 2: Using @Transient to temporarily ignore this field (current solution)
    
    @Transient  // Using @Transient because column doesn't exist in database
    // @Column(name = "TrangThai", nullable = true)  // Uncomment this after adding column to database
    private String trangThai; // open, pending, end, approved, rejected

    public DangKyLH() {
    }

    public DangKyLH(DangKyLHId id) {
        this.id = id;
    }

    public DangKyLHId getId() {
        return id;
    }

    public void setId(DangKyLHId id) {
        this.id = id;
    }

    public HocSinh getHocSinh() {
        return hocSinh;
    }

    public void setHocSinh(HocSinh hocSinh) {
        this.hocSinh = hocSinh;
    }

    public LopHoc getLopHoc() {
        return lopHoc;
    }

    public void setLopHoc(LopHoc lopHoc) {
        this.lopHoc = lopHoc;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}
