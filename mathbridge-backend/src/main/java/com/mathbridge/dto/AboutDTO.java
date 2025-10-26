package com.mathbridge.dto;

import java.util.List;

public class AboutDTO {
    private String title;
    private String subtitle;
    private String heroImageUrl;
    private String introHtml;
    private List<SectionDTO> sections;
    private List<CardDTO> commitments;
    private List<CardDTO> features;

    public AboutDTO() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getHeroImageUrl() { return heroImageUrl; }
    public void setHeroImageUrl(String heroImageUrl) { this.heroImageUrl = heroImageUrl; }

    public String getIntroHtml() { return introHtml; }
    public void setIntroHtml(String introHtml) { this.introHtml = introHtml; }

    public List<SectionDTO> getSections() { return sections; }
    public void setSections(List<SectionDTO> sections) { this.sections = sections; }

    public List<CardDTO> getCommitments() { return commitments; }
    public void setCommitments(List<CardDTO> commitments) { this.commitments = commitments; }

    public List<CardDTO> getFeatures() { return features; }
    public void setFeatures(List<CardDTO> features) { this.features = features; }
}