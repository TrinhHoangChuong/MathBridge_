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
    
    // Map ID_BaiNop - database has both columns, set same value as ID_BN
    @Column(name = "ID_BaiNop", length = 10, nullable = false)
    private String idBaiNop;

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
    @Column(name = "NoiDungBaiLam")
    private String noiDungBaiLam;

    @Column(name = "TongSoCau")
    private Integer tongSoCau;

    @Column(name = "SoCauDung")
    private Integer soCauDung;

    @Column(name = "ThoiGianBatDau")
    private LocalDateTime thoiGianBatDau;

    @Column(name = "ThoiGianNop")
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
        System.out.println("==========================================");
        System.out.println("=== @PrePersist called ===");
        System.out.println("Current idBn value: '" + this.idBn + "'");
        System.out.println("idBn is null: " + (this.idBn == null));
        System.out.println("idBn isEmpty: " + (this.idBn != null && this.idBn.trim().isEmpty()));
        
        // Always ensure ID is set, even if it was set before
        if (this.idBn == null || this.idBn.trim().isEmpty()) {
            String newId = "BN" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            System.out.println("⚠️ ID is null/empty! Generating new ID in @PrePersist: '" + newId + "'");
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
                System.out.println("⚠️ ID too short! Regenerating: '" + newId + "'");
                this.idBn = newId;
            }
        }
        
        // ALWAYS set ID_BaiNop to same value as ID_BN (database has both columns)
        // This ensures both columns are populated during INSERT
        if (this.idBn != null) {
            this.idBaiNop = this.idBn;
            System.out.println("Setting ID_BaiNop to match ID_BN: '" + this.idBaiNop + "'");
        } else {
            System.out.println("⚠️ WARNING: idBn is still null after generation!");
        }
        
        System.out.println("Final idBn after @PrePersist: '" + this.idBn + "' (length: " + (this.idBn != null ? this.idBn.length() : 0) + ")");
        System.out.println("Final idBaiNop after @PrePersist: '" + this.idBaiNop + "' (length: " + (this.idBaiNop != null ? this.idBaiNop.length() : 0) + ")");
        System.out.println("=== @PrePersist completed ===");
        System.out.println("==========================================");
    }
    
    @PreUpdate
    protected void ensureIdOnUpdate() {
        // On update, ensure ID_BaiNop matches ID_BN if both exist
        if (this.idBn != null && this.idBaiNop == null) {
            this.idBaiNop = this.idBn;
        }
    }
}
