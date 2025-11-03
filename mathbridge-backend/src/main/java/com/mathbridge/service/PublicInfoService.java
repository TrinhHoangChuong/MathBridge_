package com.mathbridge.service;

import com.mathbridge.dto.ContactDTO;
import com.mathbridge.dto.FooterCenterDTO;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PublicInfoService {

    private final CoSoService coSoService;

    public PublicInfoService(CoSoService coSoService) {
        this.coSoService = coSoService;
    }

    public ContactDTO getContact() {
        ContactDTO contact = new ContactDTO();

        // Get first center from CoSoService for main contact info
        List<FooterCenterDTO> centers = coSoService.getCentersForFooter();
        if (!centers.isEmpty()) {
            FooterCenterDTO mainCenter = centers.get(0);
            contact.setAddress(mainCenter.getAddress());
            contact.setHotline(mainCenter.getHotline());
            contact.setWorkingHours(mainCenter.getWorkingHours());
            contact.setWorkingDays(mainCenter.getWorkingDays());
        } else {
            // Fallback if no centers
            contact.setAddress("123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh");
            contact.setHotline("0901 234 567");
            contact.setWorkingHours("08:00 - 18:00");
            contact.setWorkingDays("Thứ 2 - Thứ 7");
        }

        contact.setEmail("support@mathbridge.vn");

        Map<String, String> socials = new HashMap<>();
        socials.put("facebook", "https://facebook.com/mathbridge");
        socials.put("zalo", "https://zalo.me/xxxxx");
        socials.put("instagram", "https://instagram.com/mathbridge");
        contact.setSocialLinks(socials);

        contact.setMapEmbedUrl("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.49335180467!2d106.68808427481867!3d10.773374959259985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f2fa8b0f113%3A0xdad6ef26dff6d058!2zMTIzIE5ndXnhu4VuIFbEg24gQ8OqLCBRdeG6rW4gNSwgUXXhuq1uIDUsIFRow6BuaCBwaOG7kSBHaeG6pXkgTeG7uSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrQ!5e0!3m2!1svi!2s!4v1697434322337!5m2!1svi!2s");

        contact.setCenters(centers);

        return contact;
    }
}
