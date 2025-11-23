package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.NhanSuGiangVienRequest;
import com.mathbridge.dto.PortalAdmin.Response.NhanSuGiangVienResponse;
import com.mathbridge.entity.*;
import com.mathbridge.repository.Admin.CoSoAdminRepository;
import com.mathbridge.repository.Admin.HopDongAdminRepository;
import com.mathbridge.repository.Admin.NhanVienAdminRepository;
import com.mathbridge.repository.Admin.RoleAdminRepository;
import com.mathbridge.repository.Admin.TaiKhoanAdminRepository;
import com.mathbridge.repository.Admin.TaiKhoanVaiTroAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NhanSuGiangVienServiceImpl implements NhanSuGiangVienService {

    private final NhanVienAdminRepository nhanVienRepository;
    private final HopDongAdminRepository hopDongRepository;
    private final CoSoAdminRepository coSoRepository;
    private final RoleAdminRepository roleRepository;
    private final TaiKhoanAdminRepository taiKhoanRepository;
    private final TaiKhoanVaiTroAdminRepository taiKhoanVaiTroRepository;


    @Override
    public List<NhanSuGiangVienResponse.CampusOption> getAllCampuses() {
        return coSoRepository.findAll()
                .stream()
                .map(cs -> NhanSuGiangVienResponse.CampusOption.builder()
                        .idCs(cs.getIdCs())
                        .tenCoSo(cs.getTenCoSo())
                        .build())
                .toList();
    }

    @Override
    public List<NhanSuGiangVienResponse.RoleOption> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(r -> NhanSuGiangVienResponse.RoleOption.builder()
                        .idRole(r.getIdRole())
                        .tenVaiTro(r.getTenVaiTro())
                        .build())
                .toList();
    }

    // phần còn lại: searchStaff, createStaff, updateStaff, contracts...

    // ==================== NHÂN SỰ ====================

    @Override
    @Transactional(readOnly = true)
    public List<NhanSuGiangVienResponse> searchStaff(NhanSuGiangVienRequest filter) {
        // 1. Lấy toàn bộ NhanVien
        List<NhanVien> all = nhanVienRepository.findAll();

        // 2. Đọc filter từ FE
        String keyword = normalize(filter.getSearchKeyword());              // cho tìm kiếm
        String campusId = normalizeFilterValue(filter.getCampusId());      // "" / all => null
        String roleFilterId = normalizeFilterValue(filter.getRoleId());    // "" / all => null
        String statusRaw = normalizeFilterValue(filter.getStatus());       // "" / all => null

        Boolean active = null;
        if ("active".equalsIgnoreCase(statusRaw)) {
            active = Boolean.TRUE;
        } else if ("inactive".equalsIgnoreCase(statusRaw)) {
            active = Boolean.FALSE;
        }

        // 3. Preload dữ liệu cơ sở
        Map<String, CoSo> campusById = coSoRepository.findAll().stream()
                .collect(Collectors.toMap(CoSo::getIdCs, c -> c));

        // 4. Preload mapping tài khoản – vai trò để dùng cho filter + hiển thị
        List<TaiKhoan_VaiTro> allMappings = taiKhoanVaiTroRepository.findAll();

        // idTk -> set idRole (để lọc)
        Map<String, Set<String>> roleIdsByTk = new HashMap<>();
        // idTk -> danh sách tên vai trò (để hiển thị)
        Map<String, List<String>> roleNamesByTk = new HashMap<>();

        for (TaiKhoan_VaiTro m : allMappings) {
            if (m.getId() == null) continue;
            String idTk = m.getId().getIdTk();
            String idRole = m.getId().getIdRole();
            if (idTk == null || idRole == null) continue;

            Role r = m.getRole();
            String tenVaiTro = (r != null && r.getTenVaiTro() != null)
                    ? r.getTenVaiTro()
                    : idRole;

            roleIdsByTk
                    .computeIfAbsent(idTk, k -> new HashSet<>())
                    .add(idRole);

            roleNamesByTk
                    .computeIfAbsent(idTk, k -> new ArrayList<>())
                    .add(tenVaiTro);
        }

        // 5. Lọc trong memory
        List<NhanSuGiangVienResponse> results = new ArrayList<>();

        for (NhanVien nv : all) {

            // 5.1 Lọc keyword (họ tên + email + sdt)
            if (keyword != null) {
                String fullName = buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen());
                String email = Optional.ofNullable(nv.getEmail()).orElse("");
                String sdt = Optional.ofNullable(nv.getSdt()).orElse("");

                String combined = (fullName + " " + email + " " + sdt).toLowerCase();
                if (!combined.contains(keyword)) {
                    continue;
                }
            }

            // 5.2 Lọc cơ sở
            if (campusId != null && !campusId.equalsIgnoreCase(nv.getIdCs())) {
                continue;
            }

            // 5.3 Lọc trạng thái hoạt động
            if (active != null) {
                Boolean flag = nv.getTrangThaiHoatDong();
                if (flag == null || !flag.equals(active)) {
                    continue;
                }
            }

            // 5.4 Lọc theo vai trò (nếu người dùng chọn 1 role cụ thể)
            if (roleFilterId != null) {
                String idTk = nv.getIdTk();
                if (idTk == null) {
                    // nhân viên không có tài khoản => không có role => không match
                    continue;
                }
                Set<String> staffRoleIds = roleIdsByTk.get(idTk);
                if (staffRoleIds == null || !staffRoleIds.contains(roleFilterId)) {
                    continue;
                }
            }

            // 5.5 Chuẩn bị dữ liệu hiển thị
            CoSo campus = campusById.get(nv.getIdCs());
            String campusName = campus != null ? campus.getTenCoSo() : null;
            List<String> roleNames = roleNamesByTk.getOrDefault(nv.getIdTk(), Collections.emptyList());

            results.add(toNhanSuResponse(nv, campusName, roleNames));
        }

        // Hiện tại trả về full list (FE tự lo phân trang nếu cần)
        return results;
    }

    /**
     * Giá trị filter từ FE:
     * - null, "", "all", "ALL", "tatca", "tat ca" => coi như KHÔNG LỌC
     * - các giá trị khác giữ nguyên (dùng để so sánh)
     */
    private String normalizeFilterValue(String s) {
        if (s == null) return null;
        String trimmed = s.trim();
        if (trimmed.isEmpty()) return null;

        String lower = trimmed.toLowerCase(Locale.ROOT);
        if ("all".equals(lower) || "tatca".equals(lower) || "tat ca".equals(lower)) {
            return null;
        }
        return trimmed;
    }


    @Override
    @Transactional(readOnly = true)
    public NhanSuGiangVienResponse getStaffById(String idNv) {
        NhanVien nv = nhanVienRepository.findById(idNv)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân sự với ID_NV = " + idNv));

        CoSo campus = null;
        if (nv.getIdCs() != null) {
            campus = coSoRepository.findById(nv.getIdCs()).orElse(null);
        }
        String campusName = null;
        if (campus != null) {
            campusName = campus.getTenCoSo();
        }

        List<String> roleNames = getRoleNamesByAccountId(nv.getIdTk());

        return toNhanSuResponse(nv, campusName, roleNames);
    }

    @Override
    public NhanSuGiangVienResponse createStaff(NhanSuGiangVienRequest.StaffUpsert request) {
        // Sinh ID_TK & ID_NV
        String idTk = generateId("TK", 8, taiKhoanRepository::existsById);
        String idNv = generateId("NV", 6, nhanVienRepository::existsById);

        // 1. Tạo tài khoản (chưa gán ID_NV để tránh FK vòng)
        TaiKhoan account = TaiKhoan.builder()
                .idTk(idTk)
                .email(request.getEmail())
                .passWord("123456")   // mật khẩu mặc định, bạn có thể đổi
                .trangThai("ACTIVE")
                .thoiDiemTao(LocalDateTime.now())
                .build();
        taiKhoanRepository.save(account);

        // 2. Tạo nhân viên, gán ID_TK
        NhanVien nv = NhanVien.builder()
                .idNv(idNv)
                .idTk(idTk)
                .idCs(request.getIdCs())
                .ho(request.getHo())
                .tenDem(request.getTenDem())
                .ten(request.getTen())
                .email(request.getEmail())
                .sdt(request.getSdt())
                .gioiTinh(request.getGioiTinh())
                .chuyenMon(request.getChuyenMon())
                .kinhNghiem(request.getKinhNghiem())
                .chucVu(request.getChucVu())
                .trangThaiHoatDong(
                        request.getTrangThaiHoatDong() == null || request.getTrangThaiHoatDong()
                )
                .thoiGianTao(LocalDateTime.now())
                .thoiGianCapNhat(LocalDateTime.now())
                .build();
        nhanVienRepository.save(nv);

        // 3. Cập nhật lại TaiKhoan.ID_NV sau khi đã có NhanVien
        account.setIdNv(idNv);
        taiKhoanRepository.save(account);

        // 4. Gán role nếu có
        if (request.getRoleId() != null && !request.getRoleId().isBlank()) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy Role " + request.getRoleId()));

            TaiKhoanVaiTroId tvId = TaiKhoanVaiTroId.builder()
                    .idTk(idTk)
                    .idRole(role.getIdRole())
                    .build();

            TaiKhoan_VaiTro mapping = TaiKhoan_VaiTro.builder()
                    .id(tvId)
                    .taiKhoan(account)
                    .role(role)
                    .build();

            taiKhoanVaiTroRepository.save(mapping);
        }

        CoSo campus = null;
        if (nv.getIdCs() != null) {
            campus = coSoRepository.findById(nv.getIdCs()).orElse(null);
        }
        String campusName = (campus != null) ? campus.getTenCoSo() : null;

        List<String> roleNames = getRoleNamesByAccountId(idTk);

        return toNhanSuResponse(nv, campusName, roleNames);
    }

    @Override
    public NhanSuGiangVienResponse updateStaff(String idNv, NhanSuGiangVienRequest.StaffUpsert request) {
        NhanVien nv = nhanVienRepository.findById(idNv)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân sự với ID_NV = " + idNv));

        nv.setHo(request.getHo());
        nv.setTenDem(request.getTenDem());
        nv.setTen(request.getTen());
        nv.setEmail(request.getEmail());
        nv.setSdt(request.getSdt());
        nv.setGioiTinh(request.getGioiTinh());
        nv.setIdCs(request.getIdCs());
        nv.setChucVu(request.getChucVu());
        nv.setChuyenMon(request.getChuyenMon());
        nv.setKinhNghiem(request.getKinhNghiem());
        if (request.getTrangThaiHoatDong() != null) {
            nv.setTrangThaiHoatDong(request.getTrangThaiHoatDong());
        }
        nv.setThoiGianCapNhat(LocalDateTime.now());

        nhanVienRepository.save(nv);

        // Sync email, trạng thái sang TaiKhoan nếu có
        if (nv.getIdTk() != null) {
            taiKhoanRepository.findById(nv.getIdTk()).ifPresent(tk -> {
                tk.setEmail(request.getEmail());
                taiKhoanRepository.save(tk);
            });
        }

        // Cập nhật role: xóa mapping cũ, giữ 1 role chính mới
        if (request.getRoleId() != null && nv.getIdTk() != null) {
            // Xóa mapping cũ
            List<TaiKhoan_VaiTro> allMappings = taiKhoanVaiTroRepository.findAll();
            List<TaiKhoan_VaiTro> toDelete = allMappings.stream()
                    .filter(m -> m.getTaiKhoan() != null
                            && nv.getIdTk().equals(m.getTaiKhoan().getIdTk()))
                    .collect(Collectors.toList());
            taiKhoanVaiTroRepository.deleteAll(toDelete);

            // Tạo mapping mới (nếu roleId không rỗng)
            if (!request.getRoleId().isBlank()) {
                Role role = roleRepository.findById(request.getRoleId())
                        .orElseThrow(() -> new NoSuchElementException("Không tìm thấy Role " + request.getRoleId()));

                TaiKhoan tk = taiKhoanRepository.findById(nv.getIdTk())
                        .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản của nhân sự"));

                TaiKhoanVaiTroId tvId = TaiKhoanVaiTroId.builder()
                        .idTk(tk.getIdTk())
                        .idRole(role.getIdRole())
                        .build();

                TaiKhoan_VaiTro mapping = TaiKhoan_VaiTro.builder()
                        .id(tvId)
                        .taiKhoan(tk)
                        .role(role)
                        .build();

                taiKhoanVaiTroRepository.save(mapping);
            }
        }

        CoSo campus = null;
        if (nv.getIdCs() != null) {
            campus = coSoRepository.findById(nv.getIdCs()).orElse(null);
        }
        String campusName = (campus != null) ? campus.getTenCoSo() : null;

        List<String> roleNames = getRoleNamesByAccountId(nv.getIdTk());

        return toNhanSuResponse(nv, campusName, roleNames);
    }

    @Override
    public void deleteStaff(String idNv) {
        NhanVien nv = nhanVienRepository.findById(idNv)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân sự với ID_NV = " + idNv));

        String idTk = nv.getIdTk();

        try {
            // 1. Xóa toàn bộ hợp đồng của nhân sự này
            List<HopDong> hopDongs = hopDongRepository.findAll().stream()
                    .filter(h -> idNv.equals(h.getIdNv()))
                    .collect(Collectors.toList());
            hopDongRepository.deleteAll(hopDongs);

            // 2. Xóa mapping role
            if (idTk != null) {
                List<TaiKhoan_VaiTro> mappings = taiKhoanVaiTroRepository.findAll().stream()
                        .filter(m -> m.getTaiKhoan() != null
                                && idTk.equals(m.getTaiKhoan().getIdTk()))
                        .collect(Collectors.toList());
                taiKhoanVaiTroRepository.deleteAll(mappings);
            }

            // 3. Cập nhật TaiKhoan.ID_NV = null rồi lưu lại
            TaiKhoan account = null;
            if (idTk != null) {
                account = taiKhoanRepository.findById(idTk).orElse(null);
            }
            if (account != null) {
                account.setIdNv(null);
                taiKhoanRepository.save(account);
            }

            // 4. Xóa nhân viên
            nhanVienRepository.delete(nv);

            // 5. Xóa tài khoản (sau khi đã xóa nhân viên)
            if (account != null) {
                taiKhoanRepository.delete(account);
            }
        } catch (DataIntegrityViolationException ex) {
            // Vẫn còn bị FK từ LopHoc, CoVan_HocSinh... => báo lỗi rõ ràng
            throw new IllegalStateException(
                    "Không thể xóa nhân sự vì đang được sử dụng ở bảng khác (LopHoc, CoVan_HocSinh, ...)", ex
            );
        }
    }

    @Override
    public void updateStaffStatus(String idNv, boolean active) {
        NhanVien nv = nhanVienRepository.findById(idNv)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân sự với ID_NV = " + idNv));

        nv.setTrangThaiHoatDong(active);
        nv.setThoiGianCapNhat(LocalDateTime.now());
        nhanVienRepository.save(nv);

        if (nv.getIdTk() != null) {
            taiKhoanRepository.findById(nv.getIdTk()).ifPresent(tk -> {
                tk.setTrangThai(active ? "ACTIVE" : "INACTIVE");
                taiKhoanRepository.save(tk);
            });
        }
    }

    // ==================== HỢP ĐỒNG ====================

    @Override
    @Transactional(readOnly = true)
    public List<NhanSuGiangVienResponse.ContractInfo> searchContracts(NhanSuGiangVienRequest.ContractSearch filter) {
        List<HopDong> allContracts = hopDongRepository.findAll();

        String keyword = normalize(filter.getSearchKeyword());
        String staffId = nullIfBlank(filter.getStaffId());
        String contractType = nullIfBlank(filter.getContractType());
        String status = nullIfBlank(filter.getStatus()); // active | expired | terminated

        Map<String, NhanVien> staffById = nhanVienRepository.findAll().stream()
                .collect(Collectors.toMap(NhanVien::getIdNv, Function.identity(), (a, b) -> a));

        List<NhanSuGiangVienResponse.ContractInfo> results = new ArrayList<>();

        for (HopDong hd : allContracts) {
            NhanVien nv = staffById.get(hd.getIdNv());

            // Lọc staffId
            if (staffId != null && !staffId.equalsIgnoreCase(hd.getIdNv())) {
                continue;
            }

            // Lọc loại HĐ
            if (contractType != null && (hd.getLoaiHopDong() == null
                    || !contractType.equalsIgnoreCase(hd.getLoaiHopDong()))) {
                continue;
            }

            // Lọc trạng thái
            if (status != null) {
                String computedStatus = computeContractStatus(hd);
                if (!status.equalsIgnoreCase(computedStatus)) {
                    continue;
                }
            }

            // Lọc keyword: theo ID_HD hoặc tên nhân viên
            if (keyword != null) {
                String hdId = hd.getIdHd() != null ? hd.getIdHd().toLowerCase() : "";
                String staffName = "";
                if (nv != null) {
                    staffName = buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen()).toLowerCase();
                }

                if (!hdId.contains(keyword) && !staffName.contains(keyword)) {
                    continue;
                }
            }

            results.add(toContractResponse(hd, nv));
        }

        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public NhanSuGiangVienResponse.ContractInfo getContractById(String idHd) {
        HopDong hd = hopDongRepository.findById(idHd)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy hợp đồng với ID_HD = " + idHd));

        NhanVien nv = null;
        if (hd.getIdNv() != null) {
            nv = nhanVienRepository.findById(hd.getIdNv()).orElse(null);
        }

        return toContractResponse(hd, nv);
    }

    @Override
    public NhanSuGiangVienResponse.ContractInfo createContract(NhanSuGiangVienRequest.ContractUpsert request) {
        String idHd = generateId("HD", 6, hopDongRepository::existsById);

        HopDong hd = new HopDong();
        hd.setIdHd(idHd);
        applyContractUpsert(hd, request);

        if (hd.getThoiGianTao() == null) {
            hd.setThoiGianTao(LocalDateTime.now());
        }
        hd.setThoiGianCapNhat(LocalDateTime.now());

        hopDongRepository.save(hd);

        NhanVien nv = null;
        if (hd.getIdNv() != null) {
            nv = nhanVienRepository.findById(hd.getIdNv()).orElse(null);
        }

        return toContractResponse(hd, nv);
    }

    @Override
    public NhanSuGiangVienResponse.ContractInfo updateContract(String idHd, NhanSuGiangVienRequest.ContractUpsert request) {
        HopDong hd = hopDongRepository.findById(idHd)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy hợp đồng với ID_HD = " + idHd));

        applyContractUpsert(hd, request);
        if (hd.getThoiGianTao() == null) {
            hd.setThoiGianTao(LocalDateTime.now());
        }
        hd.setThoiGianCapNhat(LocalDateTime.now());

        hopDongRepository.save(hd);

        NhanVien nv = null;
        if (hd.getIdNv() != null) {
            nv = nhanVienRepository.findById(hd.getIdNv()).orElse(null);
        }

        return toContractResponse(hd, nv);
    }

    @Override
    public void deleteContract(String idHd) {
        HopDong hd = hopDongRepository.findById(idHd)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy hợp đồng với ID_HD = " + idHd));

        String idNv = hd.getIdNv();
        if (idNv != null) {
            long count = hopDongRepository.findAll().stream()
                    .filter(h -> idNv.equals(h.getIdNv()))
                    .count();
            if (count <= 1) {
                throw new IllegalStateException("Không thể xóa hợp đồng cuối cùng của nhân sự này.");
            }
        }

        hopDongRepository.delete(hd);
    }

    // ==================== HELPER ====================

    private NhanSuGiangVienResponse toNhanSuResponse(NhanVien nv,
                                                     String campusName,
                                                     List<String> roleNames) {
        String fullName = buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen());

        return NhanSuGiangVienResponse.builder()
                .idNv(nv.getIdNv())
                .ho(nv.getHo())
                .tenDem(nv.getTenDem())
                .ten(nv.getTen())
                .fullName(fullName)
                .email(nv.getEmail())
                .sdt(nv.getSdt())
                .gioiTinh(nv.getGioiTinh())
                .idCs(nv.getIdCs())
                .campusName(campusName)
                .chucVu(nv.getChucVu())
                .chuyenMon(nv.getChuyenMon())
                .kinhNghiem(nv.getKinhNghiem())
                .trangThaiHoatDong(nv.getTrangThaiHoatDong())
                .idTk(nv.getIdTk())
                .roleNames(roleNames)
                .thoiGianTao(nv.getThoiGianTao())
                .thoiGianCapNhat(nv.getThoiGianCapNhat())
                .build();
    }

    private NhanSuGiangVienResponse.ContractInfo toContractResponse(HopDong hd, NhanVien nv) {
        String staffName = null;
        if (nv != null) {
            staffName = buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen());
        }

        return NhanSuGiangVienResponse.ContractInfo.builder()
                .idHd(hd.getIdHd())
                .idNv(hd.getIdNv())
                .staffName(staffName)
                .loaiHopDong(hd.getLoaiHopDong())
                .hinhThucDay(hd.getHinhThucDay())
                .phamViCongViec(hd.getPhamViCongViec())
                .ngayKy(toLocalDate(hd.getNgayKy()))
                .ngayHieuLuc(toLocalDate(hd.getNgayHieuLuc()))
                .ngayKetThuc(toLocalDate(hd.getNgayKetThuc()))
                .chamDutHD(hd.getChamDutHd())
                .ngayChamDutHD(toLocalDate(hd.getNgayChamDutHd()))
                .build();
    }

    private void applyContractUpsert(HopDong hd, NhanSuGiangVienRequest.ContractUpsert req) {
        hd.setIdNv(req.getIdNv());
        hd.setLoaiHopDong(req.getLoaiHopDong());
        hd.setHinhThucDay(req.getHinhThucDay());
        hd.setPhamViCongViec(req.getPhamViCongViec());

        if (req.getNgayKy() != null) {
            hd.setNgayKy(req.getNgayKy().atStartOfDay());
        }
        if (req.getNgayHieuLuc() != null) {
            hd.setNgayHieuLuc(req.getNgayHieuLuc().atStartOfDay());
        }
        if (req.getNgayKetThuc() != null) {
            hd.setNgayKetThuc(req.getNgayKetThuc().atStartOfDay());
        }

        hd.setChamDutHd(req.getChamDutHD());
        if (req.getNgayChamDutHD() != null) {
            hd.setNgayChamDutHd(req.getNgayChamDutHD().atStartOfDay());
        }
    }

    private List<String> getRoleNamesByAccountId(String idTk) {
        if (idTk == null) return Collections.emptyList();

        return taiKhoanVaiTroRepository.findAll().stream()
                .filter(m -> m.getTaiKhoan() != null
                        && idTk.equals(m.getTaiKhoan().getIdTk())
                        && m.getRole() != null)
                .map(m -> m.getRole().getTenVaiTro())
                .collect(Collectors.toList());
    }

    private String generateId(String prefix,
                              int randomLen,
                              java.util.function.Predicate<String> existsFn) {
        Random rnd = new Random();
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        while (true) {
            StringBuilder sb = new StringBuilder(prefix);
            for (int i = 0; i < randomLen; i++) {
                sb.append(chars.charAt(rnd.nextInt(chars.length())));
            }
            String id = sb.toString();
            if (!existsFn.test(id)) {
                return id;
            }
        }
    }

    private String buildFullName(String ho, String tenDem, String ten) {
        StringBuilder sb = new StringBuilder();
        if (ho != null && !ho.isBlank()) sb.append(ho.trim());
        if (tenDem != null && !tenDem.isBlank()) {
            if (!sb.isEmpty()) sb.append(' ');
            sb.append(tenDem.trim());
        }
        if (ten != null && !ten.isBlank()) {
            if (!sb.isEmpty()) sb.append(' ');
            sb.append(ten.trim());
        }
        return sb.toString();
    }

    private String normalize(String s) {
        if (s == null || s.isBlank()) return null;
        return s.toLowerCase().trim();
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private String computeContractStatus(HopDong hd) {
        Boolean terminated = hd.getChamDutHd();
        LocalDate today = LocalDate.now();
        LocalDate endDate = toLocalDate(hd.getNgayKetThuc());

        if (Boolean.TRUE.equals(terminated)) {
            return "terminated";
        }
        if (endDate != null && endDate.isBefore(today)) {
            return "expired";
        }
        return "active";
    }

    private LocalDate toLocalDate(LocalDateTime dt) {
        return dt != null ? dt.toLocalDate() : null;
    }
}
