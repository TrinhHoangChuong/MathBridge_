package com.mathbridge.service;

import com.mathbridge.dto.AboutDTO;
import com.mathbridge.dto.CardDTO;
import com.mathbridge.dto.ContactDTO;
import com.mathbridge.dto.SectionDTO;
import com.mathbridge.dto.FooterCenterDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PublicInfoService {

    private final CoSoService coSoService;

    public PublicInfoService(CoSoService coSoService) {
        this.coSoService = coSoService;
    }

    public AboutDTO getAbout() {
        AboutDTO about = new AboutDTO();
        about.setTitle("MathBridge – Cầu nối Toán học quốc tế");
        about.setSubtitle("Chúng tôi đồng hành cùng học sinh Việt Nam chinh phục Toán học theo chương trình quốc tế");
        about.setHeroImageUrl("/assets/img/about/hero.jpg");
        about.setIntroHtml("<p>Chúng tôi đồng hành cùng học sinh Việt Nam chinh phục Toán học theo chương trình Cambridge, IB, AP và Toán nâng cao Việt Nam.</p>");

        List<SectionDTO> sections = new ArrayList<>();
        sections.add(new SectionDTO("Sứ mệnh & Giá trị cốt lõi",
                "<ul><li>Truyền cảm hứng học Toán – Giúp học sinh yêu thích, chủ động và sáng tạo trong học tập.</li><li>Phát triển tư duy toàn diện – Tư duy logic, phản biện, và kỹ năng giải quyết vấn đề.</li><li>Cam kết chất lượng – Giảng dạy theo chuẩn quốc tế, theo sát tiến trình học của từng em.</li></ul>",
                "/assets/img/about/mission.jpg",
                "right"));
        about.setSections(sections);

        List<CardDTO> commitments = new ArrayList<>();
        commitments.add(new CardDTO("Chất lượng giảng dạy", "Áp dụng phương pháp giảng dạy hiện đại, cá nhân hóa chương trình phù hợp học sinh.", "teaching"));
        commitments.add(new CardDTO("Hỗ trợ 24/7", "Đội ngũ tư vấn luôn sẵn sàng giải đáp thắc mắc.", "support"));
        commitments.add(new CardDTO("Đổi mới liên tục", "Không ngừng cập nhật nội dung và công nghệ để mang trải nghiệm học tập tốt nhất.", "innovation"));
        about.setCommitments(commitments);

        List<CardDTO> features = new ArrayList<>();
        features.add(new CardDTO("Đội ngũ giáo viên", "Giáo trình theo chuẩn quốc tế", "team"));
        about.setFeatures(features);

        return about;
    }

    public ContactDTO getContact() {
        ContactDTO contact = new ContactDTO();
        contact.setAddress("123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh");
        contact.setHotline("0901 234 567");
        contact.setEmail("support@mathbridge.vn");
        contact.setWorkingHours("08:00 - 18:00");
        contact.setWorkingDays("Thứ 2 - Thứ 7");

        Map<String, String> socials = new HashMap<>();
        socials.put("facebook", "https://facebook.com/mathbridge");
        socials.put("zalo", "https://zalo.me/xxxxx");
        socials.put("instagram", "https://instagram.com/mathbridge");
        contact.setSocialLinks(socials);

        contact.setMapEmbedUrl("https://www.google.com/maps/embed?pb=...");

        // include centers from CoSoService
        List<FooterCenterDTO> centers = coSoService.getCentersForFooter();
        contact.setCenters(centers);

        return contact;
    }
}
