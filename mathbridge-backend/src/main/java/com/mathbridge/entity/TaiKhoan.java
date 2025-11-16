package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "TaiKhoan")
public class TaiKhoan {

    @Id
    @Column(name = "ID_TK", length = 10, nullable = false)
    private String idTk;

    @Column(name = "ID_HS", length = 10)
    private String idHs;

    @Column(name = "ID_NV", length = 10)
    private String idNv;

    @Column(name = "Email", length = 100, nullable = false)
    private String email;

    @Column(name = "PassWord", length = 255, nullable = false)
    private String passWord;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    @Column(name = "ThoiDiemTao")
    private LocalDateTime thoiDiemTao;
    // QUAN HỆ

    @OneToMany(mappedBy = "taiKhoan")
    private Set<HocSinh> hocSinhs = new HashSet<>();

    @OneToMany(mappedBy = "taiKhoan")
    private Set<NhanVien> nhanViens = new HashSet<>();

    @OneToMany(mappedBy = "taiKhoanGui")
    private Set<BinhLuanBaiNop> binhLuanBaiNops = new HashSet<>();

    @OneToMany(mappedBy = "taiKhoan")
    private Set<TaiKhoan_VaiTro> taiKhoanVaiTros = new HashSet<>();
}
