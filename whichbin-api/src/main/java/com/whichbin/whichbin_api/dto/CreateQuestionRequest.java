package com.whichbin.whichbin_api.dto;

import com.whichbin.whichbin_api.model.TriviaQuestion;

public class CreateQuestionRequest {

    private Long challengeId;
    private TriviaQuestion question;

    public CreateQuestionRequest() {
    }

    public Long getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(Long challengeId) {
        this.challengeId = challengeId;
    }

    public TriviaQuestion getQuestion() {
        return question;
    }

    public void setQuestion(TriviaQuestion question) {
        this.question = question;
    }
}