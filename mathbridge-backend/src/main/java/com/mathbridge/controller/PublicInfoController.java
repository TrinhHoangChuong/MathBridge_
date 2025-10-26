package com.mathbridge.controller;

import com.mathbridge.dto.AboutDTO;
import com.mathbridge.dto.ContactDTO;
import com.mathbridge.service.PublicInfoService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicInfoController {

    private final PublicInfoService publicInfoService;

    public PublicInfoController(PublicInfoService publicInfoService) {
        this.publicInfoService = publicInfoService;
    }

    @GetMapping("/about")
    public AboutDTO about() {
        return publicInfoService.getAbout();
    }

    @GetMapping("/contact")
    public ContactDTO contact() {
        return publicInfoService.getContact();
    }
}
