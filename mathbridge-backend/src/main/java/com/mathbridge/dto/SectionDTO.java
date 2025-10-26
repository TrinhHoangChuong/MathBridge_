package com.mathbridge.dto;

public class SectionDTO {
    private String heading;
    private String bodyHtml;
    private String imageUrl;
    private String imagePosition; // "left" or "right"

    public SectionDTO() {}

    public SectionDTO(String heading, String bodyHtml, String imageUrl, String imagePosition) {
        this.heading = heading;
        this.bodyHtml = bodyHtml;
        this.imageUrl = imageUrl;
        this.imagePosition = imagePosition;
    }

    public String getHeading() { return heading; }
    public void setHeading(String heading) { this.heading = heading; }

    public String getBodyHtml() { return bodyHtml; }
    public void setBodyHtml(String bodyHtml) { this.bodyHtml = bodyHtml; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImagePosition() { return imagePosition; }
    public void setImagePosition(String imagePosition) { this.imagePosition = imagePosition; }
}
