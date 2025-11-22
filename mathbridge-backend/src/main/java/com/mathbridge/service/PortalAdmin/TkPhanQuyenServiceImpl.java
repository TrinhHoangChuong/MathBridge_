package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.TkPhanQuyenRequest;
import com.mathbridge.dto.PortalAdmin.Response.TkPhanQuyenResponse;
import com.mathbridge.entity.Role;
import com.mathbridge.entity.TaiKhoan;
import com.mathbridge.entity.TaiKhoan_VaiTro;
import com.mathbridge.repository.Admin.RoleAdminRepository;
import com.mathbridge.repository.Admin.TaiKhoanAdminRepository;
import com.mathbridge.repository.Admin.TaiKhoanVaiTroAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TkPhanQuyenServiceImpl implements TkPhanQuyenService {

    private final TaiKhoanAdminRepository taiKhoanAdminRepository;
    private final RoleAdminRepository roleAdminRepository;
    private final TaiKhoanVaiTroAdminRepository taiKhoanVaiTroAdminRepository;

    // =========================================================
    // ACCOUNTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public TkPhanQuyenResponse.AccountPage searchAccounts(
            TkPhanQuyenRequest.AccountSearchRequest request
    ) {
        int page = Optional.ofNullable(request.getPage()).orElse(0);
        int size = Optional.ofNullable(request.getSize()).orElse(10);
        if (page < 0) page = 0;
        if (size <= 0) size = 10;

        String keyword = Optional.ofNullable(request.getSearchKeyword())
                .map(String::trim)
                .orElse("");
        String roleIdFilter = Optional.ofNullable(request.getRoleId())
                .map(String::trim)
                .orElse("");
        String ownerType = Optional.ofNullable(request.getOwnerType())
                .map(String::trim)
                .orElse("ALL");
        String statusFilter = Optional.ofNullable(request.getStatus())
                .map(String::trim)
                .orElse("ALL");

        // Lấy tất cả tài khoản (có thể thay bằng Page<TaiKhoan> sau nếu muốn)
        List<TaiKhoan> allAccounts = taiKhoanAdminRepository.findAll();

        // Lấy tất cả mapping tài khoản - vai trò một lần
        Set<String> allIdTks = allAccounts.stream()
                .map(TaiKhoan::getIdTk)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<TaiKhoan_VaiTro> allRelations = allIdTks.isEmpty()
                ? Collections.emptyList()
                : taiKhoanVaiTroAdminRepository.findByTaiKhoan_IdTkIn(allIdTks);

        Map<String, List<Role>> rolesByAccount = allRelations.stream()
                .collect(Collectors.groupingBy(
                        rel -> rel.getTaiKhoan().getIdTk(),
                        Collectors.mapping(TaiKhoan_VaiTro::getRole, Collectors.toList())
                ));

        // Lọc theo các tiêu chí
        List<TaiKhoan> filtered = allAccounts.stream()
                .filter(tk -> {
                    if (keyword.isEmpty()) {
                        return true;
                    }
                    String idTk = Optional.ofNullable(tk.getIdTk()).orElse("");
                    String email = Optional.ofNullable(tk.getEmail()).orElse("");
                    String lowerKeyword = keyword.toLowerCase();
                    return idTk.toLowerCase().contains(lowerKeyword)
                            || email.toLowerCase().contains(lowerKeyword);
                })
                .filter(tk -> {
                    // ownerType: ALL | HS | NV | OTHER
                    if ("ALL".equalsIgnoreCase(ownerType)) return true;
                    boolean hasHs = tk.getIdHs() != null && !tk.getIdHs().isBlank();
                    boolean hasNv = tk.getIdNv() != null && !tk.getIdNv().isBlank();
                    return switch (ownerType.toUpperCase()) {
                        case "HS" -> hasHs;
                        case "NV" -> hasNv;
                        case "OTHER" -> !hasHs && !hasNv;
                        default -> true;
                    };
                })
                .filter(tk -> {
                    // status: ALL | ACTIVE | INACTIVE | LOCKED
                    if ("ALL".equalsIgnoreCase(statusFilter)) return true;
                    String st = Optional.ofNullable(tk.getTrangThai()).orElse("");
                    return st.equalsIgnoreCase(statusFilter);
                })
                .filter(tk -> {
                    if (roleIdFilter.isEmpty()) return true;
                    List<Role> accountRoles = rolesByAccount.getOrDefault(
                            tk.getIdTk(),
                            Collections.emptyList()
                    );
                    return accountRoles.stream()
                            .anyMatch(r -> roleIdFilter.equalsIgnoreCase(r.getIdRole()));
                })
                .collect(Collectors.toList());

        long totalElements = filtered.size();
        int totalPages = (int) Math.ceil(totalElements / (double) size);
        if (page >= totalPages && totalPages > 0) {
            page = totalPages - 1;
        }

        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, filtered.size());
        List<TaiKhoan> pageItems = fromIndex >= filtered.size()
                ? Collections.emptyList()
                : filtered.subList(fromIndex, toIndex);

        List<TkPhanQuyenResponse.AccountDto> content = pageItems.stream()
                .map(tk -> toAccountDto(
                        tk,
                        rolesByAccount.getOrDefault(tk.getIdTk(), Collections.emptyList())
                ))
                .collect(Collectors.toList());

        return TkPhanQuyenResponse.AccountPage.builder()
                .content(content)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .page(page)
                .size(size)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TkPhanQuyenResponse.AccountDto getAccountDetail(String idTk) {
        TaiKhoan tk = taiKhoanAdminRepository.findById(idTk)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài khoản với ID_TK=" + idTk
                ));

        List<TaiKhoan_VaiTro> relations =
                taiKhoanVaiTroAdminRepository.findByTaiKhoan_IdTk(idTk);
        List<Role> roles = relations.stream()
                .map(TaiKhoan_VaiTro::getRole)
                .collect(Collectors.toList());

        return toAccountDto(tk, roles);
    }

    @Override
    public TkPhanQuyenResponse.AccountDto createAccount(
            TkPhanQuyenRequest.AccountUpsertRequest request
    ) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email không được để trống"
            );
        }

        String idTk = generateIdTk();

        TaiKhoan tk = new TaiKhoan();
        tk.setIdTk(idTk);
        tk.setEmail(request.getEmail().trim());
        tk.setPassWord(request.getPassWord()); // có thể encode ở layer khác nếu muốn
        tk.setTrangThai(
                Optional.ofNullable(request.getTrangThai()).orElse("ACTIVE")
        );
        tk.setThoiDiemTao(Optional.ofNullable(tk.getThoiDiemTao())
                .orElse(LocalDateTime.now()));

        // idHs / idNv: mapping này nên được tạo từ module Học Sinh / Nhân Sự,
        // nên ở đây không set (tránh sai lệch FK 2 chiều)
        // Nếu bạn muốn set khi create, có thể mở comment:
        // tk.setIdHs(request.getIdHs());
        // tk.setIdNv(request.getIdNv());

        taiKhoanAdminRepository.save(tk);

        // Gán vai trò
        List<Role> roles = applyRolesForAccount(tk, request.getRoleIds());

        return toAccountDto(tk, roles);
    }

    @Override
    public TkPhanQuyenResponse.AccountDto updateAccount(
            String idTk,
            TkPhanQuyenRequest.AccountUpsertRequest request
    ) {
        TaiKhoan tk = taiKhoanAdminRepository.findById(idTk)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài khoản với ID_TK=" + idTk
                ));

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            tk.setEmail(request.getEmail().trim());
        }

        if (request.getTrangThai() != null && !request.getTrangThai().isBlank()) {
            tk.setTrangThai(request.getTrangThai());
        }

        // Chỉ đổi mật khẩu nếu FE gửi lên passWord (không rỗng)
        if (request.getPassWord() != null && !request.getPassWord().isBlank()) {
            tk.setPassWord(request.getPassWord());
        }

        // idHs / idNv giữ nguyên (read-only trong module này)

        taiKhoanAdminRepository.save(tk);

        // Cập nhật lại roles: xóa mapping cũ, tạo mapping mới
        List<Role> roles = applyRolesForAccount(tk, request.getRoleIds());

        return toAccountDto(tk, roles);
    }

    @Override
    public void deleteAccount(String idTk) {
        TaiKhoan tk = taiKhoanAdminRepository.findById(idTk)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài khoản với ID_TK=" + idTk
                ));

        // Xóa mapping TaiKhoan_VaiTro trước
        List<TaiKhoan_VaiTro> relations =
                taiKhoanVaiTroAdminRepository.findByTaiKhoan_IdTk(idTk);
        if (!relations.isEmpty()) {
            taiKhoanVaiTroAdminRepository.deleteAll(relations);
        }

        try {
            taiKhoanAdminRepository.delete(tk);
        } catch (DataIntegrityViolationException ex) {
            // Có FK từ HocSinh, NhanVien, BinhLuanBaiNop...
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể xóa tài khoản do đang được sử dụng ở bảng khác",
                    ex
            );
        }
    }

    // =========================================================
    // ROLES
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public TkPhanQuyenResponse.RolePage searchRoles(
            TkPhanQuyenRequest.RoleSearchRequest request
    ) {
        int page = Optional.ofNullable(request.getPage()).orElse(0);
        int size = Optional.ofNullable(request.getSize()).orElse(10);
        if (page < 0) page = 0;
        if (size <= 0) size = 10;

        String keyword = Optional.ofNullable(request.getSearchKeyword())
                .map(String::trim)
                .orElse("");

        List<Role> allRoles = roleAdminRepository.findAll();

        List<Role> filtered = allRoles.stream()
                .filter(role -> {
                    if (keyword.isEmpty()) return true;
                    String lower = keyword.toLowerCase();
                    String id = Optional.ofNullable(role.getIdRole()).orElse("");
                    String name = Optional.ofNullable(role.getTenVaiTro()).orElse("");
                    return id.toLowerCase().contains(lower)
                            || name.toLowerCase().contains(lower);
                })
                .collect(Collectors.toList());

        long totalElements = filtered.size();
        int totalPages = (int) Math.ceil(totalElements / (double) size);
        if (page >= totalPages && totalPages > 0) {
            page = totalPages - 1;
        }

        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, filtered.size());
        List<Role> pageItems = fromIndex >= filtered.size()
                ? Collections.emptyList()
                : filtered.subList(fromIndex, toIndex);

        List<TkPhanQuyenResponse.RoleDto> content = pageItems.stream()
                .map(this::toRoleDto)
                .collect(Collectors.toList());

        return TkPhanQuyenResponse.RolePage.builder()
                .content(content)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .page(page)
                .size(size)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TkPhanQuyenResponse.RoleDto> getAllRoles() {
        return roleAdminRepository.findAll().stream()
                .map(this::toRoleDto)
                .collect(Collectors.toList());
    }

    @Override
    public TkPhanQuyenResponse.RoleDto createRole(
            TkPhanQuyenRequest.RoleUpsertRequest request
    ) {
        if (request.getIdRole() == null || request.getIdRole().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "ID_Role không được để trống"
            );
        }
        if (request.getTenVaiTro() == null || request.getTenVaiTro().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên vai trò không được để trống"
            );
        }

        String idRole = request.getIdRole().trim();

        if (roleAdminRepository.existsById(idRole)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Đã tồn tại vai trò với ID_Role=" + idRole
            );
        }

        Role role = new Role();
        role.setIdRole(idRole);
        role.setTenVaiTro(request.getTenVaiTro().trim());
        role.setGhiChu(request.getGhiChu());

        roleAdminRepository.save(role);

        return toRoleDto(role);
    }

    @Override
    public TkPhanQuyenResponse.RoleDto updateRole(
            String idRole,
            TkPhanQuyenRequest.RoleUpsertRequest request
    ) {
        Role role = roleAdminRepository.findById(idRole)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy vai trò với ID_Role=" + idRole
                ));

        if (request.getTenVaiTro() != null && !request.getTenVaiTro().isBlank()) {
            role.setTenVaiTro(request.getTenVaiTro().trim());
        }
        role.setGhiChu(request.getGhiChu());

        roleAdminRepository.save(role);

        return toRoleDto(role);
    }

    @Override
    public void deleteRole(String idRole) {
        Role role = roleAdminRepository.findById(idRole)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy vai trò với ID_Role=" + idRole
                ));

        List<TaiKhoan_VaiTro> mappings =
                taiKhoanVaiTroAdminRepository.findByRole_IdRole(idRole);

        if (!mappings.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể xóa vai trò vì đang được gán cho tài khoản"
            );
        }

        roleAdminRepository.delete(role);
    }

    // =========================================================
    // HELPER METHODS
    // =========================================================

    private TkPhanQuyenResponse.AccountDto toAccountDto(
            TaiKhoan tk,
            List<Role> roles
    ) {
        List<TkPhanQuyenResponse.RoleDto> roleDtos = roles == null
                ? Collections.emptyList()
                : roles.stream().map(this::toRoleDto).collect(Collectors.toList());

        return TkPhanQuyenResponse.AccountDto.builder()
                .idTk(tk.getIdTk())
                .email(tk.getEmail())
                .trangThai(tk.getTrangThai())
                .idHs(tk.getIdHs())
                .idNv(tk.getIdNv())
                .thoiDiemTao(tk.getThoiDiemTao())
                .roles(roleDtos)
                .build();
    }

    private TkPhanQuyenResponse.RoleDto toRoleDto(Role role) {
        return TkPhanQuyenResponse.RoleDto.builder()
                .idRole(role.getIdRole())
                .tenVaiTro(role.getTenVaiTro())
                .ghiChu(role.getGhiChu())
                .build();
    }

    /**
     * Gán list roleIds cho 1 tài khoản:
     * - Xóa mapping cũ
     * - Tạo mapping mới theo list roleIds
     */
    private List<Role> applyRolesForAccount(TaiKhoan tk, List<String> roleIds) {
        // Xóa mapping cũ
        List<TaiKhoan_VaiTro> oldRelations =
                taiKhoanVaiTroAdminRepository.findByTaiKhoan_IdTk(tk.getIdTk());
        if (!oldRelations.isEmpty()) {
            taiKhoanVaiTroAdminRepository.deleteAll(oldRelations);
        }

        if (roleIds == null || roleIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Role> roles = roleAdminRepository.findAllById(roleIds);

        // Map id -> entity để kiểm tra thiếu
        Set<String> foundIds = roles.stream()
                .map(Role::getIdRole)
                .collect(Collectors.toSet());

        for (String id : roleIds) {
            if (!foundIds.contains(id)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Không tìm thấy vai trò với ID_Role=" + id
                );
            }
        }

        for (Role role : roles) {
            TaiKhoan_VaiTro rel = new TaiKhoan_VaiTro();
            // assuming entity dạng EmbeddedId + MapsId
            rel.setTaiKhoan(tk);
            rel.setRole(role);
            taiKhoanVaiTroAdminRepository.save(rel);
        }

        return roles;
    }

    /**
     * Generate ID_TK mới dạng TK + 8 ký tự chữ số/chữ hoa, ví dụ: TKMI9RZ1ZU
     * Phù hợp nvarchar(10) và không thay đổi schema.
     */
    private String generateIdTk() {
        final String prefix = "TK";
        final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();

        while (true) {
            StringBuilder sb = new StringBuilder(prefix);
            for (int i = 0; i < 8; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            String candidate = sb.toString();
            if (!taiKhoanAdminRepository.existsById(candidate)) {
                return candidate;
            }
        }
    }
}
