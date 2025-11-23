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
        UngVien u = new UngVien();
        // generate ID_UV like UV000001 timestamp-based short id
        u.setIdUv(generateId());
        u.setHoTen(name);
        u.setSdt(phone);
        u.setEmail(email);
        u.setGhiChu(position); // store applied position in ghiChu
        u.setTrangThaiHoSo("Đang chờ duyệt"); // Set initial status as "Đang chờ duyệt"
        
        if (linkProfile != null && !linkProfile.trim().isEmpty()) {
            u.setLinkProfile(linkProfile.trim());
        }

        if (resume != null && !resume.isEmpty()) {
            String original = resume.getOriginalFilename();
            String sanitized = System.currentTimeMillis() + "_"
                    + (original != null ? original.replaceAll("[^a-zA-Z0-9._-]", "_") : "resume");
            Path dest = uploadRoot.resolve(sanitized);
            Files.copy(resume.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            // set CV_URL column - use absolute path for better portability
            u.setCvUrl(dest.toAbsolutePath().toString());
        } else {
            // Set empty string as default if no file provided (database may not allow null)
            // If database allows null, this will be null; otherwise empty string
            u.setCvUrl("");
        }

        return repo.save(u);
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
