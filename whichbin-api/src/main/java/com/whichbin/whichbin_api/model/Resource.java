package com.whichbin.whichbin_api.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    private String content;

    private String styleType;

    @ElementCollection
    @CollectionTable(
            name = "resource_sections",
            joinColumns = @JoinColumn(name = "resource_id")
    )
    private List<ResourceSection> sections;

    public Resource() {
    }

    public Resource(
            String title,
            String description,
            String content,
            String styleType,
            List<ResourceSection> sections
    ) {
        this.title = title;
        this.description = description;
        this.content = content;
        this.styleType = styleType;
        this.sections = sections;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getStyleType() {
        return styleType;
    }

    public void setStyleType(String styleType) {
        this.styleType = styleType;
    }

    public List<ResourceSection> getSections() {
        return sections;
    }

    public void setSections(List<ResourceSection> sections) {
        this.sections = sections;
    }
}

