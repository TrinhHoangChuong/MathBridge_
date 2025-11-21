package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "BaiNop")
public class BaiNop {

    @Id
    @Column(name = "ID_BN", length = 10, nullable = false)
    private String idBn;

    @Column(name = "ID_BT", length = 10)
    private String idBt;

    @Column(name = "ID_HS", length = 10)
    private String idHs;

    @Column(name = "FileURL", length = 400)
    private String fileUrl;

    @Column(name = "DiemSo", precision = 5, scale = 2)
    private BigDecimal diemSo;

    @Column(name = "NhanXet", length = 255)
    private String nhanXet;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    @Lob
    @Column(name = "NoiDungBai")
    private String noiDungBaiLam;

    @Column(name = "TongSoCau")
    private Integer tongSoCau;

    @Column(name = "SoCauDung")
    private Integer soCauDung;

    // Các trường này không có trong database, chỉ dùng trong code logic
    @Transient
    private LocalDateTime thoiGianBatDau;

    @Transient
    private LocalDateTime thoiGianNop;
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_BT", insertable = false, updatable = false)
    private BaiTap baiTap;

    @ManyToOne
    @JoinColumn(name = "ID_HS", insertable = false, updatable = false)
    private HocSinh hocSinh;

    @OneToMany(mappedBy = "baiNop")
    private Set<BinhLuanBaiNop> binhLuanBaiNops = new HashSet<>();

    @PrePersist
    protected void ensureId() {
        // Always ensure ID is set, even if it was set before
        if (this.idBn == null || this.idBn.trim().isEmpty()) {
            String newId = "BN" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            this.idBn = newId;
        }
        
        // Trim and validate
        if (this.idBn != null) {
            this.idBn = this.idBn.trim();
            // Ensure exactly 10 characters
            if (this.idBn.length() > 10) {
                this.idBn = this.idBn.substring(0, 10);
            } else if (this.idBn.length() < 10) {
                while (this.idBn.length() < 10) {
                    this.idBn += "0";
                }
            }
            
            if (this.idBn.length() < 3) {
                String newId = "BN" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
                this.idBn = newId;
            }
        }
    }
}
