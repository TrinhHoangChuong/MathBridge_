package com.mathbridge.dto;

public class FooterCenterDTO {
    private String id;
    private String name;
    private String address;
    private String hotline;
    private String workingHours;
    private String workingDays;

    public FooterCenterDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getHotline() { return hotline; }
    public void setHotline(String hotline) { this.hotline = hotline; }

    public String getWorkingHours() { return workingHours; }
    public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }

    public String getWorkingDays() { return workingDays; }
    public void setWorkingDays(String workingDays) { this.workingDays = workingDays; }
}
