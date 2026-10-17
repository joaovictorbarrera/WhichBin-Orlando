package com.whichbin.whichbin_api.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trivia_challenges")
public class TriviaChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    @Column(nullable = false)
    private boolean active = false;

    @OneToMany(
            mappedBy = "challenge",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonManagedReference
    private List<TriviaQuestion> questions = new ArrayList<>();

    public TriviaChallenge() {
    }

    public TriviaChallenge(String title, String description) {
        this.title = title;
        this.description = description;
        this.active = false;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<TriviaQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<TriviaQuestion> questions) {
        this.questions = questions;
    }
}