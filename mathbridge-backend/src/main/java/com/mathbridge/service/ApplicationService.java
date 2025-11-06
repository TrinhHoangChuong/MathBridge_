package com.mathbridge.service;

import com.mathbridge.entity.UngVien;
import com.mathbridge.repository.UngVienRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ApplicationService {

    private final UngVienRepository repo;
    private final Path uploadRoot;

    public ApplicationService(UngVienRepository repo) {
        this.repo = repo;
        this.uploadRoot = Path.of("uploads", "careers");
        try {
            Files.createDirectories(uploadRoot);
        } catch (IOException e) {
            // ignore - will fail later on save
        }
    }

    public UngVien saveApplication(String name, String phone, String email, String position, String linkProfile, MultipartFile resume)
            throws IOException {
        // Validate required fields
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên không được để trống");
        }
        if (phone == null || phone.trim().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại không được để trống");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống");
        }
        if (position == null || position.trim().isEmpty()) {
            throw new IllegalArgumentException("Vị trí ứng tuyển không được để trống");
        }

        UngVien u = new UngVien();
        // generate ID_UV like UV000001 timestamp-based short id
        String generatedId = generateId();
        System.out.println("Generated ID_UV: " + generatedId);
        u.setIdUv(generatedId);
        u.setHoTen(name.trim());
        u.setSdt(phone.trim());
        u.setEmail(email.trim());
        u.setGhiChu(position.trim()); // store applied position in ghiChu
        u.setTrangThaiHoSo("Đang chờ duyệt"); // Set initial status as "Đang chờ duyệt"
        
        // Ensure relationship list is initialized (should already be done in constructor)
        // This is to avoid any potential null pointer issues
        
        if (linkProfile != null && !linkProfile.trim().isEmpty()) {
            u.setLinkProfile(linkProfile.trim());
        }

        // Handle file upload
        if (resume != null && !resume.isEmpty()) {
            try {
                String original = resume.getOriginalFilename();
                String sanitized = System.currentTimeMillis() + "_"
                        + (original != null ? original.replaceAll("[^a-zA-Z0-9._-]", "_") : "resume");
                Path dest = uploadRoot.resolve(sanitized);
                
                // Ensure directory exists
                Files.createDirectories(uploadRoot);
                
                Files.copy(resume.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
                // set CV_URL column - store normalized forward-slash relative path
                String storedPath = dest.toString().replace('\\', '/');
                u.setCvUrl(storedPath);
            } catch (IOException e) {
                // Log error but don't fail the entire save if file upload fails
                System.err.println("Warning: Failed to save resume file: " + e.getMessage());
                // Continue without CV_URL if file upload fails
            }
        }
        // CV_URL is now nullable, so we can leave it null if no file provided

        try {
            return repo.save(u);
        } catch (Exception e) {
            System.err.println("Error saving UngVien to database:");
            System.err.println("  - ID: " + u.getIdUv());
            System.err.println("  - Name: " + u.getHoTen());
            System.err.println("  - Email: " + u.getEmail());
            System.err.println("  - Phone: " + u.getSdt());
            System.err.println("  - CV_URL: " + u.getCvUrl());
            System.err.println("  - Exception: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("  - Cause: " + e.getCause().getMessage());
            }
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi lưu ứng viên vào database: " + e.getMessage(), e);
        }
    }

    public UngVien updateApplicationStatus(String idUv, String newStatus) {
        return repo.findById(idUv)
                .map(ungVien -> {
                    ungVien.setTrangThaiHoSo(newStatus);
                    return repo.save(ungVien);
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ứng viên với ID: " + idUv));
    }

    public UngVien getApplicationById(String idUv) {
        return repo.findById(idUv)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ứng viên với ID: " + idUv));
    }

    private String generateId() {
        // simple unique id: mili-giây của thời gian epoch (8 chữ số cuối)
        String tail = String.valueOf(System.currentTimeMillis());
        if (tail.length() > 8) tail = tail.substring(tail.length() - 8);
        return "UV" + tail;
    }
}
