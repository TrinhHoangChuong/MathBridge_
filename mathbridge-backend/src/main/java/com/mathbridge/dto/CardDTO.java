package com.mathbridge.dto;

public class CardDTO {
    private String title;
    private String description;
    private String icon; // optional icon name or url

    public CardDTO() {}

    public CardDTO(String title, String description, String icon) {
        this.title = title;
        this.description = description;
        this.icon = icon;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
