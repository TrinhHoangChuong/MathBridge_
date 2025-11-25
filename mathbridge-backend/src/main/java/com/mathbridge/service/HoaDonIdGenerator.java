package com.mathbridge.service;

import com.mathbridge.repository.HoaDonRepository;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

@Component
public class HoaDonIdGenerator {

    private final HoaDonRepository hoaDonRepository;

    public HoaDonIdGenerator(HoaDonRepository hoaDonRepository) {
        this.hoaDonRepository = hoaDonRepository;
    }

    public synchronized String nextId() {
        // Thử nhiều lần để đảm bảo ID chưa tồn tại
        for (int attempt = 0; attempt < 5; attempt++) {
            String candidate = buildId();
            if (!hoaDonRepository.existsById(candidate)) {
                return candidate;
            }
            try {
                Thread.sleep(1);
            } catch (InterruptedException ignored) {
            }
        }
        throw new IllegalStateException("Không thể tạo ID hóa đơn mới, vui lòng thử lại.");
    }

    private String buildId() {
        long timestampPart = System.currentTimeMillis() % 1_000_000_00L; // 8 số cuối
        int randomPart = ThreadLocalRandom.current().nextInt(0, 100); // 2 số ngẫu nhiên
        String suffix = String.format("%06d%02d", timestampPart % 1_000_000L, randomPart);

        // Đảm bảo tổng chiều dài 8 ký tự cho phần suffix
        if (suffix.length() > 8) {
            suffix = suffix.substring(suffix.length() - 8);
        } else if (suffix.length() < 8) {
            suffix = String.format("%08d", Long.parseLong(suffix));
        }

        return "HD" + suffix;
    }
}

