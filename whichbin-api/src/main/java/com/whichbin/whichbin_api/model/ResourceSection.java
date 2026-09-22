package com.whichbin.whichbin_api.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class ResourceSection {

    private String heading;

    private String styleType;

    private String items;

    public ResourceSection() {
    }

    public ResourceSection(String heading, String styleType, String items) {
        this.heading = heading;
        this.styleType = styleType;
        this.items = items;
    }

    public String getHeading() {
        return heading;
    }

    public void setHeading(String heading) {
        this.heading = heading;
    }

    public String getStyleType() {
        return styleType;
    }

    public void setStyleType(String styleType) {
        this.styleType = styleType;
    }

    public String getItems() {
        return items;
    }

    public void setItems(String items) {
        this.items = items;
    }
}