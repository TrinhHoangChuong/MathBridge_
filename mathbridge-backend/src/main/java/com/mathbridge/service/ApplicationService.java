package com.mathbridge.service;

import com.mathbridge.entity.UngVien;
import com.mathbridge.repository.UngVienRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;

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

    public UngVien saveApplication(String name, String phone, String email, String position, MultipartFile resume)
            throws IOException {
        UngVien u = new UngVien();
        u.setHoTen(name);
        u.setSdt(phone);
        u.setEmail(email);
        u.setGhiChu(position); // store applied position in ghiChu or set LinkProfile field; schema doesn't
                               // have vi_tri for UngVien
        u.setCreatedAt(LocalDateTime.now());

        if (resume != null && !resume.isEmpty()) {
            String original = resume.getOriginalFilename();
            String sanitized = System.currentTimeMillis() + "_"
                    + (original != null ? original.replaceAll("[^a-zA-Z0-9._-]", "_") : "resume");
            Path dest = uploadRoot.resolve(sanitized);
            Files.copy(resume.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            // set CV_URL column
            u.setCvUrl(dest.toString());
        }

        return repo.save(u);
    }
}
