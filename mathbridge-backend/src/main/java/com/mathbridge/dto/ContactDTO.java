package com.mathbridge.dto;

import java.util.List;
import java.util.Map;

public class ContactDTO {
    private String address;
    private String hotline;
    private String email;
    private String workingHours;
    private String workingDays;
    private Map<String, String> socialLinks;
    private String mapEmbedUrl;
    private List<FooterCenterDTO> centers;

    public ContactDTO() {}

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getHotline() { return hotline; }
    public void setHotline(String hotline) { this.hotline = hotline; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getWorkingHours() { return workingHours; }
    public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }

    public String getWorkingDays() { return workingDays; }
    public void setWorkingDays(String workingDays) { this.workingDays = workingDays; }

    public Map<String, String> getSocialLinks() { return socialLinks; }
    public void setSocialLinks(Map<String, String> socialLinks) { this.socialLinks = socialLinks; }

    public String getMapEmbedUrl() { return mapEmbedUrl; }
    public void setMapEmbedUrl(String mapEmbedUrl) { this.mapEmbedUrl = mapEmbedUrl; }

    public List<FooterCenterDTO> getCenters() { return centers; }
    public void setCenters(List<FooterCenterDTO> centers) { this.centers = centers; }
}
