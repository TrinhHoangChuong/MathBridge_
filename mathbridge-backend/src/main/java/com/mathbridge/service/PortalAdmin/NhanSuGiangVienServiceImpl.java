package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.NhanSuGiangVienRequest;
import com.mathbridge.dto.PortalAdmin.Response.NhanSuGiangVienResponse;
import com.mathbridge.entity.CoSo;
import com.mathbridge.entity.HopDong;
import com.mathbridge.entity.NhanVien;
import com.mathbridge.entity.Role;
import com.mathbridge.entity.TaiKhoan;
import com.mathbridge.entity.TaiKhoan_VaiTro;
import com.mathbridge.repository.Admin.CoSoAdminRepository;
import com.mathbridge.repository.Admin.HopDongAdminRepository;
import com.mathbridge.repository.Admin.NhanVienAdminRepository;
import com.mathbridge.repository.Admin.RoleAdminRepository;
import com.mathbridge.repository.Admin.TaiKhoanAdminRepository;
import com.mathbridge.repository.Admin.TaiKhoanVaiTroAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class NhanSuGiangVienServiceImpl implements NhanSuGiangVienService {

    private final NhanVienAdminRepository nhanVienRepository;
    private final HopDongAdminRepository hopDongRepository;
    private final CoSoAdminRepository coSoRepository;
    private final TaiKhoanAdminRepository taiKhoanRepository;
    private final RoleAdminRepository roleRepository;
    private final TaiKhoanVaiTroAdminRepository taiKhoanVaiTroRepository;

    // ========================================================
    // DROPDOWNS
    // ========================================================

    @Override
    @Transactional(readOnly = true)
    public List<NhanSuGiangVienResponse.CampusOption> getAllCampuses() {
        return coSoRepository.findAll()
                .stream()
                .map(cs -> NhanSuGiangVienResponse.CampusOption.builder()
                        .idCs(cs.getIdCs())
                        .tenCoSo(cs.getTenCoSo())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NhanSuGiangVienResponse.RoleOption> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(r -> NhanSuGiangVienResponse.RoleOption.builder()
                        .idRole(r.getIdRole())
                        .tenVaiTro(r.getTenVaiTro())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NhanSuGiangVienResponse.AccountOption> getAvailableAccounts() {
        List<NhanVien> allStaff = nhanVienRepository.findAll();
        Set<String> usedAccountIds = allStaff.stream()
                .map(NhanVien::getIdTk)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<TaiKhoan> allAccounts = taiKhoanRepository.findAll();
        RoleMapping mapping = loadRoleMapping();

        return allAccounts.stream()
                // chưa gắn với bất kỳ nhân viên nào
                .filter(tk -> !usedAccountIds.contains(tk.getIdTk()))
                // trạng thái phù hợp (ACTIVE hoặc null)
                .filter(tk -> {
                    String st = tk.getTrangThai();
                    if (!StringUtils.hasText(st)) return true;
                    return "ACTIVE".equalsIgnoreCase(st.trim());
                })
                .map(tk -> {
                    String ownerType;
                    if (StringUtils.hasText(tk.getIdNv())) {
                        ownerType = "NV";
                    } else if (StringUtils.hasText(tk.getIdHs())) {
                        ownerType = "HS";
                    } else {
                        ownerType = "OTHER";
                    }

                    List<String> roleNames = mapping.roleNamesByTk
                            .getOrDefault(tk.getIdTk(), Collections.emptyList());

                    return NhanSuGiangVienResponse.AccountOption.builder()
                            .idTk(tk.getIdTk())
                            .email(tk.getEmail())
                            .roleNames(roleNames)
                            .ownerType(ownerType)
                            .idNv(tk.getIdNv())
                            .idHs(tk.getIdHs())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ========================================================
    // NHÂN SỰ
    // ========================================================

    @Override
    @Transactional(readOnly = true)
    public List<NhanSuGiangVienResponse.StaffInfo> searchStaff(NhanSuGiangVienRequest filter) {
        if (filter == null) {
            filter = new NhanSuGiangVienRequest();
        }

        String keyword = normalize(filter.getSearchKeyword());
        String campusId = normalizeFilterValue(filter.getCampusId());
        String roleFilterId = normalizeFilterValue(filter.getRoleId());
        String statusRaw = normalizeFilterValue(filter.getStatus());

        Boolean activeFilter = null;
        if ("active".equalsIgnoreCase(statusRaw)) {
            activeFilter = Boolean.TRUE;
        } else if ("inactive".equalsIgnoreCase(statusRaw)) {
            activeFilter = Boolean.FALSE;
        }

        List<NhanVien> allStaff = nhanVienRepository.findAll();
        Map<String, CoSo> campusById = coSoRepository.findAll()
                .stream()
                .collect(Collectors.toMap(CoSo::getIdCs, Function.identity()));

        RoleMapping roleMapping = loadRoleMapping();

        List<NhanSuGiangVienResponse.StaffInfo> matched = new ArrayList<>();

        for (NhanVien nv : allStaff) {
            // keyword
            if (keyword != null) {
                String fullName = buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen());
                String email = Optional.ofNullable(nv.getEmail()).orElse("");
                String sdt = Optional.ofNullable(nv.getSdt()).orElse("");

                String combined = (fullName + " " + email + " " + sdt).toLowerCase();
                if (!combined.contains(keyword)) {
                    continue;
                }
            }

            // campus
            if (campusId != null && !campusId.equalsIgnoreCase(nv.getIdCs())) {
                continue;
            }

            // status
            if (activeFilter != null) {
                Boolean current = nv.getTrangThaiHoatDong();
                boolean isActive = current == null || Boolean.TRUE.equals(current);
                if (!activeFilter.equals(isActive)) {
                    continue;
                }
            }

            // role filter
            if (roleFilterId != null) {
                String idTk = nv.getIdTk();
                if (idTk == null) {
                    continue;
                }
                Set<String> staffRoleIds = roleMapping.roleIdsByTk.get(idTk);
                if (staffRoleIds == null || !staffRoleIds.contains(roleFilterId)) {
                    continue;
                }
            }

            CoSo campus = campusById.get(nv.getIdCs());
            String campusName = campus != null ? campus.getTenCoSo() : null;

            List<String> roleNames = roleMapping.roleNamesByTk
                    .getOrDefault(nv.getIdTk(), Collections.emptyList());

            matched.add(toStaffInfo(nv, campusName, roleNames));
        }

        Integer page = filter.getPage();
        Integer size = filter.getSize();
        if (page != null && size != null && page >= 0 && size > 0) {
            int from = page * size;
            if (from >= matched.size()) {
                return Collections.emptyList();
            }
            int to = Math.min(from + size, matched.size());
            return matched.subList(from, to);
        }

        return matched;
    }

    @Override
    @Transactional(readOnly = true)
    public NhanSuGiangVienResponse.StaffInfo getStaffDetail(String idNv) {
        NhanVien nv = nhanVienRepository.findById(idNv)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân sự với ID_NV = " + idNv));

        CoSo campus = null;
        if (nv.getIdCs() != null) {
            campus = coSoRepository.findById(nv.getIdCs()).orElse(null);
        }
        String campusName = campus != null ? campus.getTenCoSo() : null;

        RoleMapping roleMapping = loadRoleMapping();
        List<String> roleNames = roleMapping.roleNamesByTk
                .getOrDefault(nv.getIdTk(), Collections.emptyList());

        return toStaffInfo(nv, campusName, roleNames);
    }

    @Override
    public NhanSuGiangVienResponse.StaffInfo createStaff(NhanSuGiangVienRequest.StaffUpsert request) {
        // 1. Validate input
        if (!StringUtils.hasText(request.getIdTk())) {
            throw new IllegalArgumentException("Vui lòng chọn tài khoản hệ thống cho nhân sự (ID_TK).");
        }
        if (!StringUtils.hasText(request.getIdCs())) {
            throw new IllegalArgumentException("Cơ sở làm việc (ID_CS) là bắt buộc.");
        }
        if (request.getGioiTinh() == null) {
            throw new IllegalArgumentException("Giới tính nhân sự là bắt buộc.");
        }

        // 2. Tìm tài khoản theo ID_TK
        String idTk = request.getIdTk().trim();
        TaiKhoan account = taiKhoanRepository.findById(idTk)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản với ID_TK = " + idTk));

        // 3. Đảm bảo tài khoản chưa gán cho nhân sự khác
        ensureAccountNotUsedByOtherStaff(idTk, null, account);

        // 4. Kiểm tra trạng thái tài khoản (không LOCKED)
        if (account.getTrangThai() != null) {
            String st = account.getTrangThai().trim().toUpperCase();
            if ("LOCKED".equals(st)) {
                throw new IllegalStateException("Tài khoản này đang bị khóa, không thể gán cho nhân sự.");
            }
        }

        // 5. Nếu sau này FE gửi roleId, có thể validate role ở đây (hiện tại FE chưa dùng)

        // 6. Kiểm tra CoSo tồn tại
        CoSo campus = coSoRepository.findById(request.getIdCs())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy cơ sở với ID_CS = " + request.getIdCs()));

        // 7. Tạo ID_NV mới
        String idNv = generateId("NV", 6, nhanVienRepository::existsById);

        // 8. Tạo entity NhanVien
        NhanVien nv = new NhanVien();
        nv.setIdNv(idNv);
        nv.setIdTk(idTk);
        nv.setIdCs(campus.getIdCs());

        nv.setHo(request.getHo());
        nv.setTenDem(request.getTenDem());
        nv.setTen(request.getTen());

        // Email nhân sự luôn = Email tài khoản
        nv.setEmail(account.getEmail());

        nv.setGioiTinh(request.getGioiTinh());
        nv.setSdt(request.getSdt());
        nv.setChuyenMon(request.getChuyenMon());
        nv.setKinhNghiem(request.getKinhNghiem());
        nv.setChucVu(request.getChucVu());

        nv.setTrangThaiHoatDong(
                request.getTrangThaiHoatDong() != null ? request.getTrangThaiHoatDong() : Boolean.TRUE
        );

        LocalDateTime now = LocalDateTime.now();
        nv.setThoiGianTao(now);
        nv.setThoiGianCapNhat(now);

        nhanVienRepository.save(nv);

        // 9. Đồng bộ ngược ID_NV vào tài khoản
        if (account.getIdNv() == null || !idNv.equals(account.getIdNv())) {
            account.setIdNv(idNv);
            taiKhoanRepository.save(account);
        }

        List<String> roleNames = loadRoleMapping()
                .roleNamesByTk
                .getOrDefault(idTk, Collections.emptyList());

        return toStaffInfo(nv, campus.getTenCoSo(), roleNames);
    }

    @Override
    public NhanSuGiangVienResponse.StaffInfo updateStaff(String idNv, NhanSuGiangVienRequest.StaffUpsert request) {
        NhanVien nv = nhanVienRepository.findById(idNv)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân sự với ID_NV = " + idNv));

        // Không cho đổi tài khoản (ID_TK) ở đây
        String idTk = nv.getIdTk();
        TaiKhoan account = null;
        if (idTk != null) {
            account = taiKhoanRepository.findById(idTk).orElse(null);
        }

        nv.setHo(request.getHo());
        nv.setTenDem(request.getTenDem());
        nv.setTen(request.getTen());
        nv.setSdt(request.getSdt());
        nv.setChuyenMon(request.getChuyenMon());
        nv.setKinhNghiem(request.getKinhNghiem());
        nv.setChucVu(request.getChucVu());

        if (request.getGioiTinh() != null) {
            nv.setGioiTinh(request.getGioiTinh());
        }

        if (StringUtils.hasText(request.getIdCs())) {
            CoSo campus = coSoRepository.findById(request.getIdCs())
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy cơ sở với ID_CS = " + request.getIdCs()));
            nv.setIdCs(campus.getIdCs());
        }

        if (request.getTrangThaiHoatDong() != null) {
            nv.setTrangThaiHoatDong(request.getTrangThaiHoatDong());
        }

        // Email nhân sự luôn sync theo tài khoản (nếu có)
        if (account != null) {
            nv.setEmail(account.getEmail());
        }

        nv.setThoiGianCapNhat(LocalDateTime.now());
        nhanVienRepository.save(nv);

        CoSo campus = null;
        if (nv.getIdCs() != null) {
            campus = coSoRepository.findById(nv.getIdCs()).orElse(null);
        }
        String campusName = campus != null ? campus.getTenCoSo() : null;

        List<String> roleNames = loadRoleMapping()
                .roleNamesByTk
                .getOrDefault(idTk, Collections.emptyList());

        return toStaffInfo(nv, campusName, roleNames);
    }

    @Override
    public void updateStaffStatus(String idNv, boolean active) {
        NhanVien nv = nhanVienRepository.findById(idNv)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân sự với ID_NV = " + idNv));

        nv.setTrangThaiHoatDong(active);
        nv.setThoiGianCapNhat(LocalDateTime.now());
        nhanVienRepository.save(nv);
    }

    @Override
    public void deleteStaff(String idNv) {
        NhanVien nv = nhanVienRepository.findById(idNv)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân sự với ID_NV = " + idNv));

        String idTk = nv.getIdTk();

        // 1. Xóa toàn bộ hợp đồng của nhân sự này
        List<HopDong> contracts = hopDongRepository.findAll()
                .stream()
                .filter(h -> idNv.equals(h.getIdNv()))
                .collect(Collectors.toList());
        if (!contracts.isEmpty()) {
            hopDongRepository.deleteAll(contracts);
        }

        // 2. Xóa nhân sự
        nhanVienRepository.delete(nv);

        // 3. Gỡ liên kết tài khoản, không xóa tài khoản
        if (idTk != null) {
            taiKhoanRepository.findById(idTk).ifPresent(tk -> {
                tk.setIdNv(null);
                if (tk.getTrangThai() == null || !"INACTIVE".equalsIgnoreCase(tk.getTrangThai())) {
                    tk.setTrangThai("INACTIVE");
                }
                taiKhoanRepository.save(tk);
            });
        }
    }

    // ========================================================
    // HỢP ĐỒNG
    // ========================================================

    @Override
    @Transactional(readOnly = true)
    public List<NhanSuGiangVienResponse.ContractInfo> searchContracts(NhanSuGiangVienRequest.ContractSearch filter) {
        if (filter == null) {
            filter = new NhanSuGiangVienRequest.ContractSearch();
        }

        String keyword = normalize(filter.getSearchKeyword());
        String staffId = normalizeFilterValue(filter.getStaffId());
        String contractType = normalizeFilterValue(filter.getContractType());
        String statusRaw = normalizeFilterValue(filter.getStatus());

        List<HopDong> allContracts = hopDongRepository.findAll();

        Map<String, NhanVien> staffById = nhanVienRepository.findAll()
                .stream()
                .collect(Collectors.toMap(NhanVien::getIdNv, Function.identity()));

        List<NhanSuGiangVienResponse.ContractInfo> matched = new ArrayList<>();

        for (HopDong hd : allContracts) {

            if (staffId != null && !staffId.equalsIgnoreCase(hd.getIdNv())) {
                continue;
            }

            if (contractType != null) {
                String loai = Optional.ofNullable(hd.getLoaiHopDong()).orElse("");
                if (!loai.equalsIgnoreCase(contractType)) {
                    continue;
                }
            }

            if (statusRaw != null) {
                String status = computeContractStatus(hd);
                if (!statusRaw.equalsIgnoreCase(status)) {
                    continue;
                }
            }

            NhanVien nv = hd.getIdNv() != null ? staffById.get(hd.getIdNv()) : null;
            String staffName = nv != null
                    ? buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen())
                    : null;

            if (keyword != null) {
                String combined = ((staffName != null ? staffName : "")
                        + " " + Optional.ofNullable(hd.getLoaiHopDong()).orElse("")
                        + " " + Optional.ofNullable(hd.getHinhThucDay()).orElse(""))
                        .toLowerCase();
                if (!combined.contains(keyword)) {
                    continue;
                }
            }

            matched.add(toContractInfo(hd, staffName));
        }

        Integer page = filter.getPage();
        Integer size = filter.getSize();
        if (page != null && size != null && page >= 0 && size > 0) {
            int from = page * size;
            if (from >= matched.size()) {
                return Collections.emptyList();
            }
            int to = Math.min(from + size, matched.size());
            return matched.subList(from, to);
        }

        return matched;
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
        String staffName = nv != null
                ? buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen())
                : null;

        return toContractInfo(hd, staffName);
    }

    @Override
    public NhanSuGiangVienResponse.ContractInfo createContract(NhanSuGiangVienRequest.ContractUpsert request) {
        if (!StringUtils.hasText(request.getIdNv())) {
            throw new IllegalArgumentException("Hợp đồng phải gắn với một nhân sự (ID_NV).");
        }

        NhanVien nv = nhanVienRepository.findById(request.getIdNv())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân sự với ID_NV = " + request.getIdNv()));

        String idHd = generateId("HD", 6, hopDongRepository::existsById);

        HopDong hd = new HopDong();
        hd.setIdHd(idHd);

        applyContractUpsert(hd, request);

        if (hd.getThoiGianTao() == null) {
            hd.setThoiGianTao(LocalDateTime.now());
        }
        hd.setThoiGianCapNhat(LocalDateTime.now());

        hopDongRepository.save(hd);

        String staffName = buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen());
        return toContractInfo(hd, staffName);
    }

    @Override
    public NhanSuGiangVienResponse.ContractInfo updateContract(String idHd, NhanSuGiangVienRequest.ContractUpsert request) {
        HopDong hd = hopDongRepository.findById(idHd)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy hợp đồng với ID_HD = " + idHd));

        applyContractUpsert(hd, request);
        hd.setThoiGianCapNhat(LocalDateTime.now());
        hopDongRepository.save(hd);

        NhanVien nv = null;
        if (hd.getIdNv() != null) {
            nv = nhanVienRepository.findById(hd.getIdNv()).orElse(null);
        }
        String staffName = nv != null
                ? buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen())
                : null;

        return toContractInfo(hd, staffName);
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
                throw new IllegalStateException(
                        "Không thể xóa hợp đồng cuối cùng của nhân sự này. " +
                                "Nếu muốn chấm dứt toàn bộ, hãy xóa nhân sự (nghỉ việc)."
                );
            }
        }

        hopDongRepository.delete(hd);
    }

    // ========================================================
    // MAPPING HELPERS
    // ========================================================

    private NhanSuGiangVienResponse.StaffInfo toStaffInfo(NhanVien nv,
                                                          String campusName,
                                                          List<String> roleNames) {
        return NhanSuGiangVienResponse.StaffInfo.builder()
                .idNv(nv.getIdNv())
                .ho(nv.getHo())
                .tenDem(nv.getTenDem())
                .ten(nv.getTen())
                .email(nv.getEmail())
                .sdt(nv.getSdt())
                .gioiTinh(nv.getGioiTinh())
                .idCs(nv.getIdCs())
                .campusName(campusName)
                .chucVu(nv.getChucVu())
                .chuyenMon(nv.getChuyenMon())
                .kinhNghiem(nv.getKinhNghiem())
                .trangThaiHoatDong(
                        nv.getTrangThaiHoatDong() != null ? nv.getTrangThaiHoatDong() : Boolean.TRUE
                )
                .idTk(nv.getIdTk())
                .roleNames(roleNames)
                .thoiGianTao(nv.getThoiGianTao())
                .thoiGianCapNhat(nv.getThoiGianCapNhat())
                .build();
    }

    private NhanSuGiangVienResponse.ContractInfo toContractInfo(HopDong hd, String staffName) {
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
        if (req.getIdNv() != null) {
            nhanVienRepository.findById(req.getIdNv())
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân sự với ID_NV = " + req.getIdNv()));
            hd.setIdNv(req.getIdNv());
        }

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
        if (Boolean.TRUE.equals(req.getChamDutHD())) {
            if (req.getNgayChamDutHD() != null) {
                hd.setNgayChamDutHd(req.getNgayChamDutHD().atStartOfDay());
            } else {
                hd.setNgayChamDutHd(LocalDate.now().atStartOfDay());
            }
        } else {
            hd.setNgayChamDutHd(null);
        }
    }

    // ========================================================
    // UTILITIES
    // ========================================================

    private static String buildFullName(String ho, String tenDem, String ten) {
        StringBuilder sb = new StringBuilder();
        if (StringUtils.hasText(ho)) {
            sb.append(ho.trim());
        }
        if (StringUtils.hasText(tenDem)) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(tenDem.trim());
        }
        if (StringUtils.hasText(ten)) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(ten.trim());
        }
        return sb.toString();
    }

    private static String normalize(String s) {
        if (!StringUtils.hasText(s)) return null;
        return s.trim().toLowerCase();
    }

    private static String normalizeFilterValue(String s) {
        if (!StringUtils.hasText(s)) return null;
        String v = s.trim();
        if ("all".equalsIgnoreCase(v) || "*".equals(v)) {
            return null;
        }
        return v;
    }

    private LocalDate toLocalDate(LocalDateTime dt) {
        return dt != null ? dt.toLocalDate() : null;
    }

    private String generateId(String prefix, int numericLength, Predicate<String> existsFn) {
        Random random = new Random();
        String id;
        do {
            StringBuilder sb = new StringBuilder(prefix);
            for (int i = 0; i < numericLength; i++) {
                sb.append(random.nextInt(10));
            }
            id = sb.toString();
        } while (existsFn.test(id));
        return id;
    }

    private void ensureAccountNotUsedByOtherStaff(String idTk, String currentIdNv, TaiKhoan account) {
        if (!StringUtils.hasText(idTk)) return;

        boolean usedByOther = nhanVienRepository.findAll().stream()
                .anyMatch(nv -> idTk.equals(nv.getIdTk()) &&
                        (currentIdNv == null || !currentIdNv.equals(nv.getIdNv())));
        if (usedByOther) {
            throw new IllegalStateException("Tài khoản này đã được gán cho một nhân sự khác.");
        }

        if (StringUtils.hasText(account.getIdNv())
                && (currentIdNv == null || !account.getIdNv().equals(currentIdNv))) {
            throw new IllegalStateException("Tài khoản này đã có liên kết với một nhân sự khác.");
        }
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

    private RoleMapping loadRoleMapping() {
        List<TaiKhoan_VaiTro> mappings = taiKhoanVaiTroRepository.findAll();

        Map<String, Set<String>> roleIdsByTk = new HashMap<>();
        Map<String, List<String>> roleNamesByTk = new HashMap<>();

        for (TaiKhoan_VaiTro m : mappings) {
            if (m.getId() == null) continue;
            String idTk = m.getId().getIdTk();
            String idRole = m.getId().getIdRole();
            if (!StringUtils.hasText(idTk) || !StringUtils.hasText(idRole)) continue;

            Role r = m.getRole();
            String tenVaiTro = (r != null && r.getTenVaiTro() != null)
                    ? r.getTenVaiTro()
                    : idRole;

            roleIdsByTk.computeIfAbsent(idTk, k -> new HashSet<>())
                    .add(idRole);

            roleNamesByTk.computeIfAbsent(idTk, k -> new ArrayList<>())
                    .add(tenVaiTro);
        }

        RoleMapping rm = new RoleMapping();
        rm.roleIdsByTk = roleIdsByTk;
        rm.roleNamesByTk = roleNamesByTk;
        return rm;
    }

    private static class RoleMapping {
        Map<String, Set<String>> roleIdsByTk = new HashMap<>();
        Map<String, List<String>> roleNamesByTk = new HashMap<>();
    }
}
