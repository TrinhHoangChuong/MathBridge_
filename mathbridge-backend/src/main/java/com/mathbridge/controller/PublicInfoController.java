package com.mathbridge.controller;

import com.mathbridge.dto.ContactDTO;
import com.mathbridge.dto.LienHeTuVanDTO;
import com.mathbridge.service.PublicInfoService;
import com.mathbridge.service.LienHeTuVanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicInfoController {

    private final PublicInfoService publicInfoService;
    private final LienHeTuVanService lienHeTuVanService;

    public PublicInfoController(PublicInfoService publicInfoService, LienHeTuVanService lienHeTuVanService) {
        this.publicInfoService = publicInfoService;
        this.lienHeTuVanService = lienHeTuVanService;
    }

    @GetMapping("/contact")
    public ContactDTO contact() {
        return publicInfoService.getContact();
    }

    @PostMapping("/contact")
    public ResponseEntity<String> submitContact(@RequestBody LienHeTuVanDTO contactRequest) {
        try {
            lienHeTuVanService.saveContactRequest(contactRequest);
            return ResponseEntity.ok("Liên hệ của bạn đã được gửi thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại.");
        }
    }
}
