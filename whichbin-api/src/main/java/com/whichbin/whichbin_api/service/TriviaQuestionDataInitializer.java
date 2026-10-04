package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.model.TriviaChallenge;
import com.whichbin.whichbin_api.model.TriviaQuestion;
import com.whichbin.whichbin_api.repository.TriviaChallengeRepository;
import com.whichbin.whichbin_api.repository.TriviaQuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TriviaQuestionDataInitializer implements CommandLineRunner {

    private final TriviaQuestionRepository triviaQuestionRepository;
    private final TriviaChallengeRepository triviaChallengeRepository;

    public TriviaQuestionDataInitializer(
            TriviaQuestionRepository triviaQuestionRepository,
            TriviaChallengeRepository triviaChallengeRepository) {
        this.triviaQuestionRepository = triviaQuestionRepository;
        this.triviaChallengeRepository = triviaChallengeRepository;
    }

    @Override
    public void run(String... args) {
        seedTrivia();
    }

    private void seedTrivia() {

        TriviaChallenge challenge;

        if (triviaChallengeRepository.findAll().isEmpty()) {

            challenge = triviaChallengeRepository.save(
                    new TriviaChallenge(
                            "Recycling Basics Challenge",
                            "Test your knowledge of recycling basics."
                    )
            );

        } else {

            challenge = triviaChallengeRepository.findAll().get(0);
        }

        if (triviaQuestionRepository.findAll().isEmpty()) {

            triviaQuestionRepository.save(
                    createQuestion(
                            "Which of these items belongs in the recycling cart?",
                            "Plastic bottle",
                            "Plastic bag",
                            "Styrofoam cup",
                            "Food waste",
                            "Plastic bottle",
                            challenge
                    )
            );

            triviaQuestionRepository.save(
                    createQuestion(
                            "What should you do with a plastic container before recycling it?",
                            "Put it inside a plastic bag",
                            "Empty it and rinse it",
                            "Fill it with water",
                            "Throw it away",
                            "Empty it and rinse it",
                            challenge
                    )
            );

            triviaQuestionRepository.save(
                    createQuestion(
                            "How should cardboard boxes be prepared for recycling?",
                            "Leave them full of packing material",
                            "Put them inside a plastic bag",
                            "Flatten them",
                            "Soak them in water",
                            "Flatten them",
                            challenge
                    )
            );

            triviaQuestionRepository.save(
                    createQuestion(
                            "Which item should NOT go into the recycling cart?",
                            "Glass bottle",
                            "Aluminum can",
                            "Plastic bag",
                            "Paper",
                            "Plastic bag",
                            challenge
                    )
            );

            triviaQuestionRepository.save(
                    createQuestion(
                            "How should recyclable items be placed in the recycling cart?",
                            "Inside plastic bags",
                            "Loose",
                            "Inside cardboard boxes",
                            "Inside trash bags",
                            "Loose",
                            challenge
                    )
            );

        } else {

            for (TriviaQuestion question : triviaQuestionRepository.findAll()) {

                if (question.getChallenge() == null) {
                    question.setChallenge(challenge);
                    triviaQuestionRepository.save(question);
                }
            }
        }
    }

    private TriviaQuestion createQuestion(
            String question,
            String answerA,
            String answerB,
            String answerC,
            String answerD,
            String correctAnswer,
            TriviaChallenge challenge) {

        TriviaQuestion triviaQuestion = new TriviaQuestion(
                question,
                answerA,
                answerB,
                answerC,
                answerD,
                correctAnswer
        );

        triviaQuestion.setChallenge(challenge);

        return triviaQuestion;
    }
}