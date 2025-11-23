package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.TkPhanQuyenRequest;
import com.mathbridge.dto.PortalAdmin.Response.TkPhanQuyenResponse;
import com.mathbridge.entity.Role;
import com.mathbridge.entity.TaiKhoan;
import com.mathbridge.entity.TaiKhoan_VaiTro;
import com.mathbridge.entity.TaiKhoanVaiTroId;
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

        // Lấy toàn bộ tài khoản
        List<TaiKhoan> allAccounts = taiKhoanAdminRepository.findAll();

        if (allAccounts.isEmpty()) {
            return TkPhanQuyenResponse.AccountPage.builder()
                    .content(Collections.emptyList())
                    .totalElements(0)
                    .totalPages(0)
                    .page(page)
                    .size(size)
                    .build();
        }

        // Map roles cho mỗi account để filter theo Role
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
                    String lowerKeyword = keyword.toLowerCase(Locale.ROOT);
                    return idTk.toLowerCase(Locale.ROOT).contains(lowerKeyword)
                            || email.toLowerCase(Locale.ROOT).contains(lowerKeyword);
                })
                .filter(tk -> {
                    // ownerType: ALL | HS | NV | OTHER
                    if ("ALL".equalsIgnoreCase(ownerType)) return true;
                    boolean hasHs = tk.getIdHs() != null && !tk.getIdHs().isBlank();
                    boolean hasNv = tk.getIdNv() != null && !tk.getIdNv().isBlank();

                    return switch (ownerType.toUpperCase(Locale.ROOT)) {
                        case "HS" -> hasHs;
                        case "NV" -> hasNv;
                        case "OTHER" -> !hasHs && !hasNv;
                        default -> true;
                    };
                })
                .filter(tk -> {
                    if (statusFilter.isEmpty() || "ALL".equalsIgnoreCase(statusFilter)) {
                        return true;
                    }
                    String st = Optional.ofNullable(tk.getTrangThai()).orElse("");
                    return st.equalsIgnoreCase(statusFilter);
                })
                .filter(tk -> {
                    if (roleIdFilter.isEmpty()) {
                        return true;
                    }
                    List<Role> roles = rolesByAccount.getOrDefault(tk.getIdTk(), Collections.emptyList());
                    return roles.stream()
                            .anyMatch(r -> roleIdFilter.equalsIgnoreCase(r.getIdRole()));
                })
                .collect(Collectors.toList());

        long totalElements = filtered.size();
        int totalPages = (int) Math.ceil(totalElements / (double) size);
        if (totalPages == 0) {
            totalPages = 0;
            page = 0;
        } else {
            if (page >= totalPages) {
                page = totalPages - 1;
            }
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
                        "Không tìm thấy tài khoản: " + idTk
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
        String email = Optional.ofNullable(request.getEmail())
                .map(String::trim)
                .orElse("");
        if (email.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email không được để trống"
            );
        }

        String rawPassword = Optional.ofNullable(request.getPassWord())
                .map(String::trim)
                .orElse("");
        if (rawPassword.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mật khẩu không được để trống"
            );
        }

        TaiKhoan tk = new TaiKhoan();
        tk.setIdTk(generateNewAccountId("TK"));
        tk.setEmail(email);
        tk.setPassWord(rawPassword); // KHÔNG mã hóa theo yêu cầu hiện tại

        String status = Optional.ofNullable(request.getTrangThai())
                .map(String::trim)
                .orElse("ACTIVE");
        tk.setTrangThai(status);

        // Mapping HS/NV: màn hình này không dùng, nhưng nếu request có thì set luôn
        if (request.getIdHs() != null && !request.getIdHs().isBlank()) {
            tk.setIdHs(request.getIdHs());
        }
        if (request.getIdNv() != null && !request.getIdNv().isBlank()) {
            tk.setIdNv(request.getIdNv());
        }

        tk.setThoiDiemTao(Optional.ofNullable(tk.getThoiDiemTao())
                .orElse(LocalDateTime.now()));

        taiKhoanAdminRepository.save(tk);

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
                        "Không tìm thấy tài khoản: " + idTk
                ));

        if (request.getEmail() != null) {
            String email = request.getEmail().trim();
            if (email.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Email không được để trống"
                );
            }
            tk.setEmail(email);
        }

        if (request.getTrangThai() != null) {
            String status = request.getTrangThai().trim();
            if (!status.isEmpty()) {
                tk.setTrangThai(status);
            }
        }

        if (request.getPassWord() != null) {
            String rawPassword = request.getPassWord().trim();
            if (!rawPassword.isEmpty()) {
                tk.setPassWord(rawPassword); // KHÔNG mã hóa theo yêu cầu hiện tại
            }
        }

        // Mặc định không chỉnh sửa mapping HS/NV từ màn hình này nên bỏ qua
        // Nếu muốn bật cho API dùng thì có thể set tương tự createAccount.

        taiKhoanAdminRepository.save(tk);

        List<Role> roles = applyRolesForAccount(tk, request.getRoleIds());

        return toAccountDto(tk, roles);
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
                    String idRole = Optional.ofNullable(role.getIdRole()).orElse("");
                    String tenVaiTro = Optional.ofNullable(role.getTenVaiTro()).orElse("");
                    String lowerKeyword = keyword.toLowerCase(Locale.ROOT);
                    return idRole.toLowerCase(Locale.ROOT).contains(lowerKeyword)
                            || tenVaiTro.toLowerCase(Locale.ROOT).contains(lowerKeyword);
                })
                .collect(Collectors.toList());

        long totalElements = filtered.size();
        int totalPages = (int) Math.ceil(totalElements / (double) size);
        if (totalPages == 0) {
            totalPages = 0;
            page = 0;
        } else {
            if (page >= totalPages) {
                page = totalPages - 1;
            }
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
        String idRole = Optional.ofNullable(request.getIdRole())
                .map(String::trim)
                .orElse("");
        String tenVaiTro = Optional.ofNullable(request.getTenVaiTro())
                .map(String::trim)
                .orElse("");

        if (idRole.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "ID_Role không được để trống"
            );
        }
        if (tenVaiTro.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên vai trò không được để trống"
            );
        }

        if (roleAdminRepository.existsById(idRole)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "ID_Role đã tồn tại: " + idRole
            );
        }

        Role role = new Role();
        role.setIdRole(idRole);
        role.setTenVaiTro(tenVaiTro);
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
                        "Không tìm thấy role: " + idRole
                ));

        if (request.getTenVaiTro() != null) {
            String tenVaiTro = request.getTenVaiTro().trim();
            if (!tenVaiTro.isEmpty()) {
                role.setTenVaiTro(tenVaiTro);
            }
        }

        if (request.getGhiChu() != null) {
            role.setGhiChu(request.getGhiChu().trim());
        }

        roleAdminRepository.save(role);

        return toRoleDto(role);
    }

    @Override
    public void deleteRole(String idRole) {
        Role role = roleAdminRepository.findById(idRole)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy role: " + idRole
                ));

        try {
            roleAdminRepository.delete(role);
        } catch (DataIntegrityViolationException ex) {
            // Nếu bị FK constraint (đang có account dùng role này)
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể xóa vai trò đang được sử dụng"
            );
        }
    }

    // =========================================================
    // HELPER
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
     * - Xóa mapping cũ trong TaiKhoan_VaiTro
     * - Tạo mapping mới theo list roleIds
     */
    private List<Role> applyRolesForAccount(TaiKhoan tk, List<String> roleIds) {
        // Xóa mapping cũ
        List<TaiKhoan_VaiTro> oldRelations =
                taiKhoanVaiTroAdminRepository.findByTaiKhoan_IdTk(tk.getIdTk());
        if (!oldRelations.isEmpty()) {
            taiKhoanVaiTroAdminRepository.deleteAll(oldRelations);
        }

        // Không chọn role nào thì thôi
        if (roleIds == null || roleIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Lấy Role từ DB theo danh sách roleIds
        List<Role> roles = roleAdminRepository.findAllById(roleIds);

        // Tạo list mapping mới
        List<TaiKhoan_VaiTro> newRelations = roles.stream()
                .map(role -> {
                    TaiKhoan_VaiTro rel = new TaiKhoan_VaiTro();

                    // Gán composite key cho entity mapping với bảng TaiKhoan_VaiTro
                    TaiKhoanVaiTroId id = new TaiKhoanVaiTroId();
                    id.setIdTk(tk.getIdTk());           // map với cột [ID_TK]
                    id.setIdRole(role.getIdRole());     // map với cột [ID_Role]
                    rel.setId(id);

                    // Gán reference đến TaiKhoan & Role
                    rel.setTaiKhoan(tk);
                    rel.setRole(role);

                    return rel;
                })
                .collect(Collectors.toList());

        taiKhoanVaiTroAdminRepository.saveAll(newRelations);

        return roles;
    }

    /**
     * Sinh ID_TK mới dạng prefix + chuỗi số ngẫu nhiên,
     * đảm bảo không trùng với bất kỳ TaiKhoan hiện có.
     */
    private String generateNewAccountId(String prefix) {
        String chars = "0123456789";
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
